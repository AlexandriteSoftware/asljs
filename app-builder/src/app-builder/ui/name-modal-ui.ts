import {
  configureButton,
  configureTextInput,
  focusInnerControl,
  mustElement,
  readControlValue,
  selectInnerTextControl,
  type AppBuilderButtonElement,
  type AppBuilderTextInputElement,
  writeControlValue,
} from './control-ui.js';

export function renderNameModal(): string {
  return `
    <div id="name-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <h3 id="name-modal-title">New App</h3>
          <asljs-button id="btn-close-name-modal"></asljs-button>
        </div>
        <div class="modal-body">
          <label class="form-label">App name</label>
          <asljs-text-input id="app-name-input"></asljs-text-input>
        </div>
        <div class="modal-footer">
          <asljs-button id="btn-confirm-name"></asljs-button>
          <asljs-button id="btn-cancel-name"></asljs-button>
        </div>
      </div>
    </div>
  `;
}

export type NameModalRequest =
  {
    title: string;
    initialValue: string;
    selectText: boolean;
    onConfirm: (value: string) => Promise<void>;
  };

export type NameModalUi =
  {
    open: (request: NameModalRequest) => void;
    close: () => void;
  };

export function createNameModalUi(): NameModalUi {
  const elModal = mustElement<HTMLElement>('name-modal');
  const elTitle = mustElement<HTMLElement>('name-modal-title');
  const elInput = mustElement<AppBuilderTextInputElement>('app-name-input');
  const elBtnConfirm = mustElement<AppBuilderButtonElement>('btn-confirm-name');
  const elBtnCancel = mustElement<AppBuilderButtonElement>('btn-cancel-name');
  const elBtnClose =
    mustElement<AppBuilderButtonElement>('btn-close-name-modal');

  let activeRequest: NameModalRequest | null = null;

  configureButton(elBtnClose, {
    text: '✕',
    className: 'btn btn-ghost btn-sm',
  });
  configureButton(elBtnConfirm, {
    text: 'OK',
    className: 'btn btn-primary',
  });
  configureButton(elBtnCancel, {
    text: 'Cancel',
    className: 'btn btn-ghost',
  });
  configureTextInput(elInput, {
    placeholder: 'My App',
  });

  function close(): void {
    activeRequest = null;
    elModal.classList.add('hidden');
  }

  async function confirm(): Promise<void> {
    if (activeRequest === null) {
      return;
    }

    const value = readControlValue(elInput).trim();

    if (value === '') {
      focusInnerControl(elInput);
      return;
    }

    const request = activeRequest;
    close();
    await request.onConfirm(value);
  }

  elBtnConfirm.addEventListener('click', () => {
    void confirm();
  });
  elBtnCancel.addEventListener('click', close);
  elBtnClose.addEventListener('click', close);
  elInput.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void confirm();
    }
  });
  elModal.addEventListener('click', (event: MouseEvent) => {
    if (event.target === elModal) {
      close();
    }
  });

  return {
    open(request: NameModalRequest): void {
      activeRequest = request;
      elTitle.textContent = request.title;
      writeControlValue(elInput, request.initialValue);
      elModal.classList.remove('hidden');

      if (request.selectText) {
        selectInnerTextControl(elInput);
        return;
      }

      focusInnerControl(elInput);
    },
    close,
  };
}
