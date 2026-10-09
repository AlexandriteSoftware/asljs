import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { execLog }
  from './change.js';
import { execTest }
  from './test.js';
import { FAIL_STEP,
         PASS_STEP,
         writeFixture }
  from './testing/fixture.js';
import { createTestIo,
         type TestIo }
  from './testing/test-io.js';

test(
  'execTest of a folder runs every test, records them, and reports the latest status',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const before =
      await dir.readText(
        'reqs/tests/T2 Fails.md');

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execTest(
        io,
        { targets:
            [ 'reqs' ],
          command: 'rq test reqs' }),
      1);

    assert.equal(
      io.out(),
      `FAIL     reqs/R1 Root.md - 1 of 2 links failed
FAIL     reqs/R2 Part.md - 1 of 1 links failed
PASS     reqs/tests/T1 Passes.md - 2 steps
FAIL     reqs/tests/T2 Fails.md - step 1 (Run) exited with code 3
Results  .rq/E2 reqs.md
Updated  reqs/R1 Root.md
Updated  reqs/R2 Part.md
Updated  reqs/tests/T1 Passes.md
Updated  reqs/tests/T2 Fails.md
`);

    assert.equal(
      await dir.readText('.rq/E2 reqs.md'),
      `# E2 reqs

- Date: 2026-01-02T03:04:05.000Z
- Command: \`rq test reqs\`
- Result: FAIL - 1 of 2 tests passed
- Commit: 0123abc
- Branch: main
- Changed files:
  - \`M reqs/R1 Root.md\`

## T1 Passes

- File: <reqs/tests/T1 Passes.md>
- Result: PASS - 2 steps

\`\`\`text
[step 1] Build
$ ${PASS_STEP}
[step 2] Check
$ ${PASS_STEP}
\`\`\`

## T2 Fails

- File: <reqs/tests/T2 Fails.md>
- Result: FAIL - step 1 (Run) exited with code 3

\`\`\`text
[step 1] Run
$ ${FAIL_STEP}
\`\`\`
`);

    assert.ok(
      (await dir.readText(
        'reqs/tests/T2 Fails.md'))
        .startsWith(before));
  });

test(
  'execTest of a requirement runs its own tests, and with recurse everything below it',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execTest(
        io,
        { targets:
            [ 'R1' ] }),
      1);

    assert.equal(
      io.out(),
      `NOT RUN  reqs/R1 Root.md - 1 of 2 links not run
PASS     reqs/tests/T1 Passes.md - 2 steps
NOT RUN  reqs/R2 Part.md (recorded) - 1 of 1 links not run
Results  .rq/E2 R1.md
Updated  reqs/tests/T1 Passes.md
`);

    const recurse =
      createTestIo(dir.path);

    assert.equal(
      await execTest(
        recurse,
        { targets:
            [ 'R1' ],
          recurse: true,
          name: 'All tests' }),
      1);

    assert.equal(
      recurse.out(),
      `FAIL     reqs/R1 Root.md - 1 of 2 links failed
FAIL     reqs/R2 Part.md - 1 of 1 links failed
PASS     reqs/tests/T1 Passes.md - 2 steps
FAIL     reqs/tests/T2 Fails.md - step 1 (Run) exited with code 3
Results  .rq/E3 All tests.md
Updated  reqs/R1 Root.md
Updated  reqs/R2 Part.md
Updated  reqs/tests/T1 Passes.md
Updated  reqs/tests/T2 Fails.md
`);

    assert.match(
      await dir.readText(
        '.rq/E3 All tests.md'),
      /^# E3 All tests\n\n- Date: .*\n- Command: `rq test R1`\n/);
  });

test(
  'execTest takes several paths, names and ids, and runs each test once',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/tests/T2 Fails.md',
      `# T2 Fails\n\n## Steps\n\n### Run\n\n\`\`\`sh\n${PASS_STEP}\n\`\`\`\n`);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execTest(
        io,
        { targets:
            [ 'T1 Passes.md',
              'T1',
              'R2' ] }),
      0);

    assert.equal(
      io.out(),
      `PASS     reqs/tests/T1 Passes.md - 2 steps
PASS     reqs/R2 Part.md
PASS     reqs/tests/T2 Fails.md - 1 step
Results  .rq/E2 T1 Passes T1 R2.md
Updated  reqs/R1 Root.md
Updated  reqs/R2 Part.md
Updated  reqs/tests/T1 Passes.md
Updated  reqs/tests/T2 Fails.md
`);

    const pass =
      createTestIo(dir.path);

    assert.equal(
      await execTest(
        pass,
        { targets:
            [ 'R1' ] }),
      0);

    assert.equal(
      pass.out(),
      `PASS     reqs/R1 Root.md
PASS     reqs/tests/T1 Passes.md - 2 steps
PASS     reqs/R2 Part.md (recorded)
Results  .rq/E3 R1.md
Updated  reqs/tests/T1 Passes.md
`);

    const inside =
      createTestIo(
        dir.resolve('reqs'));

    assert.equal(
      await execTest(
        inside,
        { targets:
            [ 'R2' ] }),
      0);

    assert.equal(
      inside.out(),
      `PASS     R2 Part.md
PASS     tests/T2 Fails.md - 1 step
Results  .rq/E1 R2.md
Updated  tests/T2 Fails.md
`);

    await assert.rejects(
      execTest(
        createTestIo(
          dir.resolve('reqs/tests')),
        { targets:
            [ 'R1' ] }),
      /R1: no requirement or test has this id/);
  });

test(
  'execTest reports structure errors and requirements with no links',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/R1 A.md',
      '# R1 A\n\n## Implementation\n\n- [R2](<R2 B.md>)\n- [gone](<R9 Gone.md>)\n');

    await dir.writeText(
      'reqs/R2 B.md',
      '# R2 B\n\n## Implementation\n\n- [R1](<R1 A.md>)\n');

    await dir.writeText(
      'reqs/R3 C.md',
      '# R3 C\n\nSee [R1](<R1 A.md>).\n');

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execTest(
        io,
        { targets:
            [ 'reqs/R1 A.md' ],
          recurse: true }),
      1);

    assert.equal(
      io.out(),
      `FAIL     reqs/R1 A.md - 1 of 1 links failed
FAIL     reqs/R2 B.md - 1 of 1 links failed
Error    R1 A.md: the link to R9 Gone.md points at no file.
Error    cycle: R1 A.md -> R2 B.md -> R1 A.md.
`);

    const leaf =
      createTestIo(dir.path);

    assert.equal(
      await execTest(
        leaf,
        { targets:
            [ 'reqs/R3 C.md' ] }),
      1);

    assert.equal(
      leaf.out(),
      'FAIL     reqs/R3 C.md - links to no requirement or test\n');

    await assert.rejects(
      execTest(
        leaf,
        { targets: [ ] }),
      /No target/);
  });

test(
  'execTest writes the status of each test and of the requirements above it',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await execTest(
      createTestIo(dir.path),
      { targets:
          [ 'reqs' ] });

    assert.ok(
      (await dir.readText('reqs/R1 Root.md'))
        .endsWith(
          '\n\n## Status\n\n- Result: FAIL - 1 of 2 links failed\n'));

    assert.ok(
      (await dir.readText(
        'reqs/tests/T1 Passes.md'))
        .endsWith(
          '\n\n## Status\n\n- Result: PASS - 2 steps\n- Execution: [E2 reqs][E2]\n\n[E2]: <../../.rq/E2 reqs.md>\n'));

    assert.ok(
      (await dir.readText(
        'reqs/tests/T2 Fails.md'))
        .endsWith(
          '\n\n## Status\n\n- Result: FAIL - step 1 (Run) exited with code 3\n- Execution: [E2 reqs][E2]\n\n[E2]: <../../.rq/E2 reqs.md>\n'));

    const part =
      await dir.readText('reqs/R2 Part.md');

    await dir.writeText(
      'reqs/R2 Part.md',
      part.replace(
        '- Result: FAIL - 1 of 1 links failed\n',
        '- Result: FAIL - 1 of 1 links failed\n- Coverage: COMPLETE\n'));

    await dir.writeText(
      'reqs/tests/T2 Fails.md',
      (await dir.readText(
        'reqs/tests/T2 Fails.md'))
        .replace(
          FAIL_STEP,
          PASS_STEP));

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execTest(
        io,
        { targets:
            [ 'T2' ] }),
      0);

    assert.equal(
      io.out(),
      `PASS     reqs/tests/T2 Fails.md - 1 step
Results  .rq/E3 T2.md
Updated  reqs/R1 Root.md
Updated  reqs/R2 Part.md
Updated  reqs/tests/T2 Fails.md
`);

    assert.ok(
      (await dir.readText('reqs/R1 Root.md'))
        .endsWith(
          '\n\n## Status\n\n- Result: PASS\n'));

    assert.ok(
      (await dir.readText('reqs/R2 Part.md'))
        .endsWith(
          '\n\n## Status\n\n- Result: PASS\n- Coverage: COMPLETE\n'));
  });

test(
  'execTest and execLog remove the oldest execution files beyond the retention',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const run =
      (): TestIo =>
      Object.assign(
        createTestIo(dir.path),
        { retention:
            { maxFiles: 1,
              maxBytes:
                50 * 1024 * 1024 } });

    const first =
      run();

    await execTest(
      first,
      { targets:
          [ 'T2' ] });

    assert.doesNotMatch(
      first.out(),
      /Removed/);

    const second =
      run();

    await execTest(
      second,
      { targets:
          [ 'T1' ] });

    assert.match(
      second.out(),
      /\nResults {2}\.rq\/E3 T1\.md\n(?:Updated .*\n)*Removed {2}\.rq\/E1 Earlier\.md\n$/);

    const third =
      run();

    await execLog(
      third,
      { file: 'T2',
        status: 'PASS' });

    assert.match(
      third.out(),
      /\nRemoved {2}\.rq\/E2 T2\.md\n$/);

    await assert.rejects(
      dir.stat('.rq/E1 Earlier.md'));
  });

test(
  'execTest merges the tests it ran with the recorded statuses, without reading .rq',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/R2 Part.md',
      `${await dir.readText(
        'reqs/R2 Part.md')}\n## Status\n\n- Result: FAIL - 1 of 1 links failed\n`);

    await dir.writeText(
      '.rq/E1 Earlier.md',
      '# E1 Earlier\n\n## T2 Fails\n\n- Result: PASS\n');

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execTest(
        io,
        { targets:
            [ 'R1' ] }),
      1);

    assert.equal(
      io.out(),
      `FAIL     reqs/R1 Root.md - 1 of 2 links failed
PASS     reqs/tests/T1 Passes.md - 2 steps
FAIL     reqs/R2 Part.md (recorded) - 1 of 1 links failed
Results  .rq/E2 R1.md
Updated  reqs/R1 Root.md
Updated  reqs/tests/T1 Passes.md
`);

    assert.ok(
      (await dir.readText('reqs/R2 Part.md'))
        .endsWith(
          '- Result: FAIL - 1 of 1 links failed\n'));
  });

test(
  'execTest exits with 1 on a structure error even when every node passes',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/R1 A.md',
      '# R1 A\n\n## Implementation\n\n- [T1](<T1 B.md>)\n');

    await dir.writeText(
      'reqs/T1 B.md',
      `# T1 B\n\n## Steps\n\n### Run\n\n\`\`\`sh\n${PASS_STEP}\n\`\`\`\n`);

    await dir.writeText(
      'reqs/T2 Orphan.md',
      `# T2 Orphan\n\n## Steps\n\n### Run\n\n\`\`\`sh\n${PASS_STEP}\n\`\`\`\n`);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execTest(
        io,
        { targets:
            [ 'reqs' ] }),
      1);

    assert.match(
      io.out(),
      /^PASS {5}reqs\/R1 A\.md\nPASS {5}reqs\/T1 B\.md - 1 step\nError {4}T2 Orphan\.md: not reachable from any root; link it from a requirement with rq link\.\n/);
  });

test(
  'execTest takes a requirement or test file by its path',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await execTest(
      io,
      { targets:
          [ 'reqs/tests/T1 Passes.md',
            'reqs/R2 Part.md' ] });

    assert.match(
      io.out(),
      /^PASS {5}reqs\/tests\/T1 Passes\.md - 2 steps\nFAIL {5}reqs\/R2 Part\.md - 1 of 1 links failed\nFAIL {5}reqs\/tests\/T2 Fails\.md - step 1 \(Run\) exited with code 3\n/);
  });
