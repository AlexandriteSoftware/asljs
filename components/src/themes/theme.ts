export type ThemeTemplateFactory<
    TComponent extends HTMLElement = HTMLElement
  > = (
      component: TComponent
    ) => string | HTMLTemplateElement | null | undefined;

export type ThemeTemplateValue<
    TComponent extends HTMLElement = HTMLElement
  > =
  | string
  | HTMLTemplateElement
  | ThemeTemplateFactory<TComponent>
  | null
  | undefined;

export type ThemeTextFactory<
    TComponent extends HTMLElement = HTMLElement
  > = (
      component: TComponent
    ) => string | null | undefined;

export type ThemeTextValue<
    TComponent extends HTMLElement = HTMLElement
  > =
  | string
  | ThemeTextFactory<TComponent>
  | null
  | undefined;

export interface ListThemeDefinition {
  container?: ThemeTemplateValue;
  empty?: ThemeTemplateValue;
  item?: ThemeTemplateValue;
}

export interface TextInputThemeDefinition {
  template?: ThemeTemplateValue;
}

export interface ButtonThemeDefinition {
  className?: ThemeTextValue;
  addIcon?: ThemeTextValue;
  deleteIcon?: ThemeTextValue;
}

export interface ComponentsTheme {
  button?: ButtonThemeDefinition;
  list?: ListThemeDefinition;
  textInput?: TextInputThemeDefinition;
}

export interface ThemeProviderLike extends Element {
  theme: ComponentsTheme | null;
}

export const THEME_PROVIDER_TAG_NAME =
  'asljs-theme-provider';

export const THEME_CHANGED_EVENT_NAME =
  'asljs-theme-changed';

let defaultTheme: ComponentsTheme = {};

export function getDefaultTheme(
  ): ComponentsTheme
{
  return defaultTheme;
}

export function setDefaultTheme(
    theme: ComponentsTheme | null | undefined
  ): void
{
  defaultTheme = theme ?? {};
}

export function findThemeProvider(
    element: Element
  ): ThemeProviderLike | null
{
  return element.closest(THEME_PROVIDER_TAG_NAME) as ThemeProviderLike | null;
}

export function resolveThemeTemplate(
    source: ThemeTemplateValue,
    component: HTMLElement
  ): HTMLTemplateElement | null
{
  if (source === null
      || source === undefined)
  {
    return null;
  }

  const resolvedSource =
    typeof source === 'function'
      ? source(component)
      : source;

  if (resolvedSource === null
      || resolvedSource === undefined)
  {
    return null;
  }

  if (typeof resolvedSource === 'string') {
    const template =
      document.createElement('template');

    template.innerHTML = resolvedSource;

    return template;
  }

  const template =
    document.createElement('template');

  template.content.append(
    resolvedSource.content.cloneNode(true));

  return template;
}

export function resolveThemeText(
    source: ThemeTextValue,
    component: HTMLElement
  ): string | null
{
  if (source === null
      || source === undefined)
  {
    return null;
  }

  const resolvedSource =
    typeof source === 'function'
      ? source(component)
      : source;

  return resolvedSource ?? null;
}