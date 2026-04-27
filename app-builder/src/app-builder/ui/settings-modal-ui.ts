export function renderSettingsModal(): string {
  return `
    <div id="settings-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <h3>Settings</h3>
          <asljs-button id="btn-close-settings"></asljs-button>
        </div>
        <div class="modal-body">
          <label class="form-label">OpenAI API Key</label>
          <asljs-text-input id="api-key-input"></asljs-text-input>
          <p class="form-hint">
            Available models are loaded from OpenAI when the app starts. Choose
            the chat model in the chat panel header and the generation model
            below the chat window.
          </p>
          <label class="form-label">Theme</label>
          <asljs-select id="theme-select"></asljs-select>
          <label class="form-label">Font size (px)</label>
          <asljs-text-input id="font-size-input"></asljs-text-input>
          <label class="form-label">Max tool steps (initial)</label>
          <asljs-text-input id="max-tool-steps-input"></asljs-text-input>
          <p class="form-hint">
            Your key is stored only in this browser (IndexedDB). It is sent
            directly to OpenAI — no server proxy is involved. Leave blank to
            skip AI generation.
          </p>
        </div>
        <div class="modal-footer">
          <asljs-button id="btn-save-settings"></asljs-button>
          <asljs-button id="btn-cancel-settings"></asljs-button>
        </div>
      </div>
    </div>
  `;
}
