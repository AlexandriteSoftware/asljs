import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { JSDOM }
  from 'jsdom';
import {
  renderAppListUi,
} from './app-list-ui.js';

test(
  'renderAppListUi renders sorted apps and action options',
  () => {
    const dom = new JSDOM('<select id="apps"></select>');
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;

    const select = dom.window.document
      .getElementById('apps') as HTMLSelectElement;

    try {
      renderAppListUi({
        selectElement: select,
        apps: [
          { id: 'a1', name: 'Older', updatedAt: '2026-01-01T00:00:00.000Z' },
          { id: 'a2', name: 'Newer', updatedAt: '2026-02-01T00:00:00.000Z' },
        ],
        currentAppId: 'a2',
        newActionValue: '__new__',
        importActionValue: '__import__',
      });

      const values = [ ...select.options ].map(item => item.value);
      assert.deepEqual(values, [ 'a2', 'a1', '__separator__', '__new__', '__import__' ]);
      assert.equal(select.value, 'a2');
    } finally {
      globalThis.document = previousDocument;
    }
  });
