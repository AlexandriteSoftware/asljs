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
    <div id="name-modal" class="hidden position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3 app-modal-overlay">
      <div class="bg-body rounded-4 shadow border w-100" style="max-width: 32rem;">
        <div class="d-flex align-items-center justify-content-between gap-3 px-4 py-3 border-bottom">
          <h3 id="name-modal-title" class="h5 mb-0 d-flex align-items-center gap-2"><i class="bi bi-type"></i><span>New App</span></h3>
          <asljs-button id="btn-close-name-modal"></asljs-button>
        </div>
        <div class="d-flex flex-column gap-2 p-4">
          <label class="form-label mb-0">App name</label>
          <asljs-text-input id="app-name-input"></asljs-text-input>
        </div>
        <div class="d-flex justify-content-end gap-2 px-4 py-3 border-top bg-body-tertiary rounded-bottom-4">
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
    icon: '<i class="bi bi-x-lg"></i>',
    className: 'btn btn-outline-secondary btn-sm',
  });
  configureButton(elBtnConfirm, {
    text: 'OK',
    className: 'btn btn-primary',
  });
  configureButton(elBtnCancel, {
    text: 'Cancel',
    className: 'btn btn-outline-secondary',
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
