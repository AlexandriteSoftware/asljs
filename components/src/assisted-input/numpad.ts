import { css,
         html }
  from 'lit';
import { customElement }
  from 'lit/decorators.js';
import { AssistedInput,
         AssistedInputModelProperties,
         AssistedInputButtonDefinition,
         AssistedInputKeyDetail }
  from './assisted-input.js';
import { ComponentModelDefinition }
  from '../abstractions/model.js';

export type NumpadKeyDetail =
  AssistedInputKeyDetail;

export const NumpadModelDefinition: ComponentModelDefinition =
  { name: 'NumpadModelDefinition',
    title: 'Numpad',
    properties: AssistedInputModelProperties };

const BUTTONS: readonly AssistedInputButtonDefinition[] =
  [ { key: 'Backspace', label: '⌫' },
    { key: '/', label: '÷', className: 'op' },
    { key: '*', label: '×', className: 'op' },
    { key: '-', label: '−', className: 'op' },
    { key: '7', label: '7' },
    { key: '8', label: '8' },
    { key: '9', label: '9' },
    { key: '+', label: '+', className: 'op plus' },
    { key: '4', label: '4' },
    { key: '5', label: '5' },
    { key: '6', label: '6' },
    { key: '1', label: '1' },
    { key: '2', label: '2' },
    { key: '3', label: '3' },
    { key: 'Enter', label: '⏎', className: 'enter' },
    { key: '0', label: '0', className: 'zero' },
    { key: '.', label: '.' } ];

@customElement('asljs-numpad')
export class Numpad
  extends AssistedInput
{
  static override styles =
    css`
      :host {
        --key-bg: #ffffff;
        --key-bg-hover: #f0f0f0;
        --key-bg-disallowed: #f3f3f3;
        --key-bg-active: #e0e0e0;
        --key-color-disallowed: #9a9a9a;
        --key-border: #d0d0d0;
        --key-border-hover: #a0a0a0;
        --key-border-focus: black;
        --key-border-focus-offset: 2px;

        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        user-select: none;
        touch-action: manipulation;
        container-type: size;
        overflow: hidden;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(5, 1fr);
        gap: 0;
        width: min(100cqw, calc(100cqh * 4 / 5));
        height: min(100cqh, calc(100cqw * 5 / 4));
        aspect-ratio: 4 / 5;
      }

      .key {
        aspect-ratio: 1 / 1;
        padding: 0;
        border: 1px solid var(--key-border);
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--key-bg);
        cursor: pointer;
        user-select: none;
        font-size: min(10cqw, 10cqh);
        font-weight: lighter;
      }

      .key.disallowed {
        background: var(--key-bg-disallowed);
        color: var(--key-color-disallowed);
        cursor: not-allowed;
      }

      .key:focus,
      .key:focus-visible {
        outline: 2px solid var(--key-border-focus);
        outline-offset: var(--key-border-focus-offset);
      }

      .key.plus {
        aspect-ratio: 1 / 2;
        grid-row: 2 / span 2;
        grid-column: 4 / 4;
      }

      .key.zero {
        grid-column: 1 / span 2;
        grid-row: 5 / 5;
        aspect-ratio: 2 / 1;
      }

      .key.enter {
        aspect-ratio: 1 / 2;
        grid-row: 4 / span 2;
        grid-column: 4 / 4;
      }

      .key:hover:not(.disallowed) {
        background: var(--key-bg-hover);
      }

      .key:active:not(.disallowed) {
        background: var(--key-bg-active);
      }
    `;

  protected override get defaultAriaLabel(): string {
    return 'numpad';
  }

  override render(): ReturnType<AssistedInput['render']> {
    return html`
      <div class="grid" part="grid">
        ${BUTTONS.map(button => this.#renderButton(button))}
      </div>
    `;
  }

  #renderButton(
      button: AssistedInputButtonDefinition
    ): ReturnType<typeof html>
  {
    return this.renderAssistedInputButton(
      button,
      html`<span class="label">${button.label ?? ''}</span>`);
  }
}