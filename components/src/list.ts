import { bindDataModel }
  from 'asljs-data-binding';
import { asEventfulLike,
         EventfulLike }
  from 'asljs-eventful';
import { html,
         LitElement,
         nothing }
  from 'lit';
import { customElement,
         property }
  from 'lit/decorators.js';
import { ComponentModelDefinition }
  from './abstractions/model.js';
import { ComponentsTheme,
         findThemeProvider,
         getDefaultTheme,
         resolveThemeTemplate,
         THEME_CHANGED_EVENT_NAME,
         ThemeProviderLike }
  from './themes/theme.js';

type ListSlotName =
  | 'container'
  | 'empty'
  | 'item';

export type ListRowContext = {
  item: ListItem;
  index: number;
  context: unknown;
  first: boolean;
  last: boolean;
  odd: boolean;
  even: boolean;
  count: number;
};

export type ListItem = Record<string, unknown>;

export type ListItemsSource = ListItem[];

export const ListModelDefinition: ComponentModelDefinition =
  {
  name: 'ListModelDefinition',
  title: 'List',
  properties: [{
    name: 'items',
    title: 'Items',
    type: 'array',
    description: 'Rows rendered by the list.'
  }, {
    name: 'context',
    title: 'Context',
    type: 'object',
    description: 'Shared row binding context.'
  }, {
    name: 'theme',
    title: 'Theme',
    type: 'object',
    description: 'Per-instance components theme override.'
  }]
};

@customElement('asljs-list')
export class List extends LitElement
{
  #containerTemplate: HTMLTemplateElement | null = null;
  #emptyTemplate: HTMLTemplateElement | null = null;
  #itemTemplate: HTMLTemplateElement | null = null;
  #itemBindingDisposers: Array<() => void> = [];
  #itemsObserverDispose: (() => void) | null = null;
  #themeProvider: ThemeProviderLike | null = null;
  #warnedMissingItemTemplate = false;
  #warnedInvalidContainer = false;

  #handleThemeChanged = (): void =>
  {
    this.requestUpdate();
  };

  @property(
    { attribute: false }
  )
  accessor items: ListItemsSource = [];

  @property(
    { attribute: false }
  )
  accessor context: unknown = undefined;

  @property(
    { attribute: false }
  )
  accessor theme: ComponentsTheme | null = null;

  createRenderRoot(): this
  {
    return this;
  }

  connectedCallback(): void
  {
    super.connectedCallback();
    this.#captureTemplates();
    this.#syncItemsObserver();
    this.#syncThemeProvider();
  }

  disconnectedCallback(): void
  {
    this.#disposeItemsObserver();
    this.#disposeItemBindings();
    this.#disposeThemeProvider();
    super.disconnectedCallback();
  }

  render(): ReturnType<LitElement['render']>
  {
    const emptyTemplate =
      this.#resolveTemplate('empty');

    const itemTemplate =
      this.#resolveTemplate('item');

    const containerTemplate =
      this.#resolveTemplate('container');

    if (this.items.length === 0) {
      if (emptyTemplate) {
        return html`
          <div data-role="empty-template-host"></div>
        `;
      }

      return nothing;
    }

    if (!itemTemplate) {
      return nothing;
    }

    if (containerTemplate) {
      return html`
        <div data-role="container-template-host"></div>
      `;
    }

    return html`
      <div data-role="default-container-host">
      </div>
    `;
  }

  updated(
    changedProperties: Map<PropertyKey, unknown>
  ): void
  {
    if (changedProperties.has('items')) {
      this.#syncItemsObserver();
    }

    if (changedProperties.has('theme')) {
      this.#syncThemeProvider();
    }

    this.#renderTemplateContent();
  }

  #captureTemplates(): void
  {
    this.#containerTemplate = null;
    this.#emptyTemplate = null;
    this.#itemTemplate = null;
    this.#warnedMissingItemTemplate = false;
    this.#warnedInvalidContainer = false;

    const templateElements =
      this.querySelectorAll(
        'template[data-slot]');

    for (const item of templateElements) {
      const templateElement =
        item as HTMLTemplateElement;

      const slotName =
        templateElement.getAttribute('data-slot');

      const clonedTemplate =
        document.createElement('template');

      clonedTemplate.content.append(
        templateElement.content.cloneNode(true)
      );

      if (slotName === 'empty') {
        this.#emptyTemplate = clonedTemplate;
      }

      if (slotName === 'item') {
        this.#itemTemplate = clonedTemplate;
      }

      if (slotName === 'container') {
        this.#containerTemplate = clonedTemplate;
      }
    }
  }

  #renderTemplateContent(): void
  {
    this.#renderEmptyTemplate();
    this.#renderItemTemplates();
  }

  #renderEmptyTemplate(): void
  {
    const emptyTemplate =
      this.#resolveTemplate('empty');

    if (!emptyTemplate || this.items.length > 0) {
      return;
    }

    const host =
      this.querySelector(
        '[data-role="empty-template-host"]');

    if (!host) {
      return;
    }

    host.replaceChildren(
      emptyTemplate.content.cloneNode(true)
    );
  }

  #renderItemTemplates(): void
  {
    this.#disposeItemBindings();

    const itemTemplate =
      this.#resolveTemplate('item');

    if (!itemTemplate || this.items.length === 0) {
      if (!itemTemplate && this.items.length > 0) {
        this.#warnMissingItemTemplate();
      }

      return;
    }

    const itemsHost =
      this.#resolveItemsHost();

    if (!itemsHost) {
      return;
    }

    const rowNodes: Node[] = [];

    const count =
      this.items.length;

    for (let index = 0; index < this.items.length; index++) {
      const item =
        this.items[index];

      const rowContext: ListRowContext =
        {
        item,
        index,
        context: this.#createRowScopeContext(
          item,
          index
        ),
        first: index === 0,
        last: index === count - 1,
        odd: index % 2 === 1,
        even: index % 2 === 0,
        count
      };

      const fragment =
        itemTemplate.content.cloneNode(true) as DocumentFragment;

      this.#bindFragmentModel(
        fragment,
        rowContext
      );

      rowNodes.push(
        ...[...fragment.childNodes]
      );
    }

    itemsHost.replaceChildren(
      ...rowNodes
    );
  }

  #resolveItemsHost(): ParentNode | null
  {
    const containerTemplate =
      this.#resolveTemplate('container');

    if (containerTemplate) {
      const containerHost =
        this.querySelector(
          '[data-role="container-template-host"]');

      if (!containerHost) {
        return null;
      }

      const fragment =
        containerTemplate.content.cloneNode(
          true) as DocumentFragment;

      const templatedItemsHost =
        fragment.querySelector(
          '[data-role="items"]');

      containerHost.replaceChildren(fragment);

      if (!templatedItemsHost) {
        this.#warnInvalidContainer();
        return null;
      }

      return templatedItemsHost;
    }

    const defaultContainerHost =
      this.querySelector(
        '[data-role="default-container-host"]');

    return defaultContainerHost;
  }

  #resolveTemplate(
    slotName: ListSlotName
  ): HTMLTemplateElement | null
  {
    return this.#getLocalTemplate(slotName)
      ?? this.#getThemeTemplate(slotName);
  }

  #getLocalTemplate(
    slotName: ListSlotName
  ): HTMLTemplateElement | null
  {
    if (slotName === 'container') {
      return this.#containerTemplate;
    }

    if (slotName === 'empty') {
      return this.#emptyTemplate;
    }

    return this.#itemTemplate;
  }

  #getThemeTemplate(
    slotName: ListSlotName
  ): HTMLTemplateElement | null
  {
    const activeTheme =
      this.theme
      ?? this.#themeProvider?.theme
      ?? getDefaultTheme();

    return resolveThemeTemplate(
      activeTheme.list?.[slotName],
      this
    );
  }

  #bindFragmentModel(
    fragment: DocumentFragment,
    model: ListRowContext
  ): void
  {
    const dispose =
      bindDataModel(
        fragment,
        model);

    this.#itemBindingDisposers.push(dispose);
  }

  #createRowScopeContext(
    item: ListItem,
    index: number
  ): unknown
  {
    if (
      this.context === null
      || this.context === undefined
      || typeof this.context !== 'object'
    ) {
      return this.context;
    }

    const baseContext =
      this.context as Record<string, unknown>;

    const rowContext =
      Object.create(baseContext) as Record<string, unknown>;

    rowContext.item = item;
    rowContext.index = index;

    for (const key of Object.keys(baseContext)) {
      const value =
        baseContext[key];

      if (typeof value === 'function') {
        rowContext[key] = value.bind(rowContext);
      }
    }

    return rowContext;
  }

  #disposeItemBindings(): void
  {
    for (const dispose of this.#itemBindingDisposers) {
      dispose();
    }

    this.#itemBindingDisposers = [];
  }

  #syncItemsObserver(): void
  {
    this.#disposeItemsObserver();

    const eventSource =
      toEventfulLike(
        this.items);

    if (!eventSource) {
      return;
    }

    const unsubscribers: Array<() => void> = [];

    const onCollectionChanged =
      (): void =>
    {
      this.requestUpdate();
    };

    for (const eventName of ['set', 'delete', 'define']) {
      const unsubscribe =
        eventSource.on(
          eventName,
          onCollectionChanged);

      unsubscribers.push(
        () =>
        {
          unsubscribe();
        }
      );
    }

    this.#itemsObserverDispose = () =>
    {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }

  #disposeItemsObserver(): void
  {
    if (this.#itemsObserverDispose) {
      this.#itemsObserverDispose();
      this.#itemsObserverDispose = null;
    }
  }

  #syncThemeProvider(): void
  {
    const nextProvider =
      this.theme
      ? null
      : findThemeProvider(
        this
      );

    if (this.#themeProvider === nextProvider) {
      return;
    }

    this.#disposeThemeProvider();

    this.#themeProvider = nextProvider;

    this.#themeProvider?.addEventListener(
      THEME_CHANGED_EVENT_NAME,
      this.#handleThemeChanged
    );
  }

  #disposeThemeProvider(): void
  {
    this.#themeProvider?.removeEventListener(
      THEME_CHANGED_EVENT_NAME,
      this.#handleThemeChanged
    );

    this.#themeProvider = null;
  }

  #warnMissingItemTemplate(): void
  {
    if (this.#warnedMissingItemTemplate) {
      return;
    }

    this.#warnedMissingItemTemplate = true;

    console.warn(
      'asljs-list: missing required template[data-slot="item"] for non-empty items.'
    );
  }

  #warnInvalidContainer(): void
  {
    if (this.#warnedInvalidContainer) {
      return;
    }

    this.#warnedInvalidContainer = true;

    console.warn(
      'asljs-list: container template must include [data-role="items"].'
    );
  }
}

function toEventfulLike(
  value: unknown
): EventfulLike | null
{
  return asEventfulLike(value)
    ?? null;
}
