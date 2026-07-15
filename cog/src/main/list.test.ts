import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { formatFileList }
  from './list.js';

test(
  'formatFileList returns markdown table of envelope files',
  () =>
  {
    const output =
      formatFileList(
        {
        instruction: '',
        files: [
          {
            path: 'src/index.ts',
            type: 'text',
            content: 'content',
            complete: true
          },
          { path: 'assets/logo.png', type: 'binary' },
          {
            path: 'docs/partial.md',
            type: 'text',
            content: 'partial',
            complete: false
          }
        ]
      });

    assert.equal(
      output,
      [
        '| Location | Complete | Type |',
        '| --- | --- | --- |',
        '| src/index.ts | yes | text |',
        '| assets/logo.png |  | binary |',
        '| docs/partial.md | no | text |',
        ''
      ].join(
        '\n'
      )
    );
  }
);

test(
  'formatFileList escapes markdown table cell separators',
  () =>
  {
    const output =
      formatFileList(
        {
        instruction: '',
        files: [
          { path: 'docs/a|b.md', type: 'text', complete: true }
        ]
      });

    assert.equal(
      output,
      [
        '| Location | Complete | Type |',
        '| --- | --- | --- |',
        String.raw`| docs/a\|b.md | yes | text |`,
        ''
      ].join(
        '\n'
      )
    );
  }
);
