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
