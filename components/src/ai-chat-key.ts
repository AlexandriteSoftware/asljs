import {
    LitElement,
    html,
  } from 'lit';
import {
    customElement,
    property,
  } from 'lit/decorators.js';
import './button.js';
import './text-input.js';

export interface AiChatKeySubmitDetail {
  key: string;
}

type TextInputElement =
  HTMLElement
  & {
    draftValue: string;
    inputType: string;
    placeholder: string | null;
    disabled: boolean;
  };

@customElement('asljs-ai-chat-key')
export class AiChatKeyPrompt
  extends LitElement
{
  @property({ attribute: false })
    accessor label: string = 'OpenAI API Key';

  @property({ attribute: false })
    accessor placeholder: string = 'sk-…';

  @property({ attribute: false })
    accessor submitLabel: string = 'Save key';

  @property({ type: Boolean, attribute: false })
    accessor disabled: boolean = false;

  override createRenderRoot(): this {
    return this;
  }

  override render(): ReturnType<LitElement['render']> {
    return html`
      <div class="asljs-ai-chat-key">
        <div class="asljs-ai-chat-key-label">
          ${this.label}
        </div>
        <div class="asljs-ai-chat-key-controls"
             style="display:flex;
                    gap:0.5rem;
                    align-items:flex-end;">
          <asljs-text-input
              data-role="key-input"
              .placeholder=${this.placeholder}
              .inputType=${'password'}
              .disabled=${this.disabled}
              @keydown=${this.#handleKeydown}>
          </asljs-text-input>
          <asljs-button
              .text=${this.submitLabel}
              .disabled=${this.disabled}
              @click=${this.#handleSubmit}>
          </asljs-button>
        </div>
      </div>
    `;
  }

  #handleKeydown = (event: Event): void => {
    const keyboardEvent =
      event as KeyboardEvent;

    if (keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault();
      this.#submit();
    }
  };

  #handleSubmit = (): void => {
    this.#submit();
  };

  #submit(): void {
    const input =
      this.querySelector('[data-role="key-input"]') as TextInputElement | null;
    const key =
      (input?.draftValue ?? '').trim();

    if (key === '') {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<AiChatKeySubmitDetail>(
        'key-submit',
        { detail: { key },
          bubbles: true,
          composed: true }));
  }
}
