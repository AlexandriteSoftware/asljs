import {
    type ComponentsTheme,
    THEME_CHANGED_EVENT_NAME,
  } from './theme.js';

const ThemeProviderBase =
  (globalThis.HTMLElement
    ?? class {
    }) as typeof HTMLElement;

export class ThemeProvider
  extends ThemeProviderBase
{
  #theme: ComponentsTheme | null = null;

  get theme(
    ): ComponentsTheme | null
  {
    return this.#theme;
  }

  set theme(
      value: ComponentsTheme | null
    )
  {
    if (this.#theme === value) {
      return;
    }

    this.#theme = value ?? null;

    if (typeof Event === 'function'
        && 'dispatchEvent' in this)
    {
      this.dispatchEvent(
        new Event(
          THEME_CHANGED_EVENT_NAME,
          { bubbles: false }));
    }
  }
}

if (globalThis.customElements
    && !customElements.get('asljs-theme-provider'))
{
  customElements.define(
    'asljs-theme-provider',
    ThemeProvider);
}