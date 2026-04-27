import {
  renderFirstApplicationDialog,
} from './first-application-dialog-ui.js';

export function renderWorkspace(): string {
  return `
    <main id="workspace">
      <div id="app-workspace" class="app-workspace">
        <div id="top-bar" class="top-bar">
          <div class="top-bar-left">
            <a href="../" class="logo-link topbar-brand" title="Back to home">
              <strong>ASLJS</strong>
            </a>
            <asljs-button-settings id="btn-settings" title="Settings"></asljs-button-settings>
            <span class="topbar-sep" aria-hidden="true"></span>
            <asljs-button id="btn-new-app" title="New application"></asljs-button>
            <asljs-button id="btn-import" title="Import application"></asljs-button>
            <asljs-select id="app-select" title="Select application"></asljs-select>
            <asljs-button-settings id="btn-project-settings" title="Project settings"></asljs-button-settings>
            <span class="topbar-sep" aria-hidden="true"></span>
            <asljs-button id="btn-toggle-chat" title="Show or hide chat"></asljs-button>
            <asljs-button id="btn-toggle-files" title="Show or hide files editor"></asljs-button>
          </div>
          <div class="top-bar-right">
            <asljs-button id="btn-run"></asljs-button>
            <asljs-button id="btn-share" title="Share app"></asljs-button>
            <a
              href="https://github.com/AlexandriteSoftware/asljs"
              class="btn btn-ghost btn-sm"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub repository"
            >GitHub</a>
            <a
              href="https://github.com/AlexandriteSoftware/asljs/issues"
              class="btn btn-ghost btn-sm"
              target="_blank"
              rel="noopener noreferrer"
              title="Issues and questions"
            >Issues/Questions</a>
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

        <div id="panels" class="panels">
          <section id="panel-chat" class="panel">
            <div class="panel-header">
              <div class="panel-header-left">
                <span>Chat</span>
              </div>
              <asljs-select id="chat-model-select" title="Chat model"></asljs-select>
            </div>
            <div id="chat-root" class="chat-root"></div>
            <div class="generation-controls">
              <div class="lane-controls">
                <asljs-select id="generation-model-select" title="Generation model"></asljs-select>
                <asljs-button id="btn-start-generation"></asljs-button>
                <asljs-button id="btn-stop-generation"></asljs-button>
              </div>
              <div id="generation-status" class="form-hint generation-status">Idle.</div>
            </div>
          </section>

          <section id="panel-editor" class="panel">
            <div class="panel-header">
              <span>Files</span>
              <asljs-select id="file-select" title="Select file"></asljs-select>
            </div>
            <div id="editor-layout" class="editor-layout">
              <asljs-file
                id="file-view"
                class="file-preview-panel"
              ></asljs-file>
            </div>
          </section>

          <section id="panel-preview" class="panel">
            <div class="panel-header">
              <span id="panel-preview-title">Preview</span>
            </div>
            <iframe
              id="preview-frame"
              class="preview-frame"
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="App preview"
            ></iframe>
          </section>
        </div>
      </div>
    </main>
  `;
}
