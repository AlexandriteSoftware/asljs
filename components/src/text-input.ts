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
    resolveThemeTemplate,
    THEME_CHANGED_EVENT_NAME,
    type ComponentsTheme,
    type ThemeProviderLike,
  } from './themes/theme.js';

type TextInputSlotName =
  'template';

export type TextInputEnterKeyBehavior =
  'finish'
  | 'newline';

export type TextInputValidator =
  (
      value: string
    ) => string | null;

export interface TextInputChangeDetail {
  value: string;
  isEmpty: boolean;
  isValid: boolean;
  errorMessage: string | null;
  dirty: boolean;
}

export type TextInputStatus =
  Observable<{
    draftValue: string;
    isEmpty: boolean;
    isValid: boolean;
    errorMessage: string | null;
    dirty: boolean;
  }>;

type TextInputTemplateModel =
  Observable<{
    label: string;
    description: string;
    errorMessage: string;
    hideLabel: boolean;
    hideDescription: boolean;
    hideError: boolean;
    hasError: boolean;
    isEmpty: boolean;
    multiline: boolean;
    inputId: string;
    descriptionId: string;
    errorId: string;
  }>;

@customElement('asljs-text-input')
export class TextInput
  extends LitElement
{
  #templateElement: HTMLTemplateElement | null = null;
  #templateDispose: (() => void) | null = null;
  #themeProvider: ThemeProviderLike | null = null;
  #control: HTMLInputElement | HTMLTextAreaElement | null = null;
  #controlInputListener: (() => void) | null = null;
  #controlBlurListener: (() => void) | null = null;
  #controlKeydownListener: (() => void) | null = null;
  #skipNextBlur = false;
  #idBase = `asljs-text-input-${nextTextInputId++}`;
  #model: TextInputTemplateModel =
    observable(
      { label: '',
        description: '',
        errorMessage: '',
        hideLabel: true,
        hideDescription: true,
        hideError: true,
        hasError: false,
        isEmpty: true,
        multiline: false,
        inputId: `${this.#idBase}-control`,
        descriptionId: `${this.#idBase}-description`,
        errorId: `${this.#idBase}-error` });

  readonly status: TextInputStatus =
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
    accessor validator: TextInputValidator | null = null;

  @property({ attribute: false })
    accessor theme: ComponentsTheme | null = null;

  @property({ attribute: false })
    accessor value: string | null = '';

  @property({ attribute: false })
    accessor placeholder: string | null = null;

  @property({ attribute: false })
    accessor multiline = false;

  @property({ attribute: false })
    accessor autoExtend = false;

  @property({ attribute: false })
    accessor autoExtendMaxRows: number | null = null;

  @property({ attribute: false })
    accessor enterKeyBehavior: TextInputEnterKeyBehavior = 'finish';

  @property({ attribute: false })
    accessor disabled = false;

  @property({ attribute: false })
    accessor rows = 3;

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
        || changedProperties.has('multiline')
        || changedProperties.has('theme'))
    {
      this.#renderTemplate();
      return;
    }

    if (changedProperties.has('placeholder')
        || changedProperties.has('disabled')
        || changedProperties.has('rows')
        || changedProperties.has('autoExtend')
        || changedProperties.has('autoExtendMaxRows')
        || changedProperties.has('enterKeyBehavior'))
    {
      this.#syncControlState();
    }

    this.#syncModelState();
  }

  #captureTemplates(): void {
    this.#templateElement = null;

    const templateElement =
      this.querySelector<HTMLTemplateElement>('template[data-slot="template"]');

    if (templateElement === null) {
      return;
    }

    const clonedTemplate =
      document.createElement('template');

    clonedTemplate.content.append(
      templateElement.content.cloneNode(true));

    this.#templateElement = clonedTemplate;
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
    const nextValue =
      normalizeText(this.value);

    this.status.draftValue = nextValue;
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
    this.#model.multiline = this.multiline;

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
      slotName: TextInputSlotName
    ): HTMLTemplateElement | null
  {
    return this.#getLocalTemplate(slotName)
      ?? this.#getThemeTemplate(slotName)
      ?? createDefaultTextInputTemplate();
  }

  #getLocalTemplate(
      slotName: TextInputSlotName
    ): HTMLTemplateElement | null
  {
    if (slotName === 'template') {
      return this.#templateElement;
    }

    return null;
  }

  #getThemeTemplate(
      slotName: TextInputSlotName
    ): HTMLTemplateElement | null
  {
    if (slotName !== 'template') {
      return null;
    }

    return resolveThemeTemplate(
      this.theme?.textInput?.template
      ?? this.#themeProvider?.theme?.textInput?.template,
      this);
  }

  #mountControl(): void {
    const controlHost =
      this.querySelector('[data-role="control-host"]') as HTMLElement | null;

    if (controlHost === null) {
      return;
    }

    const control =
      this.multiline
        ? document.createElement('textarea') as HTMLTextAreaElement | HTMLInputElement
        : createSingleLineInput();

    this.#control = control;
    controlHost.replaceChildren(control);

    const inputListener =
      (): void => {
        this.status.draftValue = control.value;
        this.#syncModelState();
        this.#dispatchValueEvent('input');
      };

    const blurListener =
      (): void => {
        if (this.#skipNextBlur) {
          this.#skipNextBlur = false;
          return;
        }

        this.#dispatchValueEvent('change');
      };

    const keydownListener =
      (event: Event): void => {
        const keyboardEvent =
          event as KeyboardEvent;

        if (keyboardEvent.key !== 'Enter') {
          return;
        }

        if (this.multiline
            && !keyboardEvent.ctrlKey
            && !keyboardEvent.metaKey
            && this.enterKeyBehavior === 'newline')
        {
          return;
        }

        keyboardEvent.preventDefault();
        this.#skipNextBlur = true;
        this.#dispatchValueEvent('change');
        control.blur();
      };

    control.addEventListener('input', inputListener);
    control.addEventListener('blur', blurListener);
    control.addEventListener('keydown', keydownListener);

    this.#controlInputListener =
      () => {
        control.removeEventListener('input', inputListener);
      };
    this.#controlBlurListener =
      () => {
        control.removeEventListener('blur', blurListener);
      };
    this.#controlKeydownListener =
      () => {
        control.removeEventListener('keydown', keydownListener);
      };

    this.#syncControlState();
  }

  #syncControlState(): void {
    const control =
      this.#control;

    if (control === null) {
      return;
    }

    if (control.value !== this.status.draftValue) {
      control.value = this.status.draftValue;
    }

    control.id = this.#model.inputId;
    control.placeholder = normalizeOptionalText(this.placeholder) ?? '';
    control.disabled = this.disabled;
    control.className = resolveControlClassName(this);
    const invalidClassName =
      resolveControlInvalidClassName(this);

    if (invalidClassName !== null && !this.status.isValid) {
      control.classList.add(invalidClassName);
    }

    control.toggleAttribute('aria-invalid', !this.status.isValid);
    control.setAttribute(
      'aria-describedby',
      resolveAriaDescribedBy(this.#model));

    if (this.multiline && control instanceof HTMLTextAreaElement) {
      control.rows = Math.max(1, this.rows);
      this.#syncAutoExtend(control);
      return;
    }

    control.style.height = '';
    control.style.overflowY = '';
  }

  #syncAutoExtend(
      control: HTMLTextAreaElement
    ): void
  {
    if (!this.autoExtend) {
      control.style.height = '';
      control.style.overflowY = '';
      return;
    }

    control.style.height = 'auto';

    const maxHeight =
      resolveMaxHeight(
        control,
        this.autoExtendMaxRows);
    const nextHeight =
      maxHeight === null
        ? control.scrollHeight
        : Math.min(control.scrollHeight, maxHeight);

    control.style.height = `${nextHeight}px`;
    control.style.overflowY =
      maxHeight !== null && control.scrollHeight > maxHeight
        ? 'auto'
        : 'hidden';
  }

  #dispatchValueEvent(
      name: 'input' | 'change'
    ): void
  {
    const detail: TextInputChangeDetail =
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
    this.#controlInputListener?.();
    this.#controlBlurListener?.();
    this.#controlKeydownListener?.();
    this.#controlInputListener = null;
    this.#controlBlurListener = null;
    this.#controlKeydownListener = null;
    this.#control = null;
  }
}

let nextTextInputId = 1;

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

function resolveAriaDescribedBy(
    model: TextInputTemplateModel
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

function resolveMaxHeight(
    control: HTMLTextAreaElement,
    maxRows: number | null
  ): number | null
{
  if (maxRows === null || maxRows <= 0) {
    return null;
  }

  const computed =
    getComputedStyle(control);
  const lineHeight =
    parseFloat(computed.lineHeight);

  if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
    return null;
  }

  const borderTop =
    parseFloat(computed.borderTopWidth) || 0;
  const borderBottom =
    parseFloat(computed.borderBottomWidth) || 0;
  const paddingTop =
    parseFloat(computed.paddingTop) || 0;
  const paddingBottom =
    parseFloat(computed.paddingBottom) || 0;

  return lineHeight * maxRows
    + paddingTop
    + paddingBottom
    + borderTop
    + borderBottom;
}

function resolveControlClassName(
    component: TextInput
  ): string
{
  return component
    .querySelector('[data-role="control-host"]')
    ?.getAttribute('data-control-class')
    ?? '';
}

function resolveControlInvalidClassName(
    component: TextInput
  ): string | null
{
  return component
    .querySelector('[data-role="control-host"]')
    ?.getAttribute('data-control-invalid-class')
    ?? null;
}

function createDefaultTextInputTemplate(): HTMLTemplateElement {
  const template =
    document.createElement('template');

  template.innerHTML =
    `
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
    `;

  return template;
}

function createSingleLineInput(): HTMLInputElement {
  const input =
    document.createElement('input');

  input.type = 'text';

  return input;
}