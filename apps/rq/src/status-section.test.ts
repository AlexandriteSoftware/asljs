import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { parseMarkdown }
  from './markdown.js';
import { readStatus,
         writeStatus }
  from './status-section.js';

function read(
    text: string
  ): ReturnType<typeof readStatus>
{
  return readStatus(
    parseMarkdown(text),
    text);
}

test(
  'readStatus reads the result, the coverage and the execution link',
  () =>
  {
    assert.deepEqual(
      read(
        '# T1\n\n## Status\n\n- Result: FAIL - step 1 (Run)\n  exited\n- Coverage: INCOMPLETE - speed\n- Execution: [E4 reqs](<../.rq/E4 reqs.md>)\n'),
      { result:
          { status: 'FAIL',
            note:
              'step 1 (Run) exited' },
        coverage:
          { status: 'INCOMPLETE',
            note: 'speed' },
        execution:
          { title: 'E4 reqs',
            url: '../.rq/E4 reqs.md' },
        problems: [ ] });

    assert.deepEqual(
      read('# R1\n\nText.\n'),
      { result: null,
        coverage: null,
        execution: null,
        problems: [ ] });

    assert.deepEqual(
      read(
        '# R1\n\n## Status\n\nText.\n\n- Result: DONE\n').problems,
      [ 'the Status section holds more than a list.',
        'the Status item "Result: DONE" is not "Result: PASS|FAIL|NOT RUN[ - <note>]", "Coverage: COMPLETE|INCOMPLETE[ - <note>]" or "Execution: <link>".' ]);
  });

test(
  'writeStatus adds, replaces and removes the section',
  () =>
  {
    const added =
      writeStatus(
        '# R1\n\nText.\n',
        { result:
            { status: 'PASS',
              note: '' },
          coverage:
            { status: 'COMPLETE',
              note: 'all\n covered' },
          execution: null });

    assert.equal(
      added,
      '# R1\n\nText.\n\n## Status\n\n- Result: PASS\n- Coverage: COMPLETE - all covered\n');

    assert.equal(
      writeStatus(
        '# R1\n\n## Status\n\n- Result: PASS\n\n## Notes\n\nKept.\n',
        { result:
            { status: 'NOT RUN',
              note: '' },
          coverage: null,
          execution: null }),
      '# R1\n\n## Status\n\n- Result: NOT RUN\n\n## Notes\n\nKept.\n');

    assert.equal(
      writeStatus(
        added,
        { result: null,
          coverage: null,
          execution: null }),
      '# R1\n\nText.\n');
  });

test(
  'writeStatus keeps the content of the section it does not own',
  () =>
  {
    assert.equal(
      writeStatus(
        '# T1\n\nSee [notes][N].\n\n## Status\n\n- Result: FAIL\n- Owner: alice\n- Execution: [E1 a][E1]\n\nA note.\n\n[E1]: .rq/E1.md\n[N]: notes.md\n',
        { result:
            { status: 'PASS',
              note: '' },
          coverage: null,
          execution:
            { title: 'E2 b',
              url: '.rq/E2 b.md' } }),
      '# T1\n\nSee [notes][N].\n\n## Status\n\n- Result: PASS\n- Execution: [E2 b][E2]\n- Owner: alice\n\nA note.\n\n[E2]: <.rq/E2 b.md>\n[N]: notes.md\n');

    assert.equal(
      writeStatus(
        '# R1\n\n## Status\n\n- Owner: bob\n',
        { result: null,
          coverage: null,
          execution: null }),
      '# R1\n\n## Status\n\n- Owner: bob\n');
  });

test(
  'writeStatus labels the execution link with the execution id, numbered when taken',
  () =>
  {
    assert.equal(
      writeStatus(
        '# T1\n\nSee [the run][E2].\n\n[E2]: notes.md\n',
        { result:
            { status: 'PASS',
              note: '' },
          coverage: null,
          execution:
            { title: 'E2 reqs',
              url: '../.rq/E2 reqs.md' } }),
      '# T1\n\nSee [the run][E2].\n\n[E2]: notes.md\n\n## Status\n\n- Result: PASS\n- Execution: [E2 reqs][E2-2]\n\n[E2-2]: <../.rq/E2 reqs.md>\n');
  });
