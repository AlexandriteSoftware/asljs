import {
  renderFirstApplicationDialog,
} from './first-application-dialog-ui.js';

export function renderWorkspace(): string {
  return `
    <main id="workspace" class="d-flex flex-column min-vh-100 bg-body-tertiary">
      <div id="app-workspace" class="d-flex flex-column flex-grow-1 min-vh-100">
        <div id="top-bar" class="navbar navbar-expand border-bottom bg-body px-3 py-2 gap-3 flex-nowrap shadow-sm">
          <div class="d-flex align-items-center gap-2 flex-grow-1 min-w-0 flex-wrap">
            <a href="../" class="navbar-brand d-inline-flex align-items-center gap-2 fw-semibold text-decoration-none me-1" title="Back to home">
              <i class="bi bi-boxes text-primary"></i>
              <strong>ASLJS</strong>
            </a>
            <asljs-button-settings id="btn-settings" title="Settings"></asljs-button-settings>
            <span class="vr d-none d-md-inline-flex"></span>
            <asljs-button id="btn-new-app" title="New application"></asljs-button>
            <asljs-button id="btn-import" title="Import application"></asljs-button>
            <asljs-select id="app-select" title="Select application"></asljs-select>
            <asljs-button-settings id="btn-project-settings" title="Project settings"></asljs-button-settings>
            <span class="vr d-none d-lg-inline-flex"></span>
            <asljs-button id="btn-toggle-chat" title="Show or hide chat"></asljs-button>
            <asljs-button id="btn-toggle-files" title="Show or hide files editor"></asljs-button>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0 flex-wrap justify-content-end">
            <asljs-button id="btn-run"></asljs-button>
            <asljs-button id="btn-share" title="Share app"></asljs-button>
            <a
              href="https://github.com/AlexandriteSoftware/asljs"
              class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub repository"
            ><i class="bi bi-github"></i><span>GitHub</span></a>
            <a
              href="https://github.com/AlexandriteSoftware/asljs/issues"
              class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
              title="Issues and questions"
            ><i class="bi bi-question-circle"></i><span>Issues</span></a>
            <iframe
              src="https://ghbtns.com/github-btn.html?user=AlexandriteSoftware&repo=asljs&type=star&size=small"
              frameborder="0"
              scrolling="0"
              width="100"
              height="20"
              title="GitHub"
            ></iframe>
          </div>
        </div>

        ${renderFirstApplicationDialog()}

        <div id="panels" class="d-flex flex-grow-1 overflow-hidden app-panels">
          <section id="panel-chat" class="panel d-flex flex-column flex-fill min-w-0 border-end bg-body">
            <div class="panel-header d-flex align-items-center justify-content-between gap-2 px-3 py-2 border-bottom bg-body-tertiary text-secondary text-uppercase fw-semibold small">
              <div class="d-flex align-items-center gap-2 min-w-0">
                <i class="bi bi-chat-dots"></i>
                <span>Chat</span>
              </div>
              <asljs-select id="chat-model-select" title="Chat model"></asljs-select>
            </div>
            <div id="chat-root" class="chat-root d-flex flex-column flex-grow-1 min-h-0 p-3 gap-3"></div>
            <div class="d-flex flex-column gap-2 px-3 pb-3">
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <asljs-select id="generation-model-select" title="Generation model"></asljs-select>
                <asljs-button id="btn-start-generation"></asljs-button>
                <asljs-button id="btn-stop-generation"></asljs-button>
              </div>
              <div id="generation-status" class="small text-body-secondary">Idle.</div>
            </div>
          </section>

          <section id="panel-editor" class="panel d-flex flex-column flex-fill min-w-0 border-end bg-body">
            <div class="panel-header d-flex align-items-center justify-content-between gap-2 px-3 py-2 border-bottom bg-body-tertiary text-secondary text-uppercase fw-semibold small">
              <div class="d-flex align-items-center gap-2 min-w-0">
                <i class="bi bi-folder2-open"></i>
                <span>Files</span>
              </div>
              <asljs-select id="file-select" title="Select file"></asljs-select>
            </div>
            <div id="editor-layout" class="d-flex flex-column flex-grow-1 min-h-0 p-3">
              <asljs-file
                id="file-view"
                class="file-preview-panel flex-grow-1"
              ></asljs-file>
            </div>
          </section>

          <section id="panel-preview" class="panel d-flex flex-column flex-fill min-w-0 bg-body">
            <div class="panel-header d-flex align-items-center justify-content-between gap-2 px-3 py-2 border-bottom bg-body-tertiary text-secondary text-uppercase fw-semibold small">
              <div class="d-flex align-items-center gap-2 min-w-0">
                <i class="bi bi-window"></i>
                <span id="panel-preview-title">Preview</span>
              </div>
            </div>
            <iframe
              id="preview-frame"
              class="preview-frame flex-grow-1 border-0 bg-body"
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="App preview"
            ></iframe>
          </section>
        </div>
        <nav id="mobile-tab-bar" class="mobile-tab-bar border-top bg-body p-2 gap-2" aria-label="Workspace tabs">
          <asljs-button id="mobile-tab-chat" title="Chat tab"></asljs-button>
          <asljs-button id="mobile-tab-files" title="Files tab"></asljs-button>
          <asljs-button id="mobile-tab-run" title="Run tab"></asljs-button>
        </nav>
      </div>
    </main>
  `;
}
