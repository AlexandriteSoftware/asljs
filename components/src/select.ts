import {
    bindDataModel,
  } from 'asljs-data-binding';
import {
    observable,
    type Observable,
  } from 'asljs-observable';
import {
    LitElement,
    html,
  } from 'lit';
import {
    customElement,
    property,
  } from 'lit/decorators.js';
import {
    findThemeProvider,
    getDefaultTheme,
    resolveThemeTemplate,
    THEME_CHANGED_EVENT_NAME,
    type ComponentsTheme,
    type ThemeProviderLike,
  } from './themes/theme.js';

type SelectSlotName =
  'template'
  | 'select';

export interface SelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectValidator =
  (
      value: string
    ) => string | null;

export interface SelectChangeDetail {
  value: string;
  isEmpty: boolean;
  isValid: boolean;
  errorMessage: string | null;
  dirty: boolean;
}

export type SelectStatus =
  Observable<{
    draftValue: string;
    isEmpty: boolean;
    isValid: boolean;
    errorMessage: string | null;
    dirty: boolean;
  }>;

type SelectTemplateModel =
  Observable<{
    label: string;
    description: string;
    errorMessage: string;
    hideLabel: boolean;
    hideDescription: boolean;
    hideError: boolean;
    hasError: boolean;
    isEmpty: boolean;
    inputId: string;
    descriptionId: string;
    errorId: string;
  }>;

@customElement('asljs-select')
export class Select
  extends LitElement
{
  #templateElement: HTMLTemplateElement | null = null;
  #selectTemplateElement: HTMLTemplateElement | null = null;
  #templateDispose: (() => void) | null = null;
  #controlTemplateDispose: (() => void) | null = null;
  #themeProvider: ThemeProviderLike | null = null;
  #control: HTMLSelectElement | null = null;
  #controlBaseClassName = '';
  #controlInvalidClassName: string | null = null;
  #controlChangeListener: (() => void) | null = null;
  #idBase = `asljs-select-${nextSelectId++}`;
  #model: SelectTemplateModel =
    observable(
      { label: '',
        description: '',
        errorMessage: '',
        hideLabel: true,
        hideDescription: true,
        hideError: true,
        hasError: false,
        isEmpty: true,
        inputId: `${this.#idBase}-control`,
        descriptionId: `${this.#idBase}-description`,
        errorId: `${this.#idBase}-error` });

  readonly status: SelectStatus =
    observable(
      { draftValue: '',
        isEmpty: true,
        isValid: true,
        errorMessage: null,
        dirty: false });

  @property({ attribute: false })
    accessor label: string | null = null;

  @property({ attribute: false })
    accessor description: string | null = null;

  @property({ attribute: false })
    accessor validator: SelectValidator | null = null;

  @property({ attribute: false })
    accessor theme: ComponentsTheme | null = null;

  @property({ attribute: false })
    accessor value: string | null = '';

  @property({ attribute: false })
    accessor placeholder: string | null = null;

  @property({ attribute: false })
    accessor items: SelectItem[] = [];

  @property({ attribute: false })
    accessor disabled = false;

  @property({ attribute: false })
    accessor controlClassName = '';

  get draftValue(): string {
    return this.status.draftValue;
  }

  get isEmpty(): boolean {
    return this.status.isEmpty;
  }

  get isValid(): boolean {
    return this.status.isValid;
  }

  get errorMessage(): string | null {
    return this.status.errorMessage;
  }

  createRenderRoot(): this {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#captureTemplates();
    this.#syncThemeProvider();
    this.#applyExternalValue();
  }

  disconnectedCallback(): void {
    this.#disposeControlBindings();
    this.#templateDispose?.();
    this.#templateDispose = null;
    this.#controlTemplateDispose?.();
    this.#controlTemplateDispose = null;
    this.#disposeThemeProvider();
    super.disconnectedCallback();
  }

  render(): ReturnType<LitElement['render']> {
    return html`
      <div data-role="template-host"></div>
    `;
  }

  updated(
      changedProperties: Map<PropertyKey, unknown>
    ): void
  {
    if (changedProperties.has('theme')) {
      this.#syncThemeProvider();
    }

    if (changedProperties.has('value')) {
      this.#applyExternalValue();
    }

    if (changedProperties.has('label')
        || changedProperties.has('description')
        || changedProperties.has('theme'))
    {
      this.#renderTemplate();
      return;
    }

    if (changedProperties.has('placeholder')
        || changedProperties.has('disabled')
        || changedProperties.has('items')
        || changedProperties.has('controlClassName'))
    {
      this.#syncControlState();
    }

    this.#syncModelState();
  }

  #captureTemplates(): void {
    this.#templateElement =
      cloneNamedTemplate(
        this,
        'template');
    this.#selectTemplateElement =
      cloneNamedTemplate(
        this,
        'select');
  }

  #syncThemeProvider(): void {
    this.#disposeThemeProvider();
    this.#themeProvider =
      findThemeProvider(this);

    if (this.#themeProvider === null) {
      return;
    }

    this.#themeProvider.addEventListener(
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
    this.#renderTemplate();
  };

  #applyExternalValue(): void {
    this.status.draftValue = normalizeText(this.value);
    this.#syncModelState();
    this.#syncControlState();
  }

  #syncModelState(): void {
    const label =
      normalizeOptionalText(this.label);
    const description =
      normalizeOptionalText(this.description);
    const errorMessage =
      this.validator?.(this.status.draftValue) ?? null;
    const isEmpty =
      this.status.draftValue === '';
    const dirty =
      this.status.draftValue !== normalizeText(this.value);

    this.status.isEmpty = isEmpty;
    this.status.errorMessage = errorMessage;
    this.status.isValid = errorMessage === null;
    this.status.dirty = dirty;

    this.#model.label = label ?? '';
    this.#model.description = description ?? '';
    this.#model.errorMessage = errorMessage ?? '';
    this.#model.hideLabel = label === null;
    this.#model.hideDescription = description === null;
    this.#model.hideError = errorMessage === null;
    this.#model.hasError = errorMessage !== null;
    this.#model.isEmpty = isEmpty;

    this.#syncControlState();
  }

  #renderTemplate(): void {
    const templateHost =
      this.querySelector('[data-role="template-host"]') as HTMLElement | null;

    if (templateHost === null) {
      return;
    }

    this.#templateDispose?.();
    this.#templateDispose = null;
    this.#controlTemplateDispose?.();
    this.#controlTemplateDispose = null;
    this.#disposeControlBindings();

    const template =
      this.#resolveTemplate('template');

    if (template === null) {
      templateHost.replaceChildren();
      return;
    }

    const fragment =
      template.content.cloneNode(true) as DocumentFragment;

    this.#templateDispose =
      bindDataModel(
        fragment,
        this.#model as unknown as Record<string, unknown>);

    templateHost.replaceChildren(fragment);
    this.#mountControl();
    this.#syncModelState();
  }

  #resolveTemplate(
      slotName: SelectSlotName
    ): HTMLTemplateElement | null
  {
    return this.#getLocalTemplate(slotName)
      ?? this.#getThemeTemplate(slotName)
      ?? createDefaultSelectTemplate(slotName);
  }

  #getLocalTemplate(
      slotName: SelectSlotName
    ): HTMLTemplateElement | null
  {
    return slotName === 'template'
      ? this.#templateElement
      : this.#selectTemplateElement;
  }

  #getThemeTemplate(
      slotName: SelectSlotName
    ): HTMLTemplateElement | null
  {
    const theme =
      this.theme
      ?? this.#themeProvider?.theme
      ?? getDefaultTheme();

    return resolveThemeTemplate(
      slotName === 'template'
        ? theme.select?.template
        : theme.select?.select,
      this);
  }

  #mountControl(): void {
    const controlHost =
      this.querySelector('[data-role="control-host"]') as HTMLElement | null;

    if (controlHost === null) {
      return;
    }

    const mountedControl =
      this.#createMountedControl(controlHost);

    this.#controlTemplateDispose =
      bindDataModel(
        mountedControl.fragment,
        this.#model as unknown as Record<string, unknown>);

    controlHost.replaceChildren(mountedControl.fragment);
    this.#control = mountedControl.control;
    this.#controlBaseClassName = mountedControl.className;
    this.#controlInvalidClassName = mountedControl.invalidClassName;

    const changeListener =
      (): void => {
        if (this.#control === null) {
          return;
        }

        this.status.draftValue = this.#control.value;
        this.#syncModelState();
        this.#dispatchValueEvent('input');
        this.#dispatchValueEvent('change');
      };

    this.#control.addEventListener('change', changeListener);

    this.#controlChangeListener =
      () => {
        this.#control?.removeEventListener('change', changeListener);
      };

    this.#syncControlState();
  }

  #syncControlState(): void {
    const control =
      this.#control;

    if (control === null) {
      return;
    }

    control.replaceChildren();

    const placeholder =
      normalizeOptionalText(this.placeholder);

    if (placeholder !== null) {
      const option =
        document.createElement('option');

      option.value = '';
      option.textContent = placeholder;
      control.appendChild(option);
    }

    for (const item of normalizeItems(this.items)) {
      const option =
        document.createElement('option');

      option.value = item.value;
      option.textContent = item.label;
      option.disabled = item.disabled ?? false;
      control.appendChild(option);
    }

    const candidateValues =
      Array.from(control.options).map(option => option.value);
    const nextValue =
      candidateValues.includes(this.status.draftValue)
        ? this.status.draftValue
        : placeholder !== null
          ? ''
          : candidateValues[0] ?? '';

    if (this.status.draftValue !== nextValue) {
      this.status.draftValue = nextValue;
      this.#syncModelState();
    }

    control.value = nextValue;
    control.id = this.#model.inputId;
    control.disabled = this.disabled;
    control.className = joinClassNames(
      this.#controlBaseClassName,
      this.controlClassName);

    if (this.#controlInvalidClassName !== null && !this.status.isValid) {
      control.classList.add(this.#controlInvalidClassName);
    }

    control.toggleAttribute('aria-invalid', !this.status.isValid);
    control.setAttribute(
      'aria-describedby',
      resolveAriaDescribedBy(this.#model));
  }

  #createMountedControl(
      controlHost: HTMLElement
    ): MountedSelectControl
  {
    const template =
      this.#resolveTemplate('select');

    if (template === null) {
      return createFallbackMountedControl(controlHost);
    }

    const fragment =
      template.content.cloneNode(true) as DocumentFragment;
    const control =
      fragment.querySelector('select');

    if (control === null) {
      return createFallbackMountedControl(controlHost);
    }

    return {
      fragment,
      control,
      className: resolveInitialControlClassName(control, controlHost),
      invalidClassName: resolveInitialControlInvalidClassName(control, controlHost),
    };
  }

  #dispatchValueEvent(
      name: 'input' | 'change'
    ): void
  {
    const detail: SelectChangeDetail =
      { value: this.status.draftValue,
        isEmpty: this.status.isEmpty,
        isValid: this.status.isValid,
        errorMessage: this.status.errorMessage,
        dirty: this.status.dirty };

    this.dispatchEvent(
      new CustomEvent(
        name,
        { detail,
          bubbles: true,
          composed: true }));
  }

  #disposeControlBindings(): void {
    this.#controlChangeListener?.();
    this.#controlChangeListener = null;
    this.#control = null;
    this.#controlBaseClassName = '';
    this.#controlInvalidClassName = null;
    this.#controlTemplateDispose?.();
    this.#controlTemplateDispose = null;
  }
}

let nextSelectId = 1;

type MountedSelectControl =
  { fragment: DocumentFragment;
    control: HTMLSelectElement;
    className: string;
    invalidClassName: string | null; };

function normalizeText(
    value: string | null | undefined
  ): string
{
  return value ?? '';
}

function normalizeOptionalText(
    value: string | null | undefined
  ): string | null
{
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return value;
}

function normalizeItems(
    items: SelectItem[]
  ): SelectItem[]
{
  return items
    .map(item => ({
      value: item.value,
      label: item.label,
      disabled: item.disabled ?? false,
    }))
    .filter(item => item.label.trim() !== '');
}

function resolveAriaDescribedBy(
    model: SelectTemplateModel
  ): string
{
  const ids: string[] = [];

  if (!model.hideDescription) {
    ids.push(model.descriptionId);
  }

  if (!model.hideError) {
    ids.push(model.errorId);
  }

  return ids.join(' ');
}

function cloneNamedTemplate(
    host: Element,
    slotName: SelectSlotName
  ): HTMLTemplateElement | null
{
  const templateElement =
    host.querySelector<HTMLTemplateElement>(`template[data-slot="${slotName}"]`);

  if (templateElement === null) {
    return null;
  }

  const clonedTemplate =
    document.createElement('template');

  clonedTemplate.content.append(
    templateElement.content.cloneNode(true));

  return clonedTemplate;
}

function resolveInitialControlClassName(
    control: HTMLSelectElement,
    controlHost: HTMLElement
  ): string
{
  return control.className
    || controlHost.getAttribute('data-control-class')
    || '';
}

function resolveInitialControlInvalidClassName(
    control: HTMLSelectElement,
    controlHost: HTMLElement
  ): string | null
{
  return control.getAttribute('data-control-invalid-class')
    ?? controlHost.getAttribute('data-control-invalid-class')
    ?? null;
}

function createDefaultSelectTemplate(
    slotName: SelectSlotName
  ): HTMLTemplateElement
{
  const template =
    document.createElement('template');

  template.innerHTML =
    slotName === 'template'
      ? `
          <div>
            <label
                   data-bind-text="label"
                   data-bind-prop-hidden="hideLabel"
                   data-bind-prop-for="inputId"></label>
            <div data-role="control-host"></div>
            <div
                 data-bind-text="description"
                 data-bind-prop-hidden="hideDescription"
                 data-bind-prop-id="descriptionId"></div>
            <div
                 data-bind-text="errorMessage"
                 data-bind-prop-hidden="hideError"
                 data-bind-prop-id="errorId"></div>
          </div>
        `
      : '<select></select>';

  return template;
}

function createFallbackMountedControl(
    controlHost: HTMLElement
  ): MountedSelectControl
{
  const fragment =
    document.createDocumentFragment();
  const control =
    document.createElement('select');

  fragment.append(control);

  return {
    fragment,
    control,
    className: resolveInitialControlClassName(control, controlHost),
    invalidClassName: resolveInitialControlInvalidClassName(control, controlHost),
  };
}

function joinClassNames(
    ...classNames: string[]
  ): string
{
  return classNames
    .flatMap(className => className.split(/\s+/))
    .map(className => className.trim())
    .filter(className => className !== '')
    .join(' ');
}