import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { renderPreview }
  from './preview.js';

test(
  'renderPreview rewrites image and css asset references to embedded data urls',
  () =>
  {
    const dom =
      new JSDOM('<iframe id="preview"></iframe>');

    const document =
      dom.window.document;

    const frame =
      document.getElementById('preview') as HTMLIFrameElement;

    renderPreview(
      frame,
      [
        {
          name: 'index.html',
          content:
            '<!doctype html><html><head><link rel="stylesheet" href="style.css"></head><body><img src="assets/logo.png" alt="Logo"></body></html>'
        },
        {
          name: 'style.css',
          content: '.hero { background-image: url("assets/logo.png"); }'
        },
        {
          name: 'assets/logo.png',
          content: 'data:image/png;base64,AQID'
        }
      ]);

    assert.match(
      frame.srcdoc ?? '',
      /<img src="data:image\/png;base64,AQID" alt="Logo">/);

    assert.match(
      frame.srcdoc ?? '',
      /background-image: url\("data:image\/png;base64,AQID"\);/);
  });
