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
