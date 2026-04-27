export function renderShareModal(): string {
  return `
    <div id="share-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <h3>Share</h3>
          <asljs-button id="btn-close-share"></asljs-button>
        </div>
        <div class="modal-body">
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <asljs-button id="btn-share-link"></asljs-button>
            <asljs-button id="btn-share-download"></asljs-button>
          </div>
          <label class="form-hint" style="display:block; margin-top:0.6rem;">
            <input id="share-minified-input" type="checkbox" />
            Share minified (esbuild JS/CSS + compact HTML/CSS)
          </label>
          <label class="form-hint" style="display:block; margin-top:0.35rem;">
            <input id="share-exclude-tests-input" type="checkbox" />
            Only application files
          </label>
          <p id="share-link-status" class="form-hint"></p>
          <textarea
            id="share-link-output"
            class="prompt-view"
            style="min-height: 8rem;"
            readonly
            placeholder="Share link will appear here..."
          ></textarea>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.6rem;">
            <asljs-button id="btn-share-copy-text"></asljs-button>
            <asljs-button id="btn-share-copy-html"></asljs-button>
          </div>
        </div>
        <div class="modal-footer">
          <asljs-button id="btn-close-share-2"></asljs-button>
        </div>
      </div>
    </div>
  `;
}
