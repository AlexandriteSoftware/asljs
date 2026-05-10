import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  renderWorkspace,
} from './workspace-ui.js';

test(
  'renderWorkspace includes the core workspace controls and panels',
  () => {
    const html = renderWorkspace();

    for (const fragment of [
      'id="workspace"',
      'id="app-workspace"',
      'id="first-app-setup"',
      'id="app-select"',
      'id="chat-model-select"',
      'id="generation-model-select"',
      'id="file-select"',
      'id="preview-frame"',
      'id="btn-share"',
      'id="mobile-tab-bar"',
      'id="mobile-tab-chat"',
      'id="mobile-tab-files"',
      'id="mobile-tab-run"',
    ]) {
      assert.equal(
        html.includes(fragment),
        true,
        `Expected workspace markup to contain ${fragment}.`,
      );
    }
  },
);
