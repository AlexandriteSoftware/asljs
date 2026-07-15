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

export interface ListThemeDefinition
{
  container?: ThemeTemplateValue;
  empty?: ThemeTemplateValue;
  item?: ThemeTemplateValue;
}

export interface TextInputThemeDefinition
{
  template?: ThemeTemplateValue;
  input?: ThemeTemplateValue;
  textarea?: ThemeTemplateValue;
}

export interface SelectThemeDefinition
{
  template?: ThemeTemplateValue;
  select?: ThemeTemplateValue;
}

export interface ButtonVariantThemeDefinition
{
  className?: ThemeTextValue;
  icon?: ThemeTextValue;
  text?: ThemeTextValue;
}

export interface ButtonThemeDefinition extends ButtonVariantThemeDefinition
{
  variants?: Record<string, ButtonVariantThemeDefinition | undefined>;
}

export interface ComponentsTheme
{
  button?: ButtonThemeDefinition;
  list?: ListThemeDefinition;
  textInput?: TextInputThemeDefinition;
  select?: SelectThemeDefinition;
}

export interface ThemeProviderLike extends Element
{
  theme: ComponentsTheme | null;
}

export const THEME_PROVIDER_TAG_NAME =
  'asljs-theme-provider';

export const THEME_CHANGED_EVENT_NAME =
  'asljs-theme-changed';

const PACKAGE_DEFAULT_THEME: ComponentsTheme =
  {
  button: {
    variants: {
      add: { icon: '&#xF26E;', text: 'Add' },
      delete: { icon: '&#xF5DE;', text: 'Delete' },
      settings: { icon: '&#xF3E5;', text: 'Settings' }
    }
  }
};

let defaultTheme: ComponentsTheme = {};

function mergeSection<
  TSection extends object
>(
  baseSection: TSection | undefined,
  overrideSection: TSection | undefined
): TSection | undefined
{
  if (
    baseSection === undefined
    && overrideSection === undefined
  ) {
    return undefined;
  }

  return {
    ...(baseSection ?? {}),
    ...(overrideSection ?? {})
  } as TSection;
}

function mergeButtonVariants(
  baseVariants:
    | Record<string, ButtonVariantThemeDefinition | undefined>
    | undefined,
  overrideVariants:
    | Record<string, ButtonVariantThemeDefinition | undefined>
    | undefined
): Record<string, ButtonVariantThemeDefinition | undefined> | undefined
{
  if (
    baseVariants === undefined
    && overrideVariants === undefined
  ) {
    return undefined;
  }

  const variantNames =
    new Set([
    ...Object.keys(
      baseVariants ?? {}
    ),
    ...Object.keys(
      overrideVariants ?? {}
    )
  ]);

  const mergedVariants: Record<
    string,
    ButtonVariantThemeDefinition | undefined
  > = {};

  for (const variantName of variantNames) {
    mergedVariants[variantName] = mergeSection(
      baseVariants?.[variantName],
      overrideVariants?.[variantName]
    );
  }

  return mergedVariants;
}

function mergeButtonThemeDefinition(
  baseTheme: ButtonThemeDefinition | undefined,
  overrideTheme: ButtonThemeDefinition | undefined
): ButtonThemeDefinition | undefined
{
  if (
    baseTheme === undefined
    && overrideTheme === undefined
  ) {
    return undefined;
  }

  return {
    ...(baseTheme ?? {}),
    ...(overrideTheme ?? {}),
    variants: mergeButtonVariants(
      baseTheme?.variants,
      overrideTheme?.variants
    )
  };
}

export function getDefaultTheme(): ComponentsTheme
{
  return {
    button: mergeButtonThemeDefinition(
      PACKAGE_DEFAULT_THEME.button,
      defaultTheme.button
    ),
    list: mergeSection(
      PACKAGE_DEFAULT_THEME.list,
      defaultTheme.list
    ),
    textInput: mergeSection(
      PACKAGE_DEFAULT_THEME.textInput,
      defaultTheme.textInput
    ),
    select: mergeSection(
      PACKAGE_DEFAULT_THEME.select,
      defaultTheme.select
    )
  };
}

export function setDefaultTheme(
  theme: ComponentsTheme | null | undefined
): void
{
  defaultTheme = theme ?? {};
}

export function getComponentVariantList(
  component: keyof ComponentsTheme,
  theme?: ComponentsTheme | null
): string[]
{
  // Currently only button defines named variants in the theme surface.
  const resolvedTheme =
    theme ?? getDefaultTheme();

  switch (component) {
    case 'button':
      return Object.keys(
        resolvedTheme.button?.variants ?? {}
      );
    default:
      return [];
  }
}

export function findThemeProvider(
  element: Element
): ThemeProviderLike | null
{
  return element.closest(
    THEME_PROVIDER_TAG_NAME
  ) as ThemeProviderLike | null;
}

export function resolveThemeTemplate(
  source: ThemeTemplateValue,
  component: HTMLElement
): HTMLTemplateElement | null
{
  if (
    source === null
    || source === undefined
  ) {
    return null;
  }

  const resolvedSource =
    typeof source === 'function'
    ? source(component)
    : source;

  if (
    resolvedSource === null
    || resolvedSource === undefined
  ) {
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
    resolvedSource.content.cloneNode(true)
  );

  return template;
}

export function resolveThemeText(
  source: ThemeTextValue,
  component: HTMLElement
): string | null
{
  if (
    source === null
    || source === undefined
  ) {
    return null;
  }

  const resolvedSource =
    typeof source === 'function'
    ? source(component)
    : source;

  return resolvedSource ?? null;
}
