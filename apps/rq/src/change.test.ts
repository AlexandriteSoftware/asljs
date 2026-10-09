import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { execAdd,
         execLink,
         execLog,
         execMove,
         execRemove,
         execUnlink }
  from './change.js';
import { execCheck }
  from './check.js';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

async function exists(
    dir: TmpDir,
    file: string
  ): Promise<boolean>
{
  return await dir.stat(file).then(
    () => true,
    () => false);
}

test(
  'execAdd creates a requirement next to its parent and links it',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execAdd(
        io,
        { kind: 'requirement',
          parent: 'reqs/R2 Part.md',
          name: 'Speed',
          body: 'It is fast.' }),
      0);

    assert.equal(
      io.out(),
      'Created reqs/R3 Speed.md\nLinked reqs/R2 Part.md -> reqs/R3 Speed.md\n');

    assert.equal(
      await dir.readText('reqs/R3 Speed.md'),
      '# R3 Speed\n\nIt is fast.\n');

    assert.equal(
      await dir.readText('reqs/R2 Part.md'),
      '# R2 Part\n\nA part works.\n\n## Implementation\n\n- [T2][T2]\n- [R3 Speed][R3]\n\n[T2]: <tests/T2 Fails.md>\n[R3]: <R3 Speed.md>\n');
  });

test(
  'execAdd creates a test with steps in the tests folder',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await execAdd(
      io,
      { kind: 'test',
        parent: 'reqs/R2 Part.md',
        name: 'Fast run',
        body:
          'The benchmark is under a second.',
        steps:
          [ 'npm run bench',
            'node check.js' ] });

    assert.equal(
      await dir.readText(
        'reqs/tests/T3 Fast run.md'),
      '# T3 Fast run\n\nThe benchmark is under a second.\n\n## Steps\n\n### Step 1\n\n```sh\nnpm run bench\n```\n\n### Step 2\n\n```sh\nnode check.js\n```\n');

    await execAdd(
      io,
      { kind: 'test',
        parent: 'reqs/R2 Part.md',
        name: 'Other',
        path: 'reqs/T7 Custom.md' });

    assert.equal(
      await dir.readText(
        'reqs/T7 Custom.md'),
      '# T7 Custom\n\n## Steps\n');

    assert.ok(
      (await dir.readText('reqs/R2 Part.md'))
        .includes(
          '- [T2][T2]\n- [T3 Fast run][T3]\n- [T7 Custom][T7]\n\n[T2]: <tests/T2 Fails.md>\n[T3]: <tests/T3 Fast run.md>\n[T7]: <T7 Custom.md>\n'));

    await assert.rejects(
      execAdd(
        io,
        { kind: 'test',
          parent: 'reqs/R2 Part.md',
          name: 'Other',
          path:
            'reqs/R8 Not test.md' }),
      /the file name of a test must be T<n> <name>\.md/);
  });

test(
  'execAdd refuses a test parent, a bad name and an existing file',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await assert.rejects(
      execAdd(
        io,
        { kind: 'requirement',
          parent:
            'reqs/tests/T1 Passes.md',
          name: 'X' }),
      /is a test; only a requirement links/);

    await assert.rejects(
      execAdd(
        io,
        { kind: 'requirement',
          parent: 'reqs/R1 Root.md',
          name: 'a/b' }),
      /Invalid name/);

    await assert.rejects(
      execAdd(
        io,
        { kind: 'requirement',
          parent: 'reqs/R1 Root.md',
          name: 'X',
          path: 'reqs/R2 Part.md' }),
      /the file already exists/);
  });

test(
  'execLink links an existing node and refuses duplicates, cycles and a second parent',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await execLink(
      io,
      { parent: 'reqs/R2 Part.md',
        child:
          'reqs/tests/T1 Passes.md' });

    assert.ok(
      (await dir.readText('reqs/R2 Part.md'))
        .includes(
          '- [T2][T2]\n- [T1 Passes][T1]\n\n[T2]: <tests/T2 Fails.md>\n[T1]: <tests/T1 Passes.md>\n'));

    await assert.rejects(
      execLink(
        io,
        { parent: 'reqs/R2 Part.md',
          child:
            'reqs/tests/T1 Passes.md' }),
      /already links to/);

    await assert.rejects(
      execLink(
        io,
        { parent: 'reqs/R2 Part.md',
          child: 'reqs/R1 Root.md' }),
      /the link would make a cycle/);

    await assert.rejects(
      execLink(
        io,
        { parent: 'reqs/R1 Root.md',
          child: 'reqs/R1 Root.md' }),
      /the link would make a cycle/);

    await dir.writeText(
      'reqs/R3 Other.md',
      '# R3 Other\n\n## Implementation\n\n- [T2](<tests/T2 Fails.md>)\n');

    await assert.rejects(
      execLink(
        io,
        { parent: 'reqs/R3 Other.md',
          child: 'reqs/R2 Part.md' }),
      /R2 Part\.md is already linked from reqs\/R1 Root\.md; a requirement has one parent/);

    await assert.rejects(
      execLink(
        createTestIo(
          dir.resolve('reqs')),
        { parent: 'R3',
          child: 'R2' }),
      /R2 Part\.md is already linked from R1 Root\.md/);

    await assert.doesNotReject(
      execLink(
        createTestIo(
          dir.resolve('reqs/tests')),
        { parent: '../R3 Other.md',
          child: '../R2 Part.md' }));
  });

test(
  'execUnlink removes every link to the child',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await execUnlink(
      io,
      { parent: 'reqs/R2 Part.md',
        child:
          'reqs/tests/T2 Fails.md' });

    assert.equal(
      await dir.readText('reqs/R2 Part.md'),
      '# R2 Part\n\nA part works.\n\n## Implementation\n');

    await assert.rejects(
      execUnlink(
        io,
        { parent: 'reqs/R2 Part.md',
          child:
            'reqs/tests/T2 Fails.md' }),
      /does not link to/);
  });

test(
  'execRemove deletes a leaf and the links to it',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await assert.rejects(
      execRemove(
        io,
        { file: 'reqs/R1 Root.md' }),
      /links to 2 requirements or tests; unlink them first, or remove it with --recursive/);

    await execRemove(
      io,
      { file:
          'reqs/tests/T1 Passes.md' });

    assert.equal(
      io.out(),
      'Updated reqs/R1 Root.md\nRemoved reqs/tests/T1 Passes.md\n');

    assert.equal(
      await dir.readText('reqs/R1 Root.md'),
      '# R1 Root\n\nThe tool works. See the [website](https://example.com/page.md) and the\n[notes](notes.md).\n\n## Implementation\n\n- [R2 Part](<R2 Part.md>)\n');
  });

test(
  'execRemove --recursive deletes what only removed documents link to',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/R3 Shared.md',
      '# R3 Shared\n\n## Implementation\n\n- [T2](<tests/T2 Fails.md>)\n');

    await dir.writeText(
      'reqs/R1 Root.md',
      '# R1 Root\n\n## Implementation\n\n- [R2 Part](<R2 Part.md>)\n- [R3 Shared](<R3 Shared.md>)\n');

    const io =
      createTestIo(dir.path);

    await execRemove(
      io,
      { file: 'reqs/R2 Part.md',
        recursive: true });

    assert.ok(
      await exists(
        dir,
        'reqs/tests/T2 Fails.md'));

    assert.equal(
      await dir.readText('reqs/R1 Root.md'),
      '# R1 Root\n\n## Implementation\n\n- [R3 Shared](<R3 Shared.md>)\n');

    await execRemove(
      io,
      { file: 'reqs/R1 Root.md',
        recursive: true });

    for (
      const file of [ 'reqs/R1 Root.md',
                      'reqs/R3 Shared.md',
                      'reqs/tests/T2 Fails.md' ]
    ) {
      assert.ok(
        !await exists(
          dir,
          file),
        file);
    }

    assert.ok(
      await exists(
        dir,
        'reqs/tests/T1 Passes.md'));

    assert.ok(
      !(await dir.readText(
        'reqs/tests/T1 Passes.md')).includes(
          'R1 Root.md'));
  });

test(
  'execMove renames a document and rewrites the links to it',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await dir.writeText(
      'reqs/R1 Root.md',
      '# R1 Root\n\n## Implementation\n\n- [R2 Part](<R2 Part.md>)\n- [T1 Passes](<tests/T1 Passes.md>)\n');

    await execMove(
      io,
      { file: 'reqs/R2 Part.md',
        destination:
          'reqs/parts/R2 Piece.md' });

    assert.equal(
      io.out(),
      'Updated reqs/R1 Root.md\nMoved reqs/R2 Part.md -> reqs/parts/R2 Piece.md\n');

    assert.equal(
      await dir.readText('reqs/R1 Root.md'),
      '# R1 Root\n\n## Implementation\n\n- [R2 Piece](<parts/R2 Piece.md>)\n- [T1 Passes](<tests/T1 Passes.md>)\n');

    assert.equal(
      await dir.readText(
        'reqs/parts/R2 Piece.md'),
      '# R2 Piece\n\nA part works.\n\n## Implementation\n\n- [T2][T2]\n\n[T2]: <../tests/T2 Fails.md>\n');

    assert.ok(
      !await exists(
        dir,
        'reqs/R2 Part.md'));

    await execMove(
      io,
      { file:
          'reqs/tests/T1 Passes.md',
        destination: 'reqs/parts' });

    assert.ok(
      (await dir.readText(
        'reqs/parts/T1 Passes.md'))
        .includes(
          '[R1](<../R1 Root.md>)'));

    assert.equal(
      await execCheck(
        createTestIo(dir.path),
        { target: 'reqs' }),
      0);

    await assert.rejects(
      execMove(
        io,
        { file:
            'reqs/parts/T1 Passes.md',
          destination: 'reqs/R1 Root.md' }),
      /the file name of a test must be T<n> <name>\.md/);

    await assert.rejects(
      execMove(
        io,
        { file:
            'reqs/parts/T1 Passes.md',
          destination:
            'reqs/tests/T2 Fails.md' }),
      /the file already exists/);
  });

test(
  'execLog records a result of a test only, in an execution file',
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

    await execLog(
      io,
      { file:
          'reqs/tests/T2 Fails.md',
        status: 'PASS',
        note: 'checked by hand' });

    await execLog(
      io,
      { file: 'T2',
        status: 'FAIL',
        time:
          '2026-02-01T00:00:00Z',
        command:
          'rq log T2 --status FAIL' });

    assert.equal(
      io.out(),
      'Logged reqs/tests/T2 Fails.md: PASS - checked by hand\nResults  .rq/E2 T2 Fails.md\nUpdated  reqs/R1 Root.md\nUpdated  reqs/R2 Part.md\nUpdated  reqs/tests/T2 Fails.md\nLogged reqs/tests/T2 Fails.md: FAIL\nResults  .rq/E3 T2 Fails.md\nUpdated  reqs/R1 Root.md\nUpdated  reqs/R2 Part.md\nUpdated  reqs/tests/T2 Fails.md\n');

    assert.equal(
      await dir.readText(
        '.rq/E3 T2 Fails.md'),
      '# E3 T2 Fails\n\n- Date: 2026-02-01T00:00:00Z\n- Command: `rq log T2 --status FAIL`\n- Result: FAIL - 0 of 1 tests passed\n- Commit: 0123abc\n- Branch: main\n- Changed files:\n  - `M reqs/R1 Root.md`\n\n## T2 Fails\n\n- File: <reqs/tests/T2 Fails.md>\n- Result: FAIL\n');

    assert.match(
      await dir.readText(
        '.rq/E2 T2 Fails.md'),
      /\n- Result: PASS - checked by hand\n$/);

    assert.ok(
      (await dir.readText(
        'reqs/tests/T2 Fails.md'))
        .startsWith(before));

    await assert.rejects(
      execLog(
        io,
        { file: 'reqs/R1 Root.md',
          status: 'PASS' }),
      /is a requirement; only a test has a result/);

    await assert.rejects(
      execLog(
        io,
        { file:
            'reqs/tests/T2 Fails.md',
          status: 'Passed' }),
      /Invalid status: "Passed"; use PASS or FAIL/);

    await assert.rejects(
      execLog(
        io,
        { file:
            'reqs/tests/T2 Fails.md',
          status: 'PASS',
          time: 'soon' }),
      /Invalid time/);
  });

test(
  'execUnlink takes ids, execMove retitles reference links, and both refresh statuses',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await execAdd(
      io,
      { kind: 'test',
        parent: 'R2',
        name: 'Fast run',
        steps:
          [ 'node -v' ] });

    await execMove(
      io,
      { file: 'T3',
        destination:
          'reqs/tests/T3 Quick run.md' });

    assert.ok(
      (await dir.readText('reqs/R2 Part.md'))
        .includes(
          '- [T3 Quick run][T3]\n'));

    await dir.writeText(
      'reqs/R2 Part.md',
      `${await dir.readText('reqs/R2 Part.md')}\n## Status\n\n- Result: PASS\n`);

    const unlink =
      createTestIo(dir.path);

    await execUnlink(
      unlink,
      { parent: 'R2',
        child: 'T2' });

    await execUnlink(
      unlink,
      { parent: 'R2',
        child: 'T3 Quick run.md' });

    assert.match(
      unlink.out(),
      /Updated reqs\/R2 Part\.md\n/);

    assert.ok(
      (await dir.readText('reqs/R2 Part.md'))
        .endsWith(
          '## Status\n\n- Result: FAIL - links to no requirement or test\n'));
  });

test(
  'execAdd, execLink, execRemove and execMove refresh the statuses they make stale',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const withStatus =
      async (
          file: string,
          result: string
        ): Promise<void> =>
      {
      await dir.writeText(
        file,
        `${await dir.readText(file)}\n## Status\n\n- Result: ${result}\n`);
    };

    await withStatus(
      'reqs/R1 Root.md',
      'PASS');

    await withStatus(
      'reqs/R2 Part.md',
      'PASS');

    const add =
      createTestIo(dir.path);

    await execAdd(
      add,
      { kind: 'test',
        parent: 'R2',
        name: 'New',
        steps:
          [ 'node -v' ] });

    assert.match(
      add.out(),
      /\nUpdated reqs\/R2 Part\.md\n/);

    assert.ok(
      (await dir.readText('reqs/R2 Part.md'))
        .includes(
          '- Result: NOT RUN - 2 of 2 links not run'));

    await dir.writeText(
      'reqs/R3 Extra.md',
      '# R3 Extra\n\n## Implementation\n\n- [T2](<tests/T2 Fails.md>)\n');

    const link =
      createTestIo(dir.path);

    await execLink(
      link,
      { parent: 'R1',
        child: 'R3' });

    assert.match(
      link.out(),
      /\nUpdated reqs\/R1 Root\.md\n/);

    const move =
      createTestIo(dir.path);

    await execMove(
      move,
      { file: 'R3',
        destination: 'reqs/R3 More.md' });

    assert.match(
      move.out(),
      /Moved reqs\/R3 Extra\.md -> reqs\/R3 More\.md\n/);

    const remove =
      createTestIo(dir.path);

    await execRemove(
      remove,
      { file: 'T3' });

    assert.match(
      remove.out(),
      /\nUpdated reqs\/R2 Part\.md\n/);

    assert.ok(
      (await dir.readText('reqs/R2 Part.md'))
        .includes(
          '- Result: NOT RUN - 1 of 1 links not run'));
  });
