import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { appendLogEntry,
         parseDocument }
  from './document.js';

test(
  'parseDocument reads a requirement: title and local markdown links',
  () =>
  {
    const document =
      parseDocument(
        `# RQ1 Root

Uses [a](<A b.md>), [c](sub/C%20d.md#part), [web](https://x.org/y.md),
[img](pic.png), [mail](mailto:a@b.md) and [ref][r]. [a again](<A b.md>)

[r]: ./R.md
`);

    assert.deepEqual(
      document,
      { title: 'RQ1 Root',
        kind: 'requirement',
        links:
          [ 'A b.md',
            'sub/C d.md',
            './R.md' ],
        steps: [ ],
        log: [ ] });
  });

test(
  'parseDocument reads an evidence: steps and log',
  () =>
  {
    const document =
      parseDocument(
        `# EV1 Works

## Steps

\`\`\`sh
npm test

npm run lint
\`\`\`

Then:

\`\`\`
node check.js
\`\`\`

## Log

- 2026-01-01T00:00:00.000Z Passed - 3 steps
- 2026-01-02T00:00:00.000Z Failed - step 2 exited with code 1
- not an entry
`);

    assert.equal(
      document.kind,
      'evidence');

    assert.deepEqual(
      document.steps,
      [ 'npm test',
        'npm run lint',
        'node check.js' ]);

    assert.deepEqual(
      document.log,
      [ { time:
            '2026-01-01T00:00:00.000Z',
          status: 'Passed',
          note: '3 steps' },
        { time:
            '2026-01-02T00:00:00.000Z',
          status: 'Failed',
          note:
            'step 2 exited with code 1' } ]);
  });

test(
  'parseDocument has no title without a level 1 heading',
  () =>
  {
    assert.equal(
      parseDocument(
        '## Only a section\n').title,
      null);
  });

test(
  'appendLogEntry adds a Log section, then adds to its list',
  () =>
  {
    const entry =
      { time:
          '2026-01-01T00:00:00.000Z',
        status:
          'Passed' as const,
        note: 'two\nlines' };

    const first =
      appendLogEntry(
        '# EV1\n\n## Steps\n\n```\nx\n```\n',
        entry);

    assert.equal(
      first,
      '# EV1\n\n## Steps\n\n```\nx\n```\n\n## Log\n\n- 2026-01-01T00:00:00.000Z Passed - two lines\n');

    assert.equal(
      appendLogEntry(
        first,
        { ...entry,
          status: 'Failed',
          note: '' }),
      `${first}- 2026-01-01T00:00:00.000Z Failed\n`);
  });

test(
  'appendLogEntry keeps the sections after the Log section',
  () =>
  {
    assert.equal(
      appendLogEntry(
        '# EV1\n\n## Log\n\n## Notes\n\nText.\n',
        { time: 't',
          status: 'Passed',
          note: 'ok' }),
      '# EV1\n\n## Log\n\n- t Passed - ok\n\n## Notes\n\nText.\n');
  });
