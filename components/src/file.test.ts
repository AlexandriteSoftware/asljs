import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM,
  } from 'jsdom';
import type {
    createImageFileHandler,
    createPdfFileHandler,
    createTextEditorFileHandler,
    createTextFileHandler,
  } from './file.js';

type FileViewElement =
  HTMLElement
  & {
    provider: {
      loadFile: (fileName: string) => Promise<unknown>;
      saveText?: (fileName: string, text: string) => Promise<void> | void;
    } | null;
    handlers: unknown[];
    fileName: string | null;
    updateComplete: Promise<boolean>;
  };

type FileModule =
  { createImageFileHandler: typeof createImageFileHandler;
    createPdfFileHandler: typeof createPdfFileHandler;
    createTextEditorFileHandler: typeof createTextEditorFileHandler;
    createTextFileHandler: typeof createTextFileHandler; };

let domRestore: (() => void) | null = null;
let isComponentsLoaded = false;
let fileModule: FileModule | null = null;

test(
  'file-view: renders pdf handler for pdf files',
  async () => {
    await ensureDomAndFileLoaded();
    resetDomBody();

    const file =
      await getFileModule();

    const element =
      document.createElement('asljs-file') as FileViewElement;

    element.provider =
      { loadFile: async () =>
          ({ name: 'invoice.pdf',
             blob: new Blob([ 'pdf' ], { type: 'application/pdf' }) }) };
    element.handlers = [ file.createPdfFileHandler() ];
    element.fileName = 'invoice.pdf';

    document.body.appendChild(element);

    await settle(element);
    await waitFor(() => element.querySelector('iframe') !== null);

    const frame =
      element.querySelector('iframe') as HTMLIFrameElement;

    assert.equal(frame !== null, true);
    assert.equal(frame.src.startsWith('blob:'), true);
  });

test(
  'file-view: renders image handler for data url images',
  async () => {
    await ensureDomAndFileLoaded();
    resetDomBody();

    const file =
      await getFileModule();

    const element =
      document.createElement('asljs-file') as FileViewElement;

    element.provider =
      { loadFile: async () =>
          ({ name: 'logo.png',
             mimeType: 'image/png',
             dataUrl: 'data:image/png;base64,AQID' }) };
    element.handlers = [ file.createImageFileHandler() ];
    element.fileName = 'logo.png';

    document.body.appendChild(element);

    await settle(element);
    await waitFor(() => element.querySelector('img') !== null);

    const image =
      element.querySelector('img') as HTMLImageElement;

    assert.equal(image !== null, true);
    assert.equal(image.src.endsWith('data:image/png;base64,AQID'), true);
  });

test(
  'file-view: renders text handler for text files',
  async () => {
    await ensureDomAndFileLoaded();
    resetDomBody();

    const file =
      await getFileModule();

    const element =
      document.createElement('asljs-file') as FileViewElement;

    element.provider =
      { loadFile: async () =>
          ({ name: 'notes.md',
             text: '# hello' }) };
    element.handlers = [ file.createTextFileHandler() ];
    element.fileName = 'notes.md';

    document.body.appendChild(element);

    await settle(element);
    await waitFor(() => element.querySelector('pre') !== null);

    const pre =
      element.querySelector('pre') as HTMLElement;

    assert.equal(pre.textContent, '# hello');
  });

test(
  'file-view: text editor handler saves through provider on blur',
  async () => {
    await ensureDomAndFileLoaded();
    resetDomBody();

    const file =
      await getFileModule();

    const saved: Array<{ fileName: string; text: string; }> = [];

    const element =
      document.createElement('asljs-file') as FileViewElement;

    element.provider =
      { loadFile: async () =>
          ({ name: 'app.js',
             text: 'console.log(1);' }),
        saveText: async (fileName, text) => {
          saved.push({ fileName, text });
        } };
    element.handlers = [ file.createTextEditorFileHandler() ];
    element.fileName = 'app.js';

    document.body.appendChild(element);

    await settle(element);
    await waitFor(() => element.querySelector('textarea') !== null);

    const textArea =
      element.querySelector('textarea') as HTMLTextAreaElement;

    textArea.value = 'console.log(2);';
    textArea.dispatchEvent(new window.Event('blur'));

    assert.deepEqual(
      saved,
      [ { fileName: 'app.js',
          text: 'console.log(2);' } ]);
  });

test(
  'file-view: shows fallback open link when no handler matches',
  async () => {
    await ensureDomAndFileLoaded();
    resetDomBody();

    const file =
      await getFileModule();

    const element =
      document.createElement('asljs-file') as FileViewElement;

    element.provider =
      { loadFile: async () =>
          ({ name: 'archive.bin',
             blob: new Blob([ 'bin' ], { type: 'application/octet-stream' }) }) };
    element.handlers = [ file.createTextFileHandler() ];
    element.fileName = 'archive.bin';

    document.body.appendChild(element);

    await settle(element);

    const link =
      element.querySelector('a') as HTMLAnchorElement;

    assert.equal(link.textContent, 'Open');
    assert.equal(link.href.startsWith('blob:'), true);
  });

async function ensureDomAndFileLoaded(): Promise<void> {
  if (domRestore === null) {
    const dom =
      new JSDOM('<!doctype html><html><body></body></html>');

    const previous =
      { window: globalThis.window,
        document: globalThis.document,
        customElements: globalThis.customElements,
        HTMLElement: globalThis.HTMLElement,
        HTMLTextAreaElement: globalThis.HTMLTextAreaElement,
        HTMLIFrameElement: globalThis.HTMLIFrameElement,
        HTMLImageElement: globalThis.HTMLImageElement,
        Blob: globalThis.Blob,
        Event: globalThis.Event,
        URL: globalThis.URL };

    globalThis.window = dom.window as unknown as typeof globalThis.window;
    globalThis.document = dom.window.document;
    globalThis.customElements = dom.window.customElements;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
    globalThis.HTMLIFrameElement = dom.window.HTMLIFrameElement;
    globalThis.HTMLImageElement = dom.window.HTMLImageElement;
    globalThis.Blob = dom.window.Blob;
    globalThis.Event = dom.window.Event;

    let counter = 0;
    const mockedUrl =
      Object.assign(
        function URLConstructor(
            url: string | URL,
            base?: string | URL
          ): URL
        {
          return new dom.window.URL(
            String(url),
            base === undefined
              ? undefined
              : String(base));
        },
        globalThis.URL,
        { createObjectURL: () => `blob:test-${++counter}`,
          revokeObjectURL: () => {} });

    globalThis.URL =
      mockedUrl as unknown as typeof globalThis.URL;

    domRestore = () => {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.customElements = previous.customElements;
      globalThis.HTMLElement = previous.HTMLElement;
      globalThis.HTMLTextAreaElement = previous.HTMLTextAreaElement;
      globalThis.HTMLIFrameElement = previous.HTMLIFrameElement;
      globalThis.HTMLImageElement = previous.HTMLImageElement;
      globalThis.Blob = previous.Blob;
      globalThis.Event = previous.Event;
      globalThis.URL = previous.URL;
    };
  }

  if (!isComponentsLoaded) {
    fileModule =
      await import('./file.js');
    isComponentsLoaded = true;
  }
}

async function getFileModule(): Promise<FileModule> {
  await ensureDomAndFileLoaded();

  if (fileModule === null) {
    throw new Error('Expected file module to be loaded.');
  }

  return fileModule;
}

function resetDomBody(): void {
  document.body.replaceChildren();
}

async function settle(element: FileViewElement): Promise<void> {
  await element.updateComplete;
  await Promise.resolve();
  await element.updateComplete;
}

async function waitFor(
    predicate: () => boolean,
    maxTries: number = 20
  ): Promise<void>
{
  for (let index = 0; index < maxTries; index++) {
    if (predicate()) {
      return;
    }

    await Promise.resolve();
  }

  throw new Error('Timed out waiting for condition.');
}
