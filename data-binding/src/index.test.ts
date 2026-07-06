import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { JSDOM }
  from 'jsdom';
import { bindDataModel,
         createBuiltInPipes }
  from './index.js';

const TEST_SUITE =
  'index';

test(
  `${TEST_SUITE}: smoke binds date format with pipes and quotes from html attribute`,
  () => {
    const dom =
      new JSDOM(`
          <div id="root">
            <span data-bind-text='createdAt | date:"<&#39;yyyy|MM|dd&#39; \\\"hh:mm:ss\\\">"'></span>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      {
        createdAt:
          new Date(2026, 3, 10, 13, 14, 15)
      });

    assert.equal(
      root.querySelector('span')?.textContent,
      `<\'2026|04|10\' "13:14:15">`);
  });

test(
  `${TEST_SUITE}: exports createBuiltInPipes`,
  () => {
    const pipes =
      createBuiltInPipes('en-GB');

    assert.equal(
      typeof pipes.currency,
      'function');
  });

