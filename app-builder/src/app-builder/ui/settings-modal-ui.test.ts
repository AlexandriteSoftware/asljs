import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createSettingsModalUi,
         renderSettingsModal }
  from './settings-modal-ui.js';

async function flushMicrotasks(
  ): Promise<void>
{
  await Promise.resolve();
  await Promise.resolve();
}

test(
  'createSettingsModalUi opens with loaded values and saves form text',
  async () =>
  {
    const dom =
      new JSDOM(renderSettingsModal());

    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    try {
      const saved: Array<{
        apiKey: string;
        theme: string;
        fontSizeText: string;
        maxToolStepsText: string;
      }> = [];

      const ui =
        createSettingsModalUi(
          {
          loadValues: async () => ({
            apiKey: 'sk-demo',
            theme: 'light',
            fontSize: 16,
            maxToolSteps: 30
          }),
          onSave: async values =>
          {
            saved.push(values);
          }
        });

      const modal =
        document.getElementById(
          'settings-modal') as HTMLElement;

      const apiKeyInput =
        document.getElementById(
          'api-key-input') as
        & HTMLElement
        & { value: string | null; };

      const themeSelect =
        document.getElementById('theme-select') as
        & HTMLElement
        & { value: string | null; };

      const fontSizeInput =
        document.getElementById(
          'font-size-input') as
        & HTMLElement
        & { value: string | null; };

      const maxToolStepsInput =
        document.getElementById(
          'max-tool-steps-input') as HTMLElement & { value: string | null; };

      const saveButton =
        document.getElementById(
          'btn-save-settings') as HTMLElement;

      await ui.open();

      assert.equal(
        modal.classList.contains('hidden'),
        false);

      assert.equal(
        apiKeyInput.value,
        'sk-demo');

      assert.equal(
        themeSelect.value,
        'light');

      assert.equal(
        fontSizeInput.value,
        '16');

      assert.equal(
        maxToolStepsInput.value,
        '30');

      apiKeyInput.value = '  sk-next  ';
      themeSelect.value = 'dark';
      fontSizeInput.value = '18';
      maxToolStepsInput.value = '42';

      saveButton.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true }));

      await flushMicrotasks();

      assert.deepEqual(
        saved,
        [
          {
            apiKey: 'sk-next',
            theme: 'dark',
            fontSizeText: '18',
            maxToolStepsText: '42'
          }
        ]);

      assert.equal(
        modal.classList.contains('hidden'),
        true);
    } finally {
      globalThis.document = previousDocument;
    }
  });

test(
  'createSettingsModalUi closes from overlay and cancel controls',
  async () =>
  {
    const dom =
      new JSDOM(renderSettingsModal());

    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    try {
      const ui =
        createSettingsModalUi(
          {
          loadValues: async () => ({
            apiKey: '',
            theme: 'dark',
            fontSize: 14,
            maxToolSteps: 20
          }),
          onSave: async () =>
          {}
        });

      const modal =
        document.getElementById(
          'settings-modal') as HTMLElement;

      const cancelButton =
        document.getElementById(
          'btn-cancel-settings') as HTMLElement;

      await ui.open();

      cancelButton.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true }));

      assert.equal(
        modal.classList.contains('hidden'),
        true);

      await ui.open();

      modal.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true }));

      assert.equal(
        modal.classList.contains('hidden'),
        true);
    } finally {
      globalThis.document = previousDocument;
    }
  });
