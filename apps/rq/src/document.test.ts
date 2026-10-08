import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { formatLogEntry,
         parseDocument,
         parseLogEntry }
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
        body:
          'Uses [a](<A b.md>), [c](sub/C%20d.md#part), [web](https://x.org/y.md),\n[img](pic.png), [mail](mailto:a@b.md) and [ref][r]. [a again](<A b.md>)',
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
  'parseLogEntry reads an entry with a valid time',
  () =>
  {
    assert.deepEqual(
      parseLogEntry(
        ' 2026-01-01T00:00:00Z Passed - all good '),
      { time:
          '2026-01-01T00:00:00Z',
        status: 'Passed',
        note: 'all good' });

    assert.equal(
      parseLogEntry('yesterday Passed'),
      null);

    assert.equal(
      parseLogEntry('2026-01-01 Done'),
      null);
  });

test(
  'formatLogEntry writes the note on one line',
  () =>
  {
    assert.equal(
      formatLogEntry(
        { time: 't',
          status: 'Failed',
          note: ' a\n b ' }),
      't Failed - a b');

    assert.equal(
      formatLogEntry(
        { time: 't',
          status: 'Passed',
          note: '' }),
      't Passed');
  });
