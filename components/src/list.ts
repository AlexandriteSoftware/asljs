import {
    LitElement,
    html,
    nothing
  } from 'lit';
import {
    customElement,
    property
  } from 'lit/decorators.js';
import {
    bindDataModel
  } from 'asljs-data-binding';

type ObservableEventSource =
  { on: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => (() => boolean) | void; };

export type ListRowContext =
  { item: ListItem;
    index: number;
    first: boolean;
    last: boolean;
    odd: boolean;
    even: boolean;
    count: number; };

export type ListItem =
  Record<string, unknown>;

export type ListItemsSource =
  ListItem[];

@customElement('asljs-list')
export class List
  extends LitElement
{
  #containerTemplate: HTMLTemplateElement | null = null;
  #emptyTemplate: HTMLTemplateElement | null = null;
  #itemTemplate: HTMLTemplateElement | null = null;
  #itemBindingDisposers: Array<() => void> = [];
  #itemsObserverDispose: (() => void) | null = null;
  #warnedMissingItemTemplate = false;
  #warnedInvalidContainer = false;

  @property({ attribute: false })
    accessor items: ListItemsSource = [];

  createRenderRoot(
    ): this
  {
    return this;
  }

  connectedCallback(
    ): void
  {
    super.connectedCallback();
    this.#captureTemplates();
    this.#syncItemsObserver();
  }

  disconnectedCallback(
    ): void
  {
    this.#disposeItemsObserver();
    this.#disposeItemBindings();
    super.disconnectedCallback();
  }

  render(
    )
  {
    if (this.items.length === 0) {
      if (this.#emptyTemplate) {
        return html`
          <div data-role="empty-template-host"></div>
        `;
      }

      return nothing;
    }

    if (!this.#itemTemplate) {
      return nothing;
    }

    if (this.#containerTemplate) {
      return html`
        <div data-role="container-template-host"></div>
      `;
    }

    return html`
      <div class="list-group
                  ${this.classList}"
           data-role="default-container-host">
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

    this.#renderTemplateContent();
  }

  #captureTemplates(
    ): void
  {
    this.#containerTemplate = null;
    this.#emptyTemplate = null;
    this.#itemTemplate = null;
    this.#warnedMissingItemTemplate = false;
    this.#warnedInvalidContainer = false;

    const templateElements =
      this.querySelectorAll<HTMLTemplateElement>('template[data-slot]');

    for (const templateElement of templateElements) {
      const slotName =
        templateElement.getAttribute('data-slot');

      const clonedTemplate =
        document.createElement('template');

      clonedTemplate.content.append(
        templateElement.content.cloneNode(true));

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

  #renderTemplateContent(
    ): void
  {
    this.#renderEmptyTemplate();
    this.#renderItemTemplates();
  }

  #renderEmptyTemplate(
    ): void
  {
    if (!this.#emptyTemplate || this.items.length > 0) {
      return;
    }

    const host =
      this.querySelector('[data-role="empty-template-host"]');

    if (!host) {
      return;
    }

    host.replaceChildren(
      this.#emptyTemplate.content.cloneNode(true));
  }

  #renderItemTemplates(
    ): void
  {
    this.#disposeItemBindings();

    if (!this.#itemTemplate || this.items.length === 0) {
      if (!this.#itemTemplate && this.items.length > 0) {
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
        { item,
          index,
          first: index === 0,
          last: index === count - 1,
          odd: index % 2 === 1,
          even: index % 2 === 0,
          count };

      const fragment =
        this.#itemTemplate.content.cloneNode(true) as DocumentFragment;

      this.#bindFragmentModel(
        fragment,
        rowContext);

      rowNodes.push(...[ ...fragment.childNodes ]);
    }

    itemsHost.replaceChildren(...rowNodes);
  }

  #resolveItemsHost(
    ): ParentNode | null
  {
    if (this.#containerTemplate) {
      const containerHost =
        this.querySelector('[data-role="container-template-host"]');

      if (!containerHost) {
        return null;
      }

      const fragment =
        this.#containerTemplate.content.cloneNode(true) as DocumentFragment;

      const templatedItemsHost =
        fragment.querySelector('[data-role="items"]');

      containerHost.replaceChildren(fragment);

      if (!templatedItemsHost) {
        this.#warnInvalidContainer();
        return null;
      }

      return templatedItemsHost;
    }

    const defaultContainerHost =
      this.querySelector('[data-role="default-container-host"]');

    return defaultContainerHost;
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

  #disposeItemBindings(
    ): void
  {
    for (const dispose of this.#itemBindingDisposers) {
      dispose();
    }

    this.#itemBindingDisposers = [];
  }

  #syncItemsObserver(
    ): void
  {
    this.#disposeItemsObserver();

    const eventSource =
      toObservableEventSource(this.items);

    if (!eventSource) {
      return;
    }

    const unsubscribers: Array<() => void> = [];

    const onCollectionChanged =
      (): void => {
        this.requestUpdate();
      };

    for (const eventName of [ 'set', 'delete', 'define' ]) {
      const maybeUnsubscribe =
        eventSource.on(
          eventName,
          onCollectionChanged);

      if (typeof maybeUnsubscribe === 'function') {
        unsubscribers.push(() => {
          maybeUnsubscribe();
        });
      }
    }

    this.#itemsObserverDispose =
      () => {
        for (const unsubscribe of unsubscribers) {
          unsubscribe();
        }
      };
  }

  #disposeItemsObserver(
    ): void
  {
    if (this.#itemsObserverDispose) {
      this.#itemsObserverDispose();
      this.#itemsObserverDispose = null;
    }
  }

  #warnMissingItemTemplate(
    ): void
  {
    if (this.#warnedMissingItemTemplate) {
      return;
    }

    this.#warnedMissingItemTemplate = true;

    console.warn(
      'asljs-list: missing required template[data-slot="item"] for non-empty items.');
  }

  #warnInvalidContainer(
    ): void
  {
    if (this.#warnedInvalidContainer) {
      return;
    }

    this.#warnedInvalidContainer = true;

    console.warn(
      'asljs-list: container template must include [data-role="items"].');
  }
}

function toObservableEventSource(
    value: unknown
  ): ObservableEventSource | null
{
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const candidate =
    value as { on?: unknown; };

  if (typeof candidate.on !== 'function') {
    return null;
  }

  return candidate as ObservableEventSource;
}
