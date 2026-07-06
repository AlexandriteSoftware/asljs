import { configureButton,
         configureSelect,
         configureTextInput,
         focusInnerControl,
         mustElement,
         readControlValue,
         AppBuilderButtonElement,
         AppBuilderSelectElement,
         AppBuilderTextInputElement,
         writeControlValue }
  from './control-ui.js';

export function renderSettingsModal(): string {
  return `
    <div id="settings-modal" class="hidden position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3 app-modal-overlay">
      <div class="bg-body rounded-4 shadow border w-100" style="max-width: 36rem;">
        <div class="d-flex align-items-center justify-content-between gap-3 px-4 py-3 border-bottom">
          <h3 class="h5 mb-0 d-flex align-items-center gap-2"><i class="bi bi-gear"></i><span>Settings</span></h3>
          <asljs-button id="btn-close-settings"></asljs-button>
        </div>
        <div class="d-flex flex-column gap-3 p-4">
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">OpenAI API Key</label>
          <asljs-text-input id="api-key-input"></asljs-text-input>
          </div>
          <p class="small text-body-secondary mb-0">
            Available models are loaded from OpenAI when the app starts. Choose
            the chat model in the chat panel header and the generation model
            below the chat window.
          </p>
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Theme</label>
          <asljs-select id="theme-select"></asljs-select>
          </div>
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Font size (px)</label>
          <asljs-text-input id="font-size-input"></asljs-text-input>
          </div>
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Max tool steps (initial)</label>
          <asljs-text-input id="max-tool-steps-input"></asljs-text-input>
          </div>
          <p class="small text-body-secondary mb-0">
            Your key is stored only in this browser (IndexedDB). It is sent
            directly to OpenAI — no server proxy is involved. Leave blank to
            skip AI generation.
          </p>
        </div>
        <div class="d-flex justify-content-end gap-2 px-4 py-3 border-top bg-body-tertiary rounded-bottom-4">
          <asljs-button id="btn-save-settings"></asljs-button>
          <asljs-button id="btn-cancel-settings"></asljs-button>
        </div>
      </div>
    </div>
  `;
}

export type SettingsModalState =
  {
    apiKey: string;
    theme: 'dark' | 'light';
    fontSize: number;
    maxToolSteps: number;
  };

export type SettingsModalValues =
  {
    apiKey: string;
    theme: string;
    fontSizeText: string;
    maxToolStepsText: string;
  };

export type SettingsModalUi =
  {
    open: () => Promise<void>;
    close: () => void;
  };

export function createSettingsModalUi(
    options: {
      loadValues: () => Promise<SettingsModalState>;
      onSave: (values: SettingsModalValues) => Promise<void>;
    }
  ): SettingsModalUi
{
  const elModal = mustElement<HTMLElement>('settings-modal');
  const elBtnClose = mustElement<AppBuilderButtonElement>('btn-close-settings');
  const elBtnSave = mustElement<AppBuilderButtonElement>('btn-save-settings');
  const elBtnCancel = mustElement<AppBuilderButtonElement>('btn-cancel-settings');
  const elApiKeyInput = mustElement<AppBuilderTextInputElement>('api-key-input');
  const elThemeSelect = mustElement<AppBuilderSelectElement>('theme-select');
  const elFontSizeInput =
    mustElement<AppBuilderTextInputElement>('font-size-input');
  const elMaxToolStepsInput =
    mustElement<AppBuilderTextInputElement>('max-tool-steps-input');

  configureButton(elBtnClose, {
    icon: '<i class="bi bi-x-lg"></i>',
    className: 'btn btn-outline-secondary btn-sm',
  });
  configureButton(elBtnSave, {
    text: 'Save',
    className: 'btn btn-primary',
  });
  configureButton(elBtnCancel, {
    text: 'Cancel',
    className: 'btn btn-outline-secondary',
  });

  configureTextInput(elApiKeyInput, {
    placeholder: 'sk-…  (optional, stored locally)',
    inputType: 'password',
  });
  configureTextInput(elFontSizeInput, {
    placeholder: '14',
    inputType: 'number',
  });
  configureTextInput(elMaxToolStepsInput, {
    placeholder: '20',
    inputType: 'number',
  });

  configureSelect(elThemeSelect, {
    className: 'form-select bootstrap-select',
    items: [
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' },
    ],
  });

  function close(): void {
    elModal.classList.add('hidden');
  }

  async function save(): Promise<void> {
    await options.onSave({
      apiKey: readControlValue(elApiKeyInput).trim(),
      theme: readControlValue(elThemeSelect),
      fontSizeText: readControlValue(elFontSizeInput),
      maxToolStepsText: readControlValue(elMaxToolStepsInput),
    });
    close();
  }

  elBtnClose.addEventListener('click', close);
  elBtnSave.addEventListener('click', () => {
    void save();
  });
  elBtnCancel.addEventListener('click', close);
  elModal.addEventListener('click', (event: MouseEvent) => {
    if (event.target === elModal) {
      close();
    }
  });

  return {
    async open(): Promise<void> {
      const values = await options.loadValues();

      writeControlValue(elApiKeyInput, values.apiKey);
      writeControlValue(elThemeSelect, values.theme);
      writeControlValue(elFontSizeInput, String(values.fontSize));
      writeControlValue(elMaxToolStepsInput, String(values.maxToolSteps));

      elModal.classList.remove('hidden');
      focusInnerControl(elApiKeyInput);
    },
    close,
  };
}
