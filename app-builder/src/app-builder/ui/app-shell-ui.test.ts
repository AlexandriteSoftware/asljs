import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { JSDOM }
  from 'jsdom';
import { renderAppBuilderShell }
  from './app-shell-ui.js';

test(
  'renderAppBuilderShell renders app regions and runtime element ids',
  () => {
    const dom =
      new JSDOM(
        '<!doctype html><html><body><div id="app-builder-root"></div></body></html>');
    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    try {
      renderAppBuilderShell();

      for (const id of [
        'workspace',
        'app-workspace',
        'first-app-setup',
        'settings-modal',
        'name-modal',
        'project-settings-modal',
        'share-modal',
        'import-file',
      ]) {
        assert.notEqual(
          document.getElementById(id),
          null,
          `Expected #${id} to exist.`);
      }
    } finally {
      globalThis.document = previousDocument;
    }
  });
