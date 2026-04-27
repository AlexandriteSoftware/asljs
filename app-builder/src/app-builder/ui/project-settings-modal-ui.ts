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

export function renderProjectSettingsModal(): string {
  return `
    <div id="project-settings-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <h3>Project Settings</h3>
          <asljs-button id="btn-close-project-settings-x"></asljs-button>
        </div>
        <div class="modal-body">
          <label class="form-label">Name</label>
          <asljs-text-input id="project-name-input"></asljs-text-input>
          <label class="form-label">Author name (optional)</label>
          <asljs-text-input id="project-author-name-input"></asljs-text-input>
          <label class="form-label">Author email (optional)</label>
          <asljs-text-input id="project-author-email-input"></asljs-text-input>
        </div>
        <div class="modal-footer">
          <asljs-button id="btn-save-project-settings"></asljs-button>
          <asljs-button id="btn-delete-project"></asljs-button>
          <asljs-button id="btn-close-project-settings"></asljs-button>
        </div>
      </div>
    </div>
  `;
}

export type ProjectSettingsModalValues =
  {
    name: string;
    authorName: string;
    authorEmail: string;
  };

export type ProjectSettingsModalUi =
  {
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
  const elModal = mustElement<HTMLElement>('project-settings-modal');
  const elNameInput =
    mustElement<AppBuilderTextInputElement>('project-name-input');
  const elAuthorNameInput =
    mustElement<AppBuilderTextInputElement>('project-author-name-input');
  const elAuthorEmailInput =
    mustElement<AppBuilderTextInputElement>('project-author-email-input');
  const elBtnSave =
    mustElement<AppBuilderButtonElement>('btn-save-project-settings');
  const elBtnDelete =
    mustElement<AppBuilderButtonElement>('btn-delete-project');
  const elBtnClose =
    mustElement<AppBuilderButtonElement>('btn-close-project-settings');
  const elBtnCloseX =
    mustElement<AppBuilderButtonElement>('btn-close-project-settings-x');

  configureButton(elBtnCloseX, {
    text: '✕',
    className: 'btn btn-ghost btn-sm',
  });
  configureButton(elBtnSave, {
    text: 'Save',
    className: 'btn btn-primary',
  });
  configureButton(elBtnDelete, {
    text: 'Delete',
    className: 'btn btn-danger',
  });
  configureButton(elBtnClose, {
    text: 'Cancel',
    className: 'btn btn-ghost',
  });

  configureTextInput(elNameInput, {
    placeholder: 'Project name',
  });
  configureTextInput(elAuthorNameInput, {
    placeholder: 'Jane Doe',
  });
  configureTextInput(elAuthorEmailInput, {
    placeholder: 'jane@example.com',
    inputType: 'email',
  });

  function close(): void {
    elModal.classList.add('hidden');
  }

  function readValues(): ProjectSettingsModalValues {
    return {
      name: readControlValue(elNameInput).trim(),
      authorName: readControlValue(elAuthorNameInput).trim(),
      authorEmail: readControlValue(elAuthorEmailInput).trim(),
    };
  }

  async function save(): Promise<void> {
    const values = readValues();

    if (values.name === '') {
      focusInnerControl(elNameInput);
      return;
    }

    await options.onSave(values);
    close();
  }

  async function deleteProject(): Promise<void> {
    close();
    await options.onDelete();
  }

  elBtnSave.addEventListener('click', () => {
    void save();
  });
  elBtnDelete.addEventListener('click', () => {
    void deleteProject();
  });
  elBtnClose.addEventListener('click', close);
  elBtnCloseX.addEventListener('click', close);
  elNameInput.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void save();
    }
  });
  elModal.addEventListener('click', (event: MouseEvent) => {
    if (event.target === elModal) {
      close();
    }
  });

  return {
    open(values: ProjectSettingsModalValues): void {
      writeControlValue(elNameInput, values.name);
      writeControlValue(elAuthorNameInput, values.authorName);
      writeControlValue(elAuthorEmailInput, values.authorEmail);
      elModal.classList.remove('hidden');
      selectInnerTextControl(elNameInput);
    },
    close,
  };
}
