import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createFirstApplicationDialogUi,
         renderFirstApplicationDialog }
  from './first-application-dialog-ui.js';

async function flushMicrotasks(): Promise<void>
{
  await Promise.resolve();
  await Promise.resolve();
}

test(
  'createFirstApplicationDialogUi shows, clears, and submits trimmed values',
  async () =>
  {
    const dom =
      new JSDOM(renderFirstApplicationDialog());

    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    try {
      const calls: Array<{ name: string; apiKey: string; }> = [];

      const ui =
        createFirstApplicationDialogUi(
          {
          onCreateApplication: async values =>
          {
            calls.push(values);
          },
          onCreateTodoSample: async () =>
          {}
        });

      const dialog =
        document.getElementById(
          'first-app-setup') as HTMLElement;

      const nameInput =
        document.getElementById(
          'first-app-name-input') as
        & HTMLElement
        & { value: string | null; };

      const apiKeyInput =
        document.getElementById(
          'first-api-key-input') as
        & HTMLElement
        & { value: string | null; };

      const createButton =
        document.getElementById(
          'btn-create-first-app') as HTMLElement;

      nameInput.value = 'stale';
      apiKeyInput.value = 'stale-key';

      ui.show();

      assert.equal(
        dialog.classList.contains('hidden'),
        false
      );

      assert.equal(
        nameInput.value,
        ''
      );

      assert.equal(
        apiKeyInput.value,
        ''
      );

      nameInput.value = '  Demo App  ';
      apiKeyInput.value = '  sk-demo  ';

      createButton.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true })
      );

      await flushMicrotasks();

      assert.deepEqual(
        calls,
        [
          { name: 'Demo App', apiKey: 'sk-demo' }
        ]
      );

      ui.hide();

      assert.equal(
        dialog.classList.contains('hidden'),
        true
      );
    } finally {
      globalThis.document = previousDocument;
    }
  }
);

test(
  'createFirstApplicationDialogUi blocks blank names and allows sample creation',
  async () =>
  {
    const dom =
      new JSDOM(renderFirstApplicationDialog());

    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    try {
      const createdApps: Array<{ name: string; apiKey: string; }> = [];
      const createdSamples: Array<{ name: string; apiKey: string; }> = [];

      const ui =
        createFirstApplicationDialogUi(
          {
          onCreateApplication: async values =>
          {
            createdApps.push(values);
          },
          onCreateTodoSample: async values =>
          {
            createdSamples.push(values);
          }
        });

      const nameInput =
        document.getElementById(
          'first-app-name-input') as
        & HTMLElement
        & { value: string | null; focus: () => void; };

      const apiKeyInput =
        document.getElementById(
          'first-api-key-input') as
        & HTMLElement
        & { value: string | null; };

      const createButton =
        document.getElementById(
          'btn-create-first-app') as HTMLElement;

      const sampleButton =
        document.getElementById(
          'btn-create-todo-sample') as HTMLElement;

      let focused = false;

      nameInput.focus = () =>
      {
        focused = true;
      };

      ui.show();
      nameInput.value = '   ';

      createButton.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true })
      );

      await flushMicrotasks();

      assert.equal(
        createdApps.length,
        0
      );

      assert.equal(
        focused,
        true
      );

      nameInput.value = '  Sample App ';
      apiKeyInput.value = ' key ';

      sampleButton.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true })
      );

      await flushMicrotasks();

      assert.deepEqual(
        createdSamples,
        [
          { name: 'Sample App', apiKey: 'key' }
        ]
      );
    } finally {
      globalThis.document = previousDocument;
    }
  }
);
