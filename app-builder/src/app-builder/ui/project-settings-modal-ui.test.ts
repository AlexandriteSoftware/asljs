import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createProjectSettingsModalUi,
         renderProjectSettingsModal }
  from './project-settings-modal-ui.js';

async function flushMicrotasks(): Promise<void>
{
  await Promise.resolve();
  await Promise.resolve();
}

test(
  'createProjectSettingsModalUi opens and saves trimmed values',
  async () =>
  {
    const dom =
      new JSDOM(renderProjectSettingsModal());

    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    try {
      const saved: Array<{
        name: string;
        authorName: string;
        authorEmail: string;
      }> = [];

      const ui =
        createProjectSettingsModalUi(
          {
          onSave: async values =>
          {
            saved.push(values);
          },
          onDelete: async () =>
          {}
        });

      const modal =
        document.getElementById(
          'project-settings-modal') as HTMLElement;

      const nameInput =
        document.getElementById(
          'project-name-input') as
        & HTMLElement
        & { value: string | null; };

      const authorNameInput =
        document.getElementById(
          'project-author-name-input') as HTMLElement & { value: string | null; };

      const authorEmailInput =
        document.getElementById(
          'project-author-email-input') as HTMLElement & { value: string | null; };

      const saveButton =
        document.getElementById(
          'btn-save-project-settings') as HTMLElement;

      ui.open(
        {
          name: 'Starter',
          authorName: 'Jane',
          authorEmail: 'jane@example.com'
        }
      );

      assert.equal(
        modal.classList.contains('hidden'),
        false
      );

      assert.equal(
        nameInput.value,
        'Starter'
      );

      assert.equal(
        authorNameInput.value,
        'Jane'
      );

      assert.equal(
        authorEmailInput.value,
        'jane@example.com'
      );

      nameInput.value = '  Updated App  ';
      authorNameInput.value = '  Alex  ';
      authorEmailInput.value = '  alex@example.com  ';

      saveButton.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true })
      );

      await flushMicrotasks();

      assert.deepEqual(
        saved,
        [
          {
            name: 'Updated App',
            authorName: 'Alex',
            authorEmail: 'alex@example.com'
          }
        ]
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
  'createProjectSettingsModalUi deletes and blocks blank project names',
  async () =>
  {
    const dom =
      new JSDOM(renderProjectSettingsModal());

    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    try {
      let deleted = false;
      let saved = false;

      const ui =
        createProjectSettingsModalUi(
          {
          onSave: async () =>
          {
            saved = true;
          },
          onDelete: async () =>
          {
            deleted = true;
          }
        });

      const modal =
        document.getElementById(
          'project-settings-modal') as HTMLElement;

      const nameInput =
        document.getElementById(
          'project-name-input') as
        & HTMLElement
        & { value: string | null; focus: () => void; };

      const saveButton =
        document.getElementById(
          'btn-save-project-settings') as HTMLElement;

      const deleteButton =
        document.getElementById(
          'btn-delete-project') as HTMLElement;

      let focused = false;

      nameInput.focus = () =>
      {
        focused = true;
      };

      ui.open(
        {
          name: '',
          authorName: '',
          authorEmail: ''
        }
      );

      nameInput.value = '   ';

      saveButton.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true })
      );

      await flushMicrotasks();

      assert.equal(
        saved,
        false
      );

      assert.equal(
        focused,
        true
      );

      deleteButton.dispatchEvent(
        new dom.window.MouseEvent('click', { bubbles: true })
      );

      await flushMicrotasks();

      assert.equal(
        deleted,
        true
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
