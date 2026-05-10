import {
    LitElement,
    html,
  } from 'lit';
import {
    customElement,
    property,
  } from 'lit/decorators.js';
import {
    PropertiesModelDefinition,
    type ComponentModelDefinition,
    type ComponentModelPropertyDefinition,
    type ComponentModelPropertyType,
  } from './component-model.js';
import {
    type ComponentsTheme,
  } from './themes/theme.js';
import './select.js';
import './text-input.js';

type SelectSourceElement =
  EventTarget
  & {
    draftValue?: string;
  };

type SelectInputDetail =
  { value?: string; };

type TextInputSourceElement =
  EventTarget
  & {
    draftValue?: string;
  };

type TextInputDetail =
  { value?: string; };

const BOOLEAN_ITEMS =
  [ { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' } ];

@customElement('asljs-properties')
export class Properties
  extends LitElement
{
  static readonly modelDefinition =
    PropertiesModelDefinition;

  @property({ attribute: false })
    accessor definition: ComponentModelDefinition | null = null;

  @property({ attribute: false })
    accessor target: Record<string, unknown> | null = null;

  @property({ attribute: false })
    accessor theme: ComponentsTheme | null = null;

  override createRenderRoot(): this {
    return this;
  }

  override render(): ReturnType<LitElement['render']> {
    if (this.definition === null || this.target === null) {
      return html``;
    }

    return html`
      <div class="asljs-properties"
           style="display:grid;gap:0.75rem;">
        ${this.definition.properties.map(
          propertyDefinition => this.#renderProperty(propertyDefinition))}
      </div>
    `;
  }

  #renderProperty(
      propertyDefinition: ComponentModelPropertyDefinition
    ): ReturnType<LitElement['render']>
  {
    const propertyValue =
      this.target?.[propertyDefinition.name];
    const label =
      propertyDefinition.title ?? propertyDefinition.name;
    const description =
      propertyDefinition.description
      ?? `Type: ${propertyDefinition.type}`;
    const isEditable =
      propertyDefinition.editable
      ?? isPrimitiveEditable(propertyDefinition.type);

    if (propertyDefinition.type === 'boolean') {
      return html`
        <asljs-select
            data-property-name=${propertyDefinition.name}
            .theme=${this.theme}
            .label=${label}
            .description=${description}
            .items=${BOOLEAN_ITEMS}
            .value=${propertyValue === true
              ? 'yes'
              : 'no'}
            .disabled=${!isEditable}
            @input=${(event: Event) => this.#handleBooleanInput(propertyDefinition, event)}>
        </asljs-select>
      `;
    }

    return html`
      <asljs-text-input
          data-property-name=${propertyDefinition.name}
          .theme=${this.theme}
          .label=${label}
          .description=${description}
          .value=${formatPropertyValue(propertyDefinition.type, propertyValue)}
          .inputType=${propertyDefinition.type === 'number'
            ? 'number'
            : 'text'}
          .disabled=${!isEditable}
          @input=${(event: Event) => this.#handleTextInput(propertyDefinition, event)}>
      </asljs-text-input>
    `;
  }

  #handleBooleanInput(
      propertyDefinition: ComponentModelPropertyDefinition,
      event: Event
    ): void
  {
    if (this.target === null || propertyDefinition.editable === false) {
      return;
    }

    const detail =
      (event as CustomEvent<SelectInputDetail>).detail;
    const source =
      event.currentTarget as SelectSourceElement | null;
    const nextValue =
      detail?.value
      ?? source?.draftValue;

    if (nextValue === undefined) {
      return;
    }

    this.target[propertyDefinition.name] =
      nextValue === 'yes';
    this.requestUpdate();
  }

  #handleTextInput(
      propertyDefinition: ComponentModelPropertyDefinition,
      event: Event
    ): void
  {
    if (this.target === null || propertyDefinition.editable === false) {
      return;
    }

    const detail =
      (event as CustomEvent<TextInputDetail>).detail;
    const source =
      event.currentTarget as TextInputSourceElement | null;
    const rawValue =
      detail?.value
      ?? source?.draftValue;

    if (rawValue === undefined) {
      return;
    }

    const nextValue =
      coercePropertyValue(
        propertyDefinition.type,
        rawValue,
        this.target[propertyDefinition.name]);

    if (nextValue === unchangedValue) {
      return;
    }

    this.target[propertyDefinition.name] = nextValue;
    this.requestUpdate();
  }
}

const unchangedValue =
  Symbol('unchangedValue');

function coercePropertyValue(
    type: ComponentModelPropertyType,
    value: string,
    currentValue: unknown
  ): unknown
{
  if (type === 'number') {
    if (value.trim() === '') {
      return unchangedValue;
    }

    const nextValue =
      Number(value);

    return Number.isFinite(nextValue)
      ? nextValue
      : unchangedValue;
  }

  if (type === 'string') {
    return value;
  }

  return currentValue;
}

function formatPropertyValue(
    type: ComponentModelPropertyType,
    value: unknown
  ): string
{
  if (type === 'string' || type === 'number') {
    return value === null || value === undefined
      ? ''
      : String(value);
  }

  if (type === 'array') {
    return Array.isArray(value)
      ? `[${value.length} items]`
      : '[]';
  }

  if (type === 'function') {
    return typeof value === 'function'
      ? '[Function]'
      : '';
  }

  if (type === 'object') {
    return value === null || value === undefined
      ? ''
      : '[Object]';
  }

  return value === true
    ? 'Yes'
    : 'No';
}

function isPrimitiveEditable(
    type: ComponentModelPropertyType
  ): boolean
{
  return type === 'boolean'
    || type === 'number'
    || type === 'string';
}
