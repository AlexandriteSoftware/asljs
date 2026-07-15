import { css,
         html,
         LitElement }
  from 'lit';
import { customElement,
         property }
  from 'lit/decorators.js';
import { unsafeHTML }
  from 'lit/directives/unsafe-html.js';
import { ComponentModelDefinition }
  from './abstractions/model.js';
import { ButtonThemeDefinition,
         ComponentsTheme,
         findThemeProvider,
         getDefaultTheme,
         resolveThemeText,
         THEME_CHANGED_EVENT_NAME,
         ThemeProviderLike }
  from './themes/theme.js';

export const ButtonModelDefinition: ComponentModelDefinition =
  {
  name: 'ButtonModelDefinition',
  title: 'Button',
  properties: [{
    name: 'variant',
    title: 'Variant',
    type: 'string',
    description:
      'Variant key used to resolve theme defaults such as add or delete.'
  }, {
    name: 'icon',
    title: 'Icon',
    type: 'string',
    description: 'HTML markup string for the icon.'
  }, {
    name: 'buttonClassName',
    title: 'Button class name',
    type: 'string',
    description: 'Class name applied to the native button.'
  }, {
    name: 'theme',
    title: 'Theme',
    type: 'object',
    description: 'Per-instance components theme override.'
  }, {
    name: 'text',
    title: 'Text',
    type: 'string',
    description: 'Visible button label.'
  }, {
    name: 'disabled',
    title: 'Disabled',
    type: 'boolean',
    description: 'Native disabled state.'
  }, {
    name: 'type',
    title: 'Type',
    type: 'string',
    description: 'Native button type such as button, submit, or reset.'
  }]
};

@customElement('asljs-button')
export class Button extends LitElement
{
  #themeProvider: ThemeProviderLike | null = null;

  @property(
    { reflect: true }
  )
  accessor variant = '';

  @property(
    { attribute: false }
  )
  accessor icon = '';

  @property(
    { attribute: false }
  )
  accessor buttonClassName = '';

  @property(
    { attribute: false }
  )
  accessor theme: ComponentsTheme | null = null;

  @property(
    { attribute: false }
  )
  accessor text = '';

  @property(
    { reflect: true }
  )
  accessor disabled = false;

  @property(
    { reflect: true }
  )
  accessor type: 'button' | 'submit' | 'reset' = 'button';

  override createRenderRoot(): this
  {
    return this;
  }

  connectedCallback(): void
  {
    super.connectedCallback();
    this.#syncThemeProvider();
  }

  disconnectedCallback(): void
  {
    this.#disposeThemeProvider();
    super.disconnectedCallback();
  }

  protected get resolvedIcon(): string {
    if (this.icon !== '') {
      return this.icon;
    }

    const themedIcon =
      this.#resolveButtonThemeText('icon');

    if (themedIcon !== null) {
      return themedIcon;
    }

    return '';
  }

  protected get resolvedButtonClassName(): string {
    if (this.buttonClassName.trim() !== '') {
      return this.buttonClassName.trim();
    }

    return this.#resolveButtonThemeText('className')
      ?? '';
  }

  protected get resolvedText(): string {
    if (this.text !== '') {
      return this.text;
    }

    return this.#resolveButtonThemeText('text')
      ?? '';
  }

  protected override updated(
    changedProperties: Map<PropertyKey, unknown>
  ): void
  {
    if (changedProperties.has('theme')) {
      this.#syncThemeProvider();
    }
  }

  override render(): ReturnType<LitElement['render']>
  {
    return html`
      <button
          class=${this.resolvedButtonClassName}
          ?disabled=${this.disabled}
          type=${this.type}
          style="display:inline-flex;align-items:center;gap:0.5rem;">
        <span class="icon"
              ?hidden=${this.resolvedIcon === ''}
              aria-hidden="true">${
      unsafeHTML(
        this.resolvedIcon
      )
    }</span>
        <span class="text"
              ?hidden=${this.resolvedText === ''}>${this.resolvedText}</span>
      </button>
    `;
  }

  #resolveButtonThemeText(
    fieldName: 'className' | 'icon' | 'text'
  ): string | null
  {
    for (const source of this.#getButtonThemeSources()) {
      const themedVariantValue =
        this.#resolveVariantThemeText(
          source,
          fieldName);

      if (themedVariantValue !== null) {
        return themedVariantValue;
      }

      const themedBaseValue =
        resolveThemeText(
          source?.[fieldName],
          this);

      if (themedBaseValue !== null && themedBaseValue !== '') {
        return themedBaseValue;
      }
    }

    return null;
  }

  #resolveVariantThemeText(
    source: ButtonThemeDefinition | undefined,
    fieldName: 'className' | 'icon' | 'text'
  ): string | null
  {
    const variant =
      this.variant.trim();

    if (variant === '') {
      return null;
    }

    const themedVariantValue =
      resolveThemeText(
        source?.variants?.[variant]?.[fieldName],
        this);

    if (themedVariantValue === null || themedVariantValue === '') {
      return null;
    }

    return themedVariantValue;
  }

  #getButtonThemeSources(): Array<ButtonThemeDefinition | undefined>
  {
    return [
      this.theme?.button,
      this.#themeProvider?.theme?.button,
      getDefaultTheme().button
    ];
  }

  #syncThemeProvider(): void
  {
    this.#disposeThemeProvider();

    this.#themeProvider = findThemeProvider(
      this
    );

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

  #handleThemeChanged = (): void =>
  {
    this.requestUpdate();
  };
}
