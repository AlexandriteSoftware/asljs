import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { JSDOM }
  from 'jsdom';
import type {
  renderFileContentUi,
  renderFileSelectUi,
} from './file-editor-ui.js';

type FileEditorUiModule =
  { renderFileContentUi: typeof renderFileContentUi;
    renderFileSelectUi: typeof renderFileSelectUi; };

type TestFileElement =
  { provider:
      { loadFile: (fileName: string) => Promise<unknown>;
        saveText?: (fileName: string, text: string) => Promise<void> | void; }
      | null;
    handlers: unknown[];
    fileName: string | null; };

type TestSelectElement =
  { items: Array<{ value: string; label: string; disabled?: boolean; }>;
    value: string | null;
    disabled: boolean; };

test(
  'renderFileSelectUi and renderFileContentUi set active file state',
  async () => {
    const dom = new JSDOM('<div id="files"></div>');
    const previousDocument = globalThis.document;
    const previousWindow = globalThis.window;
    const previousCustomElements = globalThis.customElements;
    const previousHTMLElement = globalThis.HTMLElement;
    globalThis.document = dom.window.document;
    globalThis.window = dom.window as unknown as typeof globalThis.window;
    globalThis.customElements = dom.window.customElements;
    globalThis.HTMLElement = dom.window.HTMLElement;

    const document = dom.window.document;
    const select =
      document.getElementById('files') as unknown as TestSelectElement;
    const ui = await importFileEditorUi();
    const fileElement: TestFileElement =
      { provider: null,
        handlers: [ ],
        fileName: null };

    const files = [
      { name: 'index.html', content: '<html></html>' },
      { name: 'app.js', content: 'console.log(1);' },
    ];

    try {
      ui.renderFileSelectUi({
        selectElement: select,
        files,
        activeFileName: 'app.js',
      });

      ui.renderFileContentUi({
        fileElement: fileElement as never,
        files,
        activeFileName: 'app.js',
      });

      assert.equal(select.disabled, false);
      assert.equal(select.value, 'app.js');
      assert.equal(fileElement.fileName, 'app.js');
      assert.equal(fileElement.handlers.length, 3);

      const loaded =
        await fileElement.provider?.loadFile('app.js');

      assert.deepEqual(
        loaded,
        { name: 'app.js',
          text: 'console.log(1);' });
    } finally {
      globalThis.document = previousDocument;
      globalThis.window = previousWindow;
      globalThis.customElements = previousCustomElements;
      globalThis.HTMLElement = previousHTMLElement;
    }
  });

test(
  'renderFileSelectUi includes dotfiles and keeps the active file when selected',
  async () => {
    const dom = new JSDOM('<div id="files"></div>');
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;

    const document = dom.window.document;
    const select =
      document.getElementById('files') as unknown as TestSelectElement;

    const files = [
      { name: '.README.md', content: '# previous' },
      { name: 'README.md', content: '# current' },
      { name: 'app.js', content: 'console.log(1);' },
    ];

    const ui = await importFileEditorUi();

    try {
      ui.renderFileSelectUi({
        selectElement: select,
        files,
        activeFileName: '.README.md',
      });

      assert.equal(select.disabled, false);
      assert.deepEqual(
        select.items.map(option => option.value),
        [ '.README.md', 'README.md', 'app.js' ],
      );
      assert.equal(select.value, '.README.md');
    } finally {
      globalThis.document = previousDocument;
    }
  });

test(
  'renderFileContentUi shows image preview for image data files',
  async () => {
    const dom = new JSDOM('<div></div>');
    const previousDocument = globalThis.document;
    const previousWindow = globalThis.window;
    const previousCustomElements = globalThis.customElements;
    const previousHTMLElement = globalThis.HTMLElement;
    globalThis.document = dom.window.document;
    globalThis.window = dom.window as unknown as typeof globalThis.window;
    globalThis.customElements = dom.window.customElements;
    globalThis.HTMLElement = dom.window.HTMLElement;

    const ui = await importFileEditorUi();
    const fileElement: TestFileElement =
      { provider: null,
        handlers: [ ],
        fileName: null };

    try {
      ui.renderFileContentUi({
        fileElement: fileElement as never,
        files: [
          { name: 'assets/logo.png', content: 'data:image/png;base64,AQID' },
        ],
        activeFileName: 'assets/logo.png',
      });

      const imagePreview =
        await fileElement.provider?.loadFile('assets/logo.png');

      assert.deepEqual(
        imagePreview,
        { name: 'assets/logo.png',
          mimeType: 'image/png',
          dataUrl: 'data:image/png;base64,AQID' });
    } finally {
      globalThis.document = previousDocument;
      globalThis.window = previousWindow;
      globalThis.customElements = previousCustomElements;
      globalThis.HTMLElement = previousHTMLElement;
    }
  });

async function importFileEditorUi(): Promise<FileEditorUiModule> {
  return await import('./file-editor-ui.js');
}
