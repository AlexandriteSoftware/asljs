import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { getFocusedMarkdownTests }
  from './markdown-test.js';
import { type MarkdownTest }
  from './markdown-test.js';

test(
  'getFocusedMarkdownTests: should filter focused markdown tests',
  (): void =>
  {
    const focused: MarkdownTest =
      { testSuite: 'suite2',
        title: 'focused',
        source: 'true',
        expected: 'true',
        tags:
          [ 'focus' ] };

    const markdownTests: MarkdownTest[] =
      [ { testSuite: 'suite1',
          title: 'normal',
          source: 'true',
          expected: 'true',
          tags:
            [ 'js' ] },
        focused ];

    const focusedMarkdownTests =
      getFocusedMarkdownTests(
        markdownTests);

    assert.deepEqual(
      focusedMarkdownTests,
      [ focused ]);
  });
