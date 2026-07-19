import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createNameModalUi,
         renderNameModal }
  from './name-modal-ui.js';

async function flushMicrotasks(
  ): Promise<void>
{
  await Promise.resolve();
  await Promise.resolve();
}

test(
  'createNameModalUi opens and confirms with trimmed values',
  async () =>
  {
    const dom =
      new JSDOM(renderNameModal());

    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    try {
      const confirmed: string[] = [];

      const ui =
        createNameModalUi();

      const modal =
        document.getElementById('name-modal') as HTMLElement;

      const title =
        document.getElementById(
          'name-modal-title') as HTMLElement;

      const input =
        document.getElementById(
          'app-name-input') as HTMLElement & {
        value: string | null;
        focus: () => void;
      };

      const confirmButton =
        document.getElementById(
          'btn-confirm-name') as HTMLElement;

      let focused = false;

      input.focus = () =>
      {
        focused = true;
      };

      ui.open(
        {
          title: 'Rename App',
          initialValue: ' Old Name ',
          selectText: false,
          onConfirm: async value =>
          {
            confirmed.push(value);
          }
        }
      );

      assert.equal(
        modal.classList.contains('hidden'),
        false
      );

      assert.equal(
        title.textContent,
        'Rename App'
      );

      assert.equal(
        input.value,
        ' Old Name '
      );

      assert.equal(
        focused,
        true
      );

      input.value = '  New Name  ';

      confirmButton.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true })
      );

      await flushMicrotasks();

      assert.deepEqual(
        confirmed,
        ['New Name']
      );

      assert.equal(
        modal.classList.contains('hidden'),
        true
      );
    } finally {
      globalThis.document = previousDocument;
    }
  }
);

test(
  'createNameModalUi closes on overlay click and blocks blank confirmation',
  async () =>
  {
    const dom =
      new JSDOM(renderNameModal());

    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    try {
      let confirmed = false;

      const ui =
        createNameModalUi();

      const modal =
        document.getElementById('name-modal') as HTMLElement;

      const input =
        document.getElementById(
          'app-name-input') as HTMLElement & {
        value: string | null;
        focus: () => void;
      };

      const confirmButton =
        document.getElementById(
          'btn-confirm-name') as HTMLElement;

      let focused = false;

      input.focus = () =>
      {
        focused = true;
      };

      ui.open(
        {
          title: 'New App',
          initialValue: '',
          selectText: false,
          onConfirm: async () =>
          {
            confirmed = true;
          }
        }
      );

      input.value = '   ';

      confirmButton.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true })
      );

      await flushMicrotasks();

      assert.equal(
        confirmed,
        false
      );

      assert.equal(
        focused,
        true
      );

      modal.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true })
      );

      assert.equal(
        modal.classList.contains('hidden'),
        true
      );

      ui.close();

      assert.equal(
        modal.classList.contains('hidden'),
        true
      );
    } finally {
      globalThis.document = previousDocument;
    }
  }
);
