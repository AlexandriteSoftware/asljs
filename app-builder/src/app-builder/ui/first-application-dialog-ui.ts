import {
  configureButton,
  configureTextInput,
  focusInnerControl,
  mustElement,
  readControlValue,
  type AppBuilderButtonElement,
  type AppBuilderTextInputElement,
  writeControlValue,
} from './control-ui.js';

export function renderFirstApplicationDialog(): string {
  return `
    <section id="first-app-setup" class="first-app-setup hidden">
      <div class="first-app-card">
        <h2>Create Your First Application</h2>
        <p>
          This is a local-only application builder. App data is stored in your
          browser and is not submitted to any server. If you provide an OpenAI
          key, requests are sent directly to OpenAI only.
        </p>
        <label class="form-label">OpenAI API Key</label>
        <asljs-text-input id="first-api-key-input"></asljs-text-input>
        <label class="form-label">Application Name</label>
        <asljs-text-input id="first-app-name-input"></asljs-text-input>
        <p class="form-hint">
          Want a quick start? Create a TODO sample app and modify it.
        </p>
        <div class="first-app-actions">
          <asljs-button id="btn-create-first-app"></asljs-button>
          <asljs-button id="btn-create-todo-sample"></asljs-button>
        </div>
      </div>
    </section>
  `;
}

export type FirstApplicationDialogValues =
  {
    name: string;
    apiKey: string;
  };

export type FirstApplicationDialogUi =
  {
    show: () => void;
    hide: () => void;
  };

export function createFirstApplicationDialogUi(
    options: {
      onCreateApplication: (
        values: FirstApplicationDialogValues,
      ) => Promise<void>;
      onCreateTodoSample: (
        values: FirstApplicationDialogValues,
      ) => Promise<void>;
    }
  ): FirstApplicationDialogUi
{
  const elDialog = mustElement<HTMLElement>('first-app-setup');
  const elApiKeyInput =
    mustElement<AppBuilderTextInputElement>('first-api-key-input');
  const elNameInput =
    mustElement<AppBuilderTextInputElement>('first-app-name-input');
  const elBtnCreate =
    mustElement<AppBuilderButtonElement>('btn-create-first-app');
  const elBtnCreateSample =
    mustElement<AppBuilderButtonElement>('btn-create-todo-sample');

  configureButton(elBtnCreate, {
    text: 'Create Application',
    className: 'btn btn-primary',
  });
  configureButton(elBtnCreateSample, {
    text: 'Create TODO Sample App',
    className: 'btn btn-ghost',
  });

  configureTextInput(elApiKeyInput, {
    placeholder: 'sk-...',
    inputType: 'password',
  });
  configureTextInput(elNameInput, {
    placeholder: 'My App',
  });

  function readValues(): FirstApplicationDialogValues {
    return {
      name: readControlValue(elNameInput).trim(),
      apiKey: readControlValue(elApiKeyInput).trim(),
    };
  }

  async function createApplication(): Promise<void> {
    const values = readValues();

    if (values.name === '') {
      focusInnerControl(elNameInput);
      return;
    }

    await options.onCreateApplication(values);
  }

  async function createTodoSample(): Promise<void> {
    await options.onCreateTodoSample(readValues());
  }

  function clear(): void {
    writeControlValue(elApiKeyInput, '');
    writeControlValue(elNameInput, '');
  }

  elBtnCreate.addEventListener('click', () => {
    void createApplication();
  });
  elBtnCreateSample.addEventListener('click', () => {
    void createTodoSample();
  });
  elNameInput.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void createApplication();
    }
  });

  return {
    show(): void {
      clear();
      elDialog.classList.remove('hidden');
    },
    hide(): void {
      elDialog.classList.add('hidden');
    },
  };
}
