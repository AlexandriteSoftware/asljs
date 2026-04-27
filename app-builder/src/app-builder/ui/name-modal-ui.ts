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
