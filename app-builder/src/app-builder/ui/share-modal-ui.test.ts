import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  JSDOM,
} from 'jsdom';
import {
  createShareModalUi,
  renderShareModal,
} from './share-modal-ui.js';

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

test(
  'createShareModalUi opens and prepares link with current share options',
  async () => {
    const dom = new JSDOM(renderShareModal());
    const previousDocument = globalThis.document;
    const previousNavigator = globalThis.navigator;

    globalThis.document = dom.window.document;
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: dom.window.navigator,
    });

    try {
      const prepareCalls: Array<{
        minified: boolean;
        excludeNonApplicationFiles: boolean;
      }> = [];
      const ui = createShareModalUi({
        canOpen: () => true,
        readAppName: () => 'Demo App',
        prepareLink: async shareOptions => {
          prepareCalls.push(shareOptions);

          return {
            url: `https://example.test/${prepareCalls.length}`,
            status: `ready ${prepareCalls.length}`,
          };
        },
        downloadExport: async () => {},
      });
      const modal = document.getElementById('share-modal') as HTMLElement;
      const output = document.getElementById('share-link-output') as HTMLTextAreaElement;
      const status = document.getElementById('share-link-status') as HTMLElement;
      const minified = document.getElementById('share-minified-input') as HTMLInputElement;

      ui.open();
      await flushMicrotasks();

      assert.equal(modal.classList.contains('hidden'), false);
      assert.deepEqual(prepareCalls, [
        { minified: false, excludeNonApplicationFiles: false },
      ]);
      assert.equal(output.value, 'https://example.test/1');
      assert.equal(status.textContent, 'ready 1');

      minified.checked = true;
      minified.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
      await flushMicrotasks();

      assert.deepEqual(prepareCalls, [
        { minified: false, excludeNonApplicationFiles: false },
        { minified: true, excludeNonApplicationFiles: false },
      ]);
      assert.equal(output.value, 'https://example.test/2');
      assert.equal(status.textContent, 'ready 2');
    } finally {
      globalThis.document = previousDocument;
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: previousNavigator,
      });
    }
  },
);

test(
  'createShareModalUi copies links, downloads exports, and respects canOpen',
  async () => {
    const dom = new JSDOM(renderShareModal());
    const previousDocument = globalThis.document;
    const previousNavigator = globalThis.navigator;

    globalThis.document = dom.window.document;

    try {
      const copied: string[] = [];
      const downloads: Array<{
        minified: boolean;
        excludeNonApplicationFiles: boolean;
      }> = [];
      let canOpen = false;

      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: {
          clipboard: {
            writeText: async (value: string) => {
              copied.push(value);
            },
          },
        },
      });

      const ui = createShareModalUi({
        canOpen: () => canOpen,
        readAppName: () => 'Demo App',
        prepareLink: async () => ({
          url: 'https://example.test/shared',
          status: 'ready',
        }),
        downloadExport: async options => {
          downloads.push(options);
        },
      });
      const modal = document.getElementById('share-modal') as HTMLElement;
      const shareButton = document.getElementById('btn-share-link') as HTMLElement;
      const downloadButton = document.getElementById('btn-share-download') as HTMLElement;
      const excludeTests = document.getElementById('share-exclude-tests-input') as HTMLInputElement;

      ui.open();
      await flushMicrotasks();
      assert.equal(modal.classList.contains('hidden'), true);

      canOpen = true;
      ui.open();
      await flushMicrotasks();

      shareButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await flushMicrotasks();

      assert.deepEqual(copied, [ 'https://example.test/shared' ]);

      excludeTests.checked = true;
      downloadButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await flushMicrotasks();

      assert.deepEqual(downloads, [
        { minified: false, excludeNonApplicationFiles: true },
      ]);
    } finally {
      globalThis.document = previousDocument;
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: previousNavigator,
      });
    }
  },
);