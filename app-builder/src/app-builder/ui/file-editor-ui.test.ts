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
    const dom = new JSDOM('<select id="files"></select><textarea id="content"></textarea><img id="preview"><p id="hint"></p>');
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;

    const document = dom.window.document;
    const select = document.getElementById('files') as HTMLSelectElement;
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const imagePreview = document.getElementById('preview') as HTMLImageElement;
    const previewHint = document.getElementById('hint') as HTMLElement;

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
        imagePreviewElement: imagePreview,
        previewFallbackElement: previewHint,
        files,
        activeFileName: 'app.js',
      });

      assert.equal(select.disabled, false);
      assert.equal(select.value, 'app.js');
      assert.equal(textarea.disabled, false);
      assert.equal(textarea.value, 'console.log(1);');
      assert.equal(imagePreview.classList.contains('hidden'), true);
    } finally {
      globalThis.document = previousDocument;
    }
  });

test(
  'renderFileSelectUi includes dotfiles and keeps the active file when selected',
  () => {
    const dom = new JSDOM('<select id="files"></select>');
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;

    const document = dom.window.document;
    const select = document.getElementById('files') as HTMLSelectElement;

    const files = [
      { name: '.README.md', content: '# previous' },
      { name: 'README.md', content: '# current' },
      { name: 'app.js', content: 'console.log(1);' },
    ];

    try {
      renderFileSelectUi({
        selectElement: select,
        files,
        activeFileName: '.README.md',
      });

      assert.equal(select.disabled, false);
      assert.deepEqual(
        Array.from(select.options).map(option => option.value),
        [ '.README.md', 'README.md', 'app.js' ],
      );
      assert.equal(select.value, '.README.md');
    } finally {
      globalThis.document = previousDocument;
    }
  });

test(
  'renderFileContentUi shows image preview for image data files',
  () => {
    const dom = new JSDOM('<textarea id="content"></textarea><img id="preview" class="hidden"><p id="hint" class="hidden"></p>');
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;

    const document = dom.window.document;
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const imagePreview = document.getElementById('preview') as HTMLImageElement;
    const previewHint = document.getElementById('hint') as HTMLElement;

    try {
      renderFileContentUi({
        textAreaElement: textarea,
        imagePreviewElement: imagePreview,
        previewFallbackElement: previewHint,
        files: [
          { name: 'assets/logo.png', content: 'data:image/png;base64,AQID' },
        ],
        activeFileName: 'assets/logo.png',
      });

      assert.equal(textarea.disabled, true);
      assert.equal(textarea.classList.contains('hidden'), true);
      assert.equal(imagePreview.classList.contains('hidden'), false);
      assert.equal(imagePreview.src.endsWith('data:image/png;base64,AQID'), true);
      assert.equal(previewHint.textContent, 'image/png preview');
    } finally {
      globalThis.document = previousDocument;
    }
  });
