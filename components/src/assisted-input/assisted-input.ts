import { html,
         LitElement }
  from 'lit';
import { property }
  from 'lit/decorators.js';
import { ComponentModelDefinition,
         ComponentModelPropertyDefinition }
  from '../abstractions/model.js';

export interface AssistedInputKeyDetail
{
  key: string;
}

export type AssistedInputButtonDefinition = {
  key?: string;
  label?: string;
  className?: string;
  action?: string;
};

export const AssistedInputModelProperties =
  [{
  name: 'characters',
  title: 'Characters',
  type: 'string',
  description: 'Allowed single-character keys. Empty means no filter.'
}] as const satisfies readonly ComponentModelPropertyDefinition[];

export const AssistedInputModelDefinition: ComponentModelDefinition =
  {
  name: 'AssistedInputModelDefinition',
  title: 'Assisted Input',
  properties: AssistedInputModelProperties
};

export abstract class AssistedInput extends LitElement
{
  @property(
    { reflect: true }
  )
  accessor characters = '';

  protected abstract get defaultAriaLabel(): string;

  override connectedCallback(): void
  {
    super.connectedCallback();

    if (!this.hasAttribute('role')) {
      this.setAttribute(
        'role',
        'group'
      );
    }

    if (!this.hasAttribute('aria-label')) {
      this.setAttribute(
        'aria-label',
        this.defaultAriaLabel
      );
    }
  }

  protected isButtonAllowed(
    button: AssistedInputButtonDefinition
  ): boolean
  {
    if (button.action !== undefined) {
      return true;
    }

    if (button.key === undefined || button.key === '') {
      return false;
    }

    return this.isKeyAllowed(
      button.key
    );
  }

  protected isKeyAllowed(
    key: string
  ): boolean
  {
    if (this.characters === '') {
      return true;
    }

    if (key === 'Backspace' || key === 'Enter') {
      return true;
    }

    return key.length === 1
      && this.characters
        .includes(key);
  }

  protected renderAssistedInputButton(
    button: AssistedInputButtonDefinition,
    content: unknown,
    options: { ariaLabel?: string; title?: string; } = {}
  ): ReturnType<typeof html>
  {
    const allowed =
      this.isButtonAllowed(button);

    const classes =
      [
      'key',
      button.className ?? '',
      allowed
        ? ''
        : 'disallowed'
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <button
          type="button"
          class=${classes}
          data-action=${button.action ?? ''}
          data-key=${button.key ?? ''}
          aria-label=${options.ariaLabel ?? ''}
          title=${options.title ?? ''}
          ?disabled=${!allowed}
          tabindex="-1"
          @click=${this.handleAssistedInputButtonClick}
          @pointerdown=${this.handleAssistedInputPointerDown}>
        ${content}
      </button>
    `;
  }

  protected dispatchKey(
    key: string
  ): void
  {
    this.dispatchEvent(
      new CustomEvent<AssistedInputKeyDetail>(
        'key',
        { detail: { key }, bubbles: true, composed: true }
      )
    );
  }

  protected dispatchSubmit(): void
  {
    this.dispatchEvent(
      new CustomEvent(
        'submit',
        { detail: {}, bubbles: true, composed: true }
      )
    );
  }

  protected handleAction(
    _action: string,
    _event: Event,
    _button: HTMLButtonElement
  ): boolean
  {
    return false;
  }

  protected handleAssistedInputButtonClick = (
    event: Event
  ): void =>
  {
    const button =
      event.currentTarget as HTMLButtonElement | null;

    if (button === null || button.disabled) {
      return;
    }

    const action =
      button.getAttribute('data-action');

    if (
      action !== null
      && action !== ''
      && this.handleAction(
        action,
        event,
        button
      )
    ) {
      return;
    }

    const key =
      button.getAttribute('data-key');

    if (key === null || key === '') {
      return;
    }

    if (key === 'Enter') {
      this.dispatchSubmit();
      return;
    }

    this.dispatchKey(key);
  };

  protected handleAssistedInputPointerDown = (
    event: Event
  ): void =>
  {
    event.preventDefault();
  };
}
