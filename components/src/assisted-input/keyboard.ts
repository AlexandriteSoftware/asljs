import {
    css,
    html,
  } from 'lit';
import {
    customElement,
  } from 'lit/decorators.js';
import {
    AssistedInput,
    AssistedInputModelProperties,
    type AssistedInputButtonDefinition,
    type AssistedInputKeyDetail,
  } from './assisted-input.js';
import {
    type ComponentModelDefinition,
  } from '../abstractions/model.js';

export type KeyboardKeyDetail =
  AssistedInputKeyDetail;

export const KeyboardModelDefinition: ComponentModelDefinition =
  { name: 'KeyboardModelDefinition',
    title: 'Keyboard',
    properties: AssistedInputModelProperties };

type KeyboardRowDefinition =
  readonly AssistedInputButtonDefinition[];

const ROWS: readonly KeyboardRowDefinition[] =
  [ [ { key: '1', label: '1' },
      { key: '2', label: '2' },
      { key: '3', label: '3' },
      { key: '4', label: '4' },
      { key: '5', label: '5' },
      { key: '6', label: '6' },
      { key: '7', label: '7' },
      { key: '8', label: '8' },
      { key: '9', label: '9' },
      { key: '0', label: '0' },
      { key: 'Backspace', label: '⌫', className: 'wide backspace' } ],
    [ { key: 'q', label: 'Q' },
      { key: 'w', label: 'W' },
      { key: 'e', label: 'E' },
      { key: 'r', label: 'R' },
      { key: 't', label: 'T' },
      { key: 'y', label: 'Y' },
      { key: 'u', label: 'U' },
      { key: 'i', label: 'I' },
      { key: 'o', label: 'O' },
      { key: 'p', label: 'P' } ],
    [ { key: 'a', label: 'A' },
      { key: 's', label: 'S' },
      { key: 'd', label: 'D' },
      { key: 'f', label: 'F' },
      { key: 'g', label: 'G' },
      { key: 'h', label: 'H' },
      { key: 'j', label: 'J' },
      { key: 'k', label: 'K' },
      { key: 'l', label: 'L' },
      { key: "'", label: "'" },
      { key: 'Enter', label: '⏎', className: 'wide enter' } ],
    [ { key: 'z', label: 'Z' },
      { key: 'x', label: 'X' },
      { key: 'c', label: 'C' },
      { key: 'v', label: 'V' },
      { key: 'b', label: 'B' },
      { key: 'n', label: 'N' },
      { key: 'm', label: 'M' },
      { key: ',', label: ',' },
      { key: '.', label: '.' },
      { key: '-', label: '-' } ],
    [ { key: ' ', label: 'Space', className: 'space' } ] ];

@customElement('asljs-keyboard')
export class Keyboard
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

        display: inline-flex;
        flex-direction: column;
        gap: 0.35rem;
        user-select: none;
        touch-action: manipulation;
      }

      .row {
        display: grid;
        grid-template-columns: repeat(20, minmax(0, 1fr));
        gap: 0;
      }

      .key {
        font: inherit;
        min-height: 2.5rem;
        padding: 0 0.35rem;
        border: 1px solid var(--key-border);
        background: var(--key-bg);
        cursor: pointer;
        line-height: 1;
        grid-column: span 2;
      }

      .key.wide {
        grid-column: span 4;
      }

      .key.space {
        grid-column: 4 / span 14;
      }

      .key.disallowed {
        background: var(--key-bg-disallowed);
        color: var(--key-color-disallowed);
        cursor: not-allowed;
      }

      .key:hover:not(.disallowed) {
        background: var(--key-bg-hover);
      }

      .key:active:not(.disallowed) {
        background: var(--key-bg-active);
      }

      .key:focus,
      .key:focus-visible {
        outline: 2px solid var(--key-border-focus);
        outline-offset: var(--key-border-focus-offset);
      }
    `;

  protected override get defaultAriaLabel(): string {
    return 'keyboard';
  }

  override render(): ReturnType<AssistedInput['render']> {
    return html`
      ${ROWS.map(
        row => html`
          <div class="row">
            ${row.map(button => this.#renderButton(button))}
          </div>
        `)}
    `;
  }

  #renderButton(
      button: AssistedInputButtonDefinition
    ): ReturnType<typeof html>
  {
    const ariaLabel =
      button.key === ' '
        ? 'Space'
        : undefined;

    return this.renderAssistedInputButton(
      button,
      html`<span class="label">${button.label ?? ''}</span>`,
      { ariaLabel });
  }
}