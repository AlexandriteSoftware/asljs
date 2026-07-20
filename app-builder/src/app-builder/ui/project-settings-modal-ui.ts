import { AppBuilderButtonElement,
         AppBuilderTextInputElement,
         configureButton,
         configureTextInput,
         focusInnerControl,
         mustElement,
         readControlValue,
         selectInnerTextControl,
         writeControlValue }
  from './control-ui.js';

export function renderProjectSettingsModal(
  ): string
{
  return `
    <div id="project-settings-modal" class="hidden position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3 app-modal-overlay">
      <div class="bg-body rounded-4 shadow border w-100" style="max-width: 36rem;">
        <div class="d-flex align-items-center justify-content-between gap-3 px-4 py-3 border-bottom">
          <h3 class="h5 mb-0 d-flex align-items-center gap-2"><i class="bi bi-sliders"></i><span>Project Settings</span></h3>
          <asljs-button id="btn-close-project-settings-x"></asljs-button>
        </div>
        <div class="d-flex flex-column gap-3 p-4">
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Name</label>
          <asljs-text-input id="project-name-input"></asljs-text-input>
          </div>
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Author name (optional)</label>
          <asljs-text-input id="project-author-name-input"></asljs-text-input>
          </div>
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Author email (optional)</label>
          <asljs-text-input id="project-author-email-input"></asljs-text-input>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap px-4 py-3 border-top bg-body-tertiary rounded-bottom-4">
          <asljs-button id="btn-delete-project"></asljs-button>
          <div class="d-flex gap-2 flex-wrap justify-content-end">
          <asljs-button id="btn-save-project-settings"></asljs-button>
          <asljs-button id="btn-close-project-settings"></asljs-button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export type ProjectSettingsModalValues = {
  name: string;
  authorName: string;
  authorEmail: string;
};

export type ProjectSettingsModalUi = {
  open: (values: ProjectSettingsModalValues) => void;
  close: () => void;
};

export function createProjectSettingsModalUi(
    options: {
    onSave: (values: ProjectSettingsModalValues) => Promise<void>;
    onDelete: () => Promise<void>;
  }
  ): ProjectSettingsModalUi
{
  const elModal =
    mustElement(
      'project-settings-modal');

  const elNameInput =
    mustElement(
      'project-name-input');

  const elAuthorNameInput =
    mustElement(
      'project-author-name-input');

  const elAuthorEmailInput =
    mustElement(
      'project-author-email-input');

  const elBtnSave =
    mustElement(
      'btn-save-project-settings');

  const elBtnDelete =
    mustElement(
      'btn-delete-project');

  const elBtnClose =
    mustElement(
      'btn-close-project-settings');

  const elBtnCloseX =
    mustElement(
      'btn-close-project-settings-x');

  configureButton(
    elBtnCloseX,
    {
      icon: '<i class="bi bi-x-lg"></i>',
      className: 'btn btn-outline-secondary btn-sm'
    });

  configureButton(
    elBtnSave,
    {
      text: 'Save',
      className: 'btn btn-primary'
    });

  configureButton(
    elBtnDelete,
    {
      text: 'Delete',
      className: 'btn btn-danger'
    });

  configureButton(
    elBtnClose,
    {
      text: 'Cancel',
      className: 'btn btn-outline-secondary'
    });

  configureTextInput(
    elNameInput,
    {
      placeholder: 'Project name'
    });

  configureTextInput(
    elAuthorNameInput,
    {
      placeholder: 'Jane Doe'
    });

  configureTextInput(
    elAuthorEmailInput,
    {
      placeholder: 'jane@example.com',
      inputType: 'email'
    });

  function close(
    ): void
  {
    elModal.classList.add('hidden');
  }

  function readValues(
    ): ProjectSettingsModalValues
  {
    return {
      name: readControlValue(elNameInput).trim(),
      authorName: readControlValue(
        elAuthorNameInput).trim(),
      authorEmail: readControlValue(
        elAuthorEmailInput).trim()
    };
  }

  async function save(
    ): Promise<void>
  {
    const values =
      readValues();

    if (values.name === '') {
      focusInnerControl(elNameInput);
      return;
    }

    await options.onSave(values);
    close();
  }

  async function deleteProject(
    ): Promise<void>
  {
    close();
    await options.onDelete();
  }

  elBtnSave.addEventListener(
    'click',
    () =>
    {
      void save();
    });

  elBtnDelete.addEventListener(
    'click',
    () =>
    {
      void deleteProject();
    });

  elBtnClose.addEventListener(
    'click',
    close);

  elBtnCloseX.addEventListener(
    'click',
    close);

  elNameInput.addEventListener(
    'keydown',
    (event: KeyboardEvent) =>
    {
      if (event.key === 'Enter') {
        event.preventDefault();
        void save();
      }
    });

  elModal.addEventListener(
    'click',
    (event: MouseEvent) =>
    {
      if (event.target === elModal) {
        close();
      }
    });

  return {
    open(values: ProjectSettingsModalValues): void
    {
      writeControlValue(
        elNameInput,
        values.name);

      writeControlValue(
        elAuthorNameInput,
        values.authorName);

      writeControlValue(
        elAuthorEmailInput,
        values.authorEmail);

      elModal.classList.remove('hidden');
      selectInnerTextControl(elNameInput);
    },
    close
  };
}
