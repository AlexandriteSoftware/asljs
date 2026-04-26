import {
    LitElement,
    css,
    html,
  } from 'lit';
import {
    customElement,
    property,
  } from 'lit/decorators.js';
import {
    unsafeHTML,
  } from 'lit/directives/unsafe-html.js';
import {
    findThemeProvider,
    getDefaultTheme,
    resolveThemeText,
    THEME_CHANGED_EVENT_NAME,
    type ButtonThemeDefinition,
    type ComponentsTheme,
    type ThemeProviderLike,
  } from '../themes/theme.js';

@customElement('asljs-button')
export class Button
  extends LitElement
{
  #themeProvider: ThemeProviderLike | null = null;

  static override styles =
    css`
      :host {
        display: inline-block;
      }

      button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .icon:empty,
      .text:empty {
        display: none;
      }
    `;

  @property({ attribute: false })
    accessor icon = '';

  @property({ attribute: false })
    accessor theme: ComponentsTheme | null = null;

  @property({ attribute: false })
    accessor text = '';

  @property({ reflect: true })
    accessor disabled = false;

  @property({ reflect: true })
    accessor type: 'button' | 'submit' | 'reset' = 'button';

  connectedCallback(): void {
    super.connectedCallback();
    this.#syncThemeProvider();
  }

  disconnectedCallback(): void {
    this.#disposeThemeProvider();
    super.disconnectedCallback();
  }

  protected get defaultIcon(): string {
    return '';
  }

  protected get themeIconKey(): keyof ButtonThemeDefinition | null {
    return null;
  }

  protected get resolvedIcon(): string {
    const themeIconKey =
      this.themeIconKey;

    if (themeIconKey !== null) {
      const themedIcon =
        resolveThemeText(
          this.theme?.button?.[themeIconKey]
          ?? this.#themeProvider?.theme?.button?.[themeIconKey]
          ?? getDefaultTheme().button?.[themeIconKey],
          this);

      if (themedIcon !== null && themedIcon !== '') {
        return themedIcon;
      }
    }

    if (this.icon !== '') {
      return this.icon;
    }

    return this.defaultIcon;
  }

  protected override updated(
      changedProperties: Map<PropertyKey, unknown>
    ): void
  {
    if (changedProperties.has('theme')) {
      this.#syncThemeProvider();
    }
  }

  override render(): ReturnType<LitElement['render']> {
    return html`
      <button
          ?disabled=${this.disabled}
          type=${this.type}>
        <span class="icon"
              aria-hidden="true">${unsafeHTML(this.resolvedIcon)}</span>
        <span class="text">${this.text}</span>
      </button>
    `;
  }

  #syncThemeProvider(): void {
    this.#disposeThemeProvider();
    this.#themeProvider =
      findThemeProvider(this);

    this.#themeProvider?.addEventListener(
      THEME_CHANGED_EVENT_NAME,
      this.#handleThemeChanged);
  }

  #disposeThemeProvider(): void {
    this.#themeProvider?.removeEventListener(
      THEME_CHANGED_EVENT_NAME,
      this.#handleThemeChanged);
    this.#themeProvider = null;
  }

  #handleThemeChanged = (): void => {
    this.requestUpdate();
  };
}