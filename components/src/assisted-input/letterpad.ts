import { css,
         html }
  from 'lit';
import { customElement,
         property }
  from 'lit/decorators.js';
import { unsafeHTML }
  from 'lit/directives/unsafe-html.js';
import { ComponentModelDefinition }
  from '../abstractions/model.js';
import { AssistedInput,
         AssistedInputButtonDefinition,
         AssistedInputKeyDetail,
         AssistedInputModelProperties }
  from './assisted-input.js';

export type LetterpadKeyDetail = AssistedInputKeyDetail;

export const LetterpadModelDefinition: ComponentModelDefinition =
  {
  name: 'LetterpadModelDefinition',
  title: 'Letterpad',
  properties: [...AssistedInputModelProperties, {
    name: 'collapsed',
    title: 'Collapsed',
    type: 'boolean',
    description: 'Whether the letterpad is collapsed.'
  }]
};

const KEYBOARD_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false">'
  + '<path d="M96 208C96 172.7 124.7 144 160 144L480 144C515.3 144 544 172.7 544 208L544 432C544 467.3 515.3 496 480 496L160 496C124.7 496 96 467.3 96 432L96 208zM160 192C151.2 192 144 199.2 144 208L144 432C144 440.8 151.2 448 160 448L480 448C488.8 448 496 440.8 496 432L496 208C496 199.2 488.8 192 480 192L160 192zM176 240C176 231.2 183.2 224 192 224L224 224C232.8 224 240 231.2 240 240L240 272C240 280.8 232.8 288 224 288L192 288C183.2 288 176 280.8 176 272L176 240zM272 240C272 231.2 279.2 224 288 224L320 224C328.8 224 336 231.2 336 240L336 272C336 280.8 328.8 288 320 288L288 288C279.2 288 272 280.8 272 272L272 240zM368 240C368 231.2 375.2 224 384 224L416 224C424.8 224 432 231.2 432 240L432 272C432 280.8 424.8 288 416 288L384 288C375.2 288 368 280.8 368 272L368 240zM176 336C176 327.2 183.2 320 192 320L448 320C456.8 320 464 327.2 464 336L464 368C464 376.8 456.8 384 448 384L192 384C183.2 384 176 376.8 176 368L176 336z"/>'
  + '</svg>';

const BUTTONS: readonly AssistedInputButtonDefinition[] =
  [
  { action: 'toggle', className: 'toggle' },
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
  { key: 'c', label: 'C' },
  { key: 'd', label: 'D' },
  { key: 'e', label: 'E' },
  { key: 'f', label: 'F' },
  { key: 'g', label: 'G' },
  { key: 'h', label: 'H' },
  { key: 'i', label: 'I' },
  { key: 'j', label: 'J' },
  { key: 'k', label: 'K' },
  { key: 'l', label: 'L' },
  { key: 'm', label: 'M' },
  { key: 'n', label: 'N' },
  { key: 'o', label: 'O' },
  { key: 'p', label: 'P' },
  { key: 'q', label: 'Q' },
  { key: 'r', label: 'R' },
  { key: 'Backspace', label: '⌫' },
  { key: 's', label: 'S' },
  { key: 't', label: 'T' },
  { key: 'u', label: 'U' },
  { key: 'v', label: 'V' },
  { key: 'Enter', label: '⏎', className: 'enter' },
  { key: 'w', label: 'W' },
  { key: 'x', label: 'X' },
  { key: 'y', label: 'Y' },
  { key: 'z', label: 'Z' }
];

@customElement(
  'asljs-letterpad')
export class Letterpad extends AssistedInput
{
  static override styles = css`
      :host {
        display: inline-block;
        user-select: none;
        touch-action: manipulation;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-auto-rows: 2.2em;
        gap: 0;
      }

      .key {
        font: inherit;
        padding: 0;
        min-width: 2.2em;
        border: 1px solid lightgray;
        background: white;
        cursor: pointer;
        line-height: 1;
        position: relative;
      }

      .key.disallowed {
        background: #f3f3f3;
        border-color: #d0d0d0;
        color: #9a9a9a;
        cursor: not-allowed;
      }

      .key:focus,
      .key:focus-visible {
        outline: 2px solid black;
        outline-offset: 2px;
      }

      .key.toggle {
        border-color: black;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .key.toggle svg {
        width: 1.1em;
        height: 1.1em;
        fill: currentColor;
      }

      :host([collapsed]) .key:not(.toggle) {
        display: none;
      }

      .key.enter {
        grid-column: 5;
        grid-row: 5 / span 2;
      }
    `;

  @property(
    { reflect: true, type: Boolean })
  accessor collapsed = false;

  protected override get defaultAriaLabel(): string {
    return 'letterpad';
  }

  override render(): ReturnType<AssistedInput['render']>
  {
    return html`
      <div class="grid" part="grid">
        ${
      BUTTONS.map(
        button => this.#renderButton(button))
    }
      </div>
    `;
  }

  protected override handleAction(
    action: string,
    event: Event,
    _button: HTMLButtonElement
  ): boolean
  {
    if (action !== 'toggle') {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();
    this.collapsed = !this.collapsed;
    return true;
  }

  #renderButton(
    button: AssistedInputButtonDefinition
  ): ReturnType<typeof html>
  {
    if (button.action === 'toggle') {
      return this.renderAssistedInputButton(
        button,
        unsafeHTML(
          KEYBOARD_ICON_SVG),
        { ariaLabel: this.#toggleLabel, title: this.#toggleLabel });
    }

    return this.renderAssistedInputButton(
      button,
      html`<span class="label">${button.label ?? ''}</span>`);
  }

  get #toggleLabel(): string {
    return this.collapsed
      ? 'Show letterpad'
      : 'Hide letterpad';
  }
}
