import { AppBuilderButtonElement,
         AppBuilderTextInputElement,
         configureButton,
         configureTextInput,
         focusInnerControl,
         mustElement,
         readControlValue,
         writeControlValue }
  from './control-ui.js';

export function renderFirstApplicationDialog(
  ): string
{
  return `
    <section id="first-app-setup" class="hidden d-flex flex-grow-1 align-items-center justify-content-center p-3 p-lg-5">
      <div class="card shadow-sm border-0 w-100" style="max-width: 42rem;">
        <div class="card-body d-flex flex-column gap-3 p-4 p-lg-5">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center app-icon-circle">
              <i class="bi bi-stars"></i>
            </div>
            <div>
              <h2 class="h4 mb-1">Create Your First Application</h2>
              <p class="text-body-secondary mb-0">
                Start with a blank project or the built-in TODO sample.
              </p>
            </div>
          </div>
          <p class="text-body-secondary mb-0">
          This is a local-only application builder. App data is stored in your
          browser and is not submitted to any server. If you provide an OpenAI
          key, requests are sent directly to OpenAI only.
          </p>
          <div class="d-flex flex-column gap-2">
            <label class="form-label mb-0">OpenAI API Key</label>
            <asljs-text-input id="first-api-key-input"></asljs-text-input>
          </div>
          <div class="d-flex flex-column gap-2">
            <label class="form-label mb-0">Application Name</label>
            <asljs-text-input id="first-app-name-input"></asljs-text-input>
          </div>
          <p class="small text-body-secondary mb-0">
          Want a quick start? Create a TODO sample app and modify it.
          </p>
          <div class="d-flex flex-wrap gap-2">
          <asljs-button id="btn-create-first-app"></asljs-button>
          <asljs-button id="btn-create-todo-sample"></asljs-button>
        </div>
        </div>
      </div>
    </section>
  `;
}

export type FirstApplicationDialogValues = {
  name: string;
  apiKey: string;
};

export type FirstApplicationDialogUi = {
  show: () => void;
  hide: () => void;
};

export function createFirstApplicationDialogUi(
    options: {
    onCreateApplication: (
      values: FirstApplicationDialogValues
    ) => Promise<void>;
    onCreateTodoSample: (
      values: FirstApplicationDialogValues
    ) => Promise<void>;
  }
  ): FirstApplicationDialogUi
{
  const elDialog =
    mustElement(
      'first-app-setup');

  const elApiKeyInput =
    mustElement(
      'first-api-key-input');

  const elNameInput =
    mustElement(
      'first-app-name-input');

  const elBtnCreate =
    mustElement(
      'btn-create-first-app');

  const elBtnCreateSample =
    mustElement(
      'btn-create-todo-sample');

  configureButton(
    elBtnCreate,
    {
      text: 'Create Application',
      className: 'btn btn-primary'
    }
  );

  configureButton(
    elBtnCreateSample,
    {
      text: 'Create TODO Sample App',
      className: 'btn btn-outline-secondary'
    }
  );

  configureTextInput(
    elApiKeyInput,
    {
      placeholder: 'sk-...',
      inputType: 'password'
    }
  );

  configureTextInput(
    elNameInput,
    {
      placeholder: 'My App'
    }
  );

  function readValues(
    ): FirstApplicationDialogValues
{
    return {
      name: readControlValue(elNameInput).trim(),
      apiKey: readControlValue(elApiKeyInput).trim()
    };
  }

  async function createApplication(
    ): Promise<void>
{
    const values =
      readValues();

    if (values.name === '') {
      focusInnerControl(elNameInput);
      return;
    }

    await options.onCreateApplication(values);
  }

  async function createTodoSample(
    ): Promise<void>
{
    await options.onCreateTodoSample(
      readValues()
    );
  }

  function clear(
    ): void
{
    writeControlValue(
      elApiKeyInput,
      ''
    );

    writeControlValue(
      elNameInput,
      ''
    );
  }

  elBtnCreate.addEventListener(
    'click',
    () =>
    {
      void createApplication();
    }
  );

  elBtnCreateSample.addEventListener(
    'click',
    () =>
    {
      void createTodoSample();
    }
  );

  elNameInput.addEventListener(
    'keydown',
    (event: KeyboardEvent) =>
    {
      if (event.key === 'Enter') {
        event.preventDefault();
        void createApplication();
      }
    }
  );

  return {
    show(): void
    {
      clear();
      elDialog.classList.remove('hidden');
    },
    hide(): void
    {
      elDialog.classList.add('hidden');
    }
  };
}
