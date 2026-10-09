import { runCommand }
  from 'asljs-mdcli';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { type Execution,
         formatExecution,
         loadResults,
         parseExecution,
         pruneExecutions,
         readWorkingTree,
         RETENTION,
         writeExecution }
  from './results.js';
import { TEST_TREE }
  from './testing/test-io.js';

test(
  'formatExecution writes the run, the working directory and each test',
  () =>
  {
    assert.equal(
      formatExecution(
        'E7 All tests',
        '/reqs',
        { date:
            '2026-01-02T03:04:05.000Z',
          command:
            'rq test R1 --recurse',
          tree:
            { commit: null,
              branch: null,
              changes: [ ] },
          tests:
            [ { file:
                  '/reqs/tests/T1 A.md',
                status: 'PASS',
                note: '1 step',
                output: '$ echo ```\n```\n' },
              { file: '/reqs/T2 B.md',
                status: 'FAIL',
                note: 'step 1\nexited',
                output: '' } ] }),
      `# E7 All tests

- Date: 2026-01-02T03:04:05.000Z
- Command: \`rq test R1 --recurse\`
- Result: FAIL - 1 of 2 tests passed
- Commit: none
- Branch: none
- Changed files: none

## T1 A

- File: <tests/T1 A.md>
- Result: PASS - 1 step

\`\`\`\`text
$ echo \`\`\`
\`\`\`
\`\`\`\`

## T2 B

- File: <T2 B.md>
- Result: FAIL - step 1 exited
`);
  });

test(
  'writeExecution numbers the files and loadResults keeps the latest result of each test',
  async () =>
  {
    await using dir =
      new TmpDir();

    const execution =
      { date:
          '2026-01-02T03:04:05.000Z',
        command: 'rq test',
        tree: TEST_TREE };

    assert.equal(
      (await loadResults(dir.path)).size,
      0);

    assert.equal(
      await writeExecution(
        dir.path,
        'First: a/b',
        { ...execution,
          tests:
            [ { file:
                  dir.resolve('T1 A.md'),
                status: 'FAIL',
                note: '',
                output: '' },
              { file:
                  dir.resolve('T2 B.md'),
                status: 'PASS',
                note: '',
                output: '' } ] }),
      dir.resolve(
        '.rq/E1 First a b.md'));

    await dir.writeText(
      '.rq/E9 Manual.md',
      '# E9 Manual\n\n## T1 A\n\n- Result: PASS\n');

    await dir.writeText(
      '.rq/notes.md',
      '# notes\n\n## T2 B\n\n- Result: FAIL\n');

    assert.equal(
      await writeExecution(
        dir.path,
        'Second',
        { ...execution,
          tests: [ ] }),
      dir.resolve('.rq/E10 Second.md'));

    assert.deepEqual(
      [ ...await loadResults(dir.path) ].sort(),
      [ [ 'T1',
          'PASS' ],
        [ 'T2',
          'PASS' ] ]);
  });

test(
  'parseExecution reads the result of each test section',
  () =>
  {
    assert.deepEqual(
      [ ...parseExecution(
        '# E1\n\n- Result: FAIL\n\n## T3 C\n\nText.\n\n- File: <T3 C.md>\n- Result: FAIL - step 1\n\n## Notes\n\n- Result: PASS\n\n## T4\n\n- Result: maybe\n') ],
      [ [ 'T3',
          { status: 'FAIL',
            note: 'step 1' } ] ]);
  });

test(
  'readWorkingTree reads the commit, the branch and the changed files',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'a.txt',
      'a');

    const git =
      async (
          args: string
        ): Promise<void> =>
      {
      const run =
        await runCommand(
          `git ${args}`,
          dir.path);

      assert.equal(
        run.code,
        0,
        run.stderr);
    };

    await git('init -q -b main');
    await git('add a.txt');

    await git(
      '-c user.name=rq -c user.email=rq@example.com commit -q -m init');

    await dir.writeText(
      'a.txt',
      'b');

    await dir.writeText(
      'b.txt',
      'b');

    const tree =
      await readWorkingTree(dir.path);

    assert.match(
      tree.commit ?? '',
      /^[0-9a-f]{40}$/);

    assert.equal(
      tree.branch,
      'main');

    assert.deepEqual(
      tree.changes,
      [ 'M a.txt',
        '?? b.txt' ]);
  });

test(
  'pruneExecutions removes the oldest files beyond the limits, keeping the latest results',
  async () =>
  {
    await using dir =
      new TmpDir();

    const write =
      async (
          name: string,
          tests: string
        ): Promise<void> =>
      {
      await dir.writeText(
        `.rq/${name}.md`,
        `# ${name}\n\n${tests}`);
    };

    await dir.writeText(
      'T1 A.md',
      '# T1 A\n');

    await dir.writeText(
      'T2 B.md',
      '# T2 B\n');

    await write(
      'E1 A',
      '## T1 A\n\n- Result: FAIL\n');

    await write(
      'E2 B',
      '## T2 B\n\n- Result: PASS\n');

    await write(
      'E3 C',
      '## T1 A\n\n- Result: PASS\n');

    await write(
      'E4 D',
      '## T1 A\n\n- Result: PASS\n');

    assert.deepEqual(
      await pruneExecutions(
        dir.path,
        { maxFiles: 10,
          maxBytes: 1000 }),
      [ ]);

    assert.deepEqual(
      await pruneExecutions(
        dir.path,
        { maxFiles: 2,
          maxBytes: 1000 }),
      [ dir.resolve('.rq/E1 A.md'),
        dir.resolve('.rq/E3 C.md') ]);

    assert.deepEqual(
      await pruneExecutions(
        dir.path,
        { maxFiles: 1,
          maxBytes: 1 }),
      [ ]);

    assert.deepEqual(
      [ ...await loadResults(dir.path) ].sort(),
      [ [ 'T1',
          'PASS' ],
        [ 'T2',
          'PASS' ] ]);
  });

test(
  'pruneExecutions keeps 300 files and 50 MB by default, and removes by size',
  async () =>
  {
    assert.deepEqual(
      RETENTION,
      { maxFiles: 300,
        maxBytes:
          50 * 1024 * 1024 });

    await using dir =
      new TmpDir();

    const big =
      'x'.repeat(400);

    await dir.writeText(
      '.rq/E1 Old.md',
      `# E1 Old\n\n${big}\n\n## T1 A\n\n- Result: FAIL\n`);

    await dir.writeText(
      '.rq/E2 Older.md',
      `# E2 Older\n\n${big}\n\n## T2 B\n\n- Result: FAIL\n`);

    await dir.writeText(
      '.rq/E3 New.md',
      '# E3 New\n\n## T1 A\n\n- Result: PASS\n\n## T2 B\n\n- Result: PASS\n');

    assert.deepEqual(
      await pruneExecutions(
        dir.path,
        { maxFiles: 300,
          maxBytes: 600 }),
      [ dir.resolve('.rq/E1 Old.md') ]);

    assert.deepEqual(
      await pruneExecutions(
        dir.path,
        { maxFiles: 300,
          maxBytes: 100 }),
      [ dir.resolve('.rq/E2 Older.md') ]);
  });

test(
  'loadResults prefers a later date, and writeExecution never reuses a number',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      '.rq/E1 Run.md',
      '# E1 Run\n\n- Date: 2026-05-01T00:00:00.000Z\n\n## T1 A\n\n- Result: PASS\n');

    await dir.writeText(
      '.rq/E2 Log.md',
      '# E2 Log\n\n- Date: 2020-01-01T00:00:00.000Z\n\n## T1 A\n\n- Result: FAIL\n\n## T2 B\n\n- Result: FAIL\n');

    assert.deepEqual(
      [ ...await loadResults(dir.path) ].sort(),
      [ [ 'T1',
          'PASS' ],
        [ 'T2',
          'FAIL' ] ]);

    const execution: Execution =
      { date:
          '2026-01-02T03:04:05.000Z',
        command: 'rq test',
        tree: TEST_TREE,
        tests: [ ] };

    const files =
      await Promise.all(
        [ 'a',
          'b',
          'a' ].map(
            slug =>
          writeExecution(
            dir.path,
            slug,
            execution)));

    assert.equal(
      new Set(files).size,
      3);

    assert.deepEqual(
      files
        .map(
          file => /E(\d+)/.exec(file)![1])
        .sort(),
      [ '3',
        '4',
        '5' ]);
  });

test(
  'pruneExecutions does not keep the results of tests that no longer exist',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'T1 A.md',
      '# T1 A\n');

    await dir.writeText(
      '.rq/E1 Gone.md',
      '# E1 Gone\n\n## T9 Gone\n\n- Result: PASS\n');

    await dir.writeText(
      '.rq/E2 A.md',
      '# E2 A\n\n## T1 A\n\n- Result: PASS\n');

    assert.deepEqual(
      await pruneExecutions(
        dir.path,
        { maxFiles: 1,
          maxBytes: 1000 }),
      [ dir.resolve('.rq/E1 Gone.md') ]);
  });
