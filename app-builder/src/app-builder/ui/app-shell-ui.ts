import { renderNameModal }
  from './name-modal-ui.js';
import { renderProjectSettingsModal }
  from './project-settings-modal-ui.js';
import { renderSettingsModal }
  from './settings-modal-ui.js';
import { renderShareModal }
  from './share-modal-ui.js';
import { renderWorkspace }
  from './workspace-ui.js';

export function renderAppBuilderShell(): void
{
  const root =
    document.getElementById(
      'app-builder-root');

  if (root === null) {
    throw new Error('Missing #app-builder-root.');
  }

  const template =
    document.createElement('template');

  template.innerHTML = `
    ${renderWorkspace()}
    ${renderSettingsModal()}
    ${renderNameModal()}
    ${renderProjectSettingsModal()}
    ${renderShareModal()}
    <input id="import-file" class="d-none" type="file" accept=".json" />
  `;

  root.replaceChildren(
    template.content.cloneNode(true)
  );
}
