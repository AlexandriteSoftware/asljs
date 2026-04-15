import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { JSDOM }
  from 'jsdom';
import {
  renderFileSelectUi,
  renderFileContentUi,
} from './file-editor-ui.js';

test(
  'renderFileSelectUi and renderFileContentUi set active file state',
  () => {
    const dom = new JSDOM('<select id="files"></select><textarea id="content"></textarea>');
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;

    const document = dom.window.document;
    const select = document.getElementById('files') as HTMLSelectElement;
    const textarea = document.getElementById('content') as HTMLTextAreaElement;

    const files = [
      { name: 'index.html', content: '<html></html>' },
      { name: 'app.js', content: 'console.log(1);' },
    ];

    try {
      renderFileSelectUi({
        selectElement: select,
        files,
        activeFileName: 'app.js',
      });

      renderFileContentUi({
        textAreaElement: textarea,
        files,
        activeFileName: 'app.js',
      });

      assert.equal(select.disabled, false);
      assert.equal(select.value, 'app.js');
      assert.equal(textarea.disabled, false);
      assert.equal(textarea.value, 'console.log(1);');
    } finally {
      globalThis.document = previousDocument;
    }
  });
