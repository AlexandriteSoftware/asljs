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
          parent: 'reqs/RQ2 Part.md',
          name: 'Speed',
          body: 'It is fast.' }),
      0);

    assert.equal(
      io.out(),
      'Created reqs/RQ3 Speed.md\nLinked reqs/RQ2 Part.md -> reqs/RQ3 Speed.md\n');

    assert.equal(
      await dir.readText('reqs/RQ3 Speed.md'),
      '# RQ3 Speed\n\nIt is fast.\n');

    assert.ok(
      (await dir.readText('reqs/RQ2 Part.md'))
        .endsWith(
          '\n## Implementation\n\n- [RQ3 Speed](<RQ3 Speed.md>)\n'));
  });

test(
  'execAdd creates an evidence with steps in the evidence folder',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await execAdd(
      io,
      { kind: 'evidence',
        parent: 'reqs/RQ2 Part.md',
        name: 'Fast run',
        body:
          'The benchmark is under a second.',
        steps:
          [ 'npm run bench',
            'node check.js' ] });

    assert.equal(
      await dir.readText(
        'reqs/evidence/EV3 Fast run.md'),
      '# EV3 Fast run\n\nThe benchmark is under a second.\n\n## Steps\n\n```sh\nnpm run bench\nnode check.js\n```\n');

    await execAdd(
      io,
      { kind: 'evidence',
        parent: 'reqs/RQ2 Part.md',
        name: 'Other',
        path: 'reqs/custom.md' });

    assert.equal(
      await dir.readText('reqs/custom.md'),
      '# custom\n\n## Steps\n\n```sh\n```\n');

    assert.ok(
      (await dir.readText('reqs/RQ2 Part.md'))
        .endsWith(
          '- [EV3 Fast run](<evidence/EV3 Fast run.md>)\n- [custom](custom.md)\n'));
  });

test(
  'execAdd refuses an evidence parent, a bad name and an existing file',
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
            'reqs/evidence/EV1 Passes.md',
          name: 'X' }),
      /is an evidence; only a requirement links/);

    await assert.rejects(
      execAdd(
        io,
        { kind: 'requirement',
          parent: 'reqs/RQ1 Root.md',
          name: 'a/b' }),
      /Invalid name/);

    await assert.rejects(
      execAdd(
        io,
        { kind: 'requirement',
          parent: 'reqs/RQ1 Root.md',
          name: 'X',
          path: 'reqs/RQ2 Part.md' }),
      /the file already exists/);
  });

test(
  'execLink links an existing node and refuses duplicates and cycles',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await execLink(
      io,
      { parent: 'reqs/RQ2 Part.md',
        child:
          'reqs/evidence/EV1 Passes.md' });

    assert.ok(
      (await dir.readText('reqs/RQ2 Part.md'))
        .endsWith(
          '- [EV1 Passes](<evidence/EV1 Passes.md>)\n'));

    await assert.rejects(
      execLink(
        io,
        { parent: 'reqs/RQ2 Part.md',
          child:
            'reqs/evidence/EV1 Passes.md' }),
      /already links to/);

    await assert.rejects(
      execLink(
        io,
        { parent: 'reqs/RQ2 Part.md',
          child: 'reqs/RQ1 Root.md' }),
      /the link would make a cycle/);

    await assert.rejects(
      execLink(
        io,
        { parent: 'reqs/RQ1 Root.md',
          child: 'reqs/RQ1 Root.md' }),
      /the link would make a cycle/);
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
      { parent: 'reqs/RQ2 Part.md',
        child:
          'reqs/evidence/EV2 Fails.md' });

    assert.equal(
      await dir.readText('reqs/RQ2 Part.md'),
      '# RQ2 Part\n\nA part works. See EV2.\n');

    await assert.rejects(
      execUnlink(
        io,
        { parent: 'reqs/RQ2 Part.md',
          child:
            'reqs/evidence/EV2 Fails.md' }),
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
        { file: 'reqs/RQ1 Root.md' }),
      /links to 2 requirements or evidence; unlink them first, or remove it with --recursive/);

    await execRemove(
      io,
      { file:
          'reqs/evidence/EV1 Passes.md' });

    assert.equal(
      io.out(),
      'Updated reqs/RQ1 Root.md\nRemoved reqs/evidence/EV1 Passes.md\n');

    assert.equal(
      await dir.readText('reqs/RQ1 Root.md'),
      '# RQ1 Root\n\nThe tool works.\n\n- [RQ2 Part](<RQ2 Part.md>)\n- EV1 Passes\n- [Website](https://example.com/page.md)\n');
  });

test(
  'execRemove --recursive deletes what only removed documents link to',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/RQ3 Shared.md',
      '# RQ3 Shared\n\n[EV2](<evidence/EV2 Fails.md>)\n');

    await dir.writeText(
      'reqs/RQ1 Root.md',
      '# RQ1 Root\n\n## Implementation\n\n- [RQ2 Part](<RQ2 Part.md>)\n- [RQ3 Shared](<RQ3 Shared.md>)\n');

    const io =
      createTestIo(dir.path);

    await execRemove(
      io,
      { file: 'reqs/RQ2 Part.md',
        recursive: true });

    assert.ok(
      await exists(
        dir,
        'reqs/evidence/EV2 Fails.md'));

    assert.equal(
      await dir.readText('reqs/RQ1 Root.md'),
      '# RQ1 Root\n\n## Implementation\n\n- [RQ3 Shared](<RQ3 Shared.md>)\n');

    await execRemove(
      io,
      { file: 'reqs/RQ1 Root.md',
        recursive: true });

    for (
      const file of [ 'reqs/RQ1 Root.md',
                      'reqs/RQ3 Shared.md',
                      'reqs/evidence/EV2 Fails.md' ]
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
        'reqs/evidence/EV1 Passes.md'));

    assert.ok(
      !(await dir.readText(
        'reqs/evidence/EV1 Passes.md')).includes(
          'RQ1 Root.md'));
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
      'reqs/RQ1 Root.md',
      '# RQ1 Root\n\n## Implementation\n\n- [RQ2 Part](<RQ2 Part.md>)\n- [EV1 Passes](<evidence/EV1 Passes.md>)\n');

    await execMove(
      io,
      { file: 'reqs/RQ2 Part.md',
        destination:
          'reqs/parts/RQ2 Piece.md' });

    assert.equal(
      io.out(),
      'Updated reqs/RQ1 Root.md\nMoved reqs/RQ2 Part.md -> reqs/parts/RQ2 Piece.md\n');

    assert.equal(
      await dir.readText('reqs/RQ1 Root.md'),
      '# RQ1 Root\n\n## Implementation\n\n- [RQ2 Piece](<parts/RQ2 Piece.md>)\n- [EV1 Passes](<evidence/EV1 Passes.md>)\n');

    assert.equal(
      await dir.readText(
        'reqs/parts/RQ2 Piece.md'),
      '# RQ2 Piece\n\nA part works. See [EV2][EV2].\n\n[EV2]: <../evidence/EV2 Fails.md>\n');

    assert.ok(
      !await exists(
        dir,
        'reqs/RQ2 Part.md'));

    await execMove(
      io,
      { file:
          'reqs/evidence/EV1 Passes.md',
        destination: 'reqs/parts' });

    assert.ok(
      (await dir.readText(
        'reqs/parts/EV1 Passes.md'))
        .includes(
          '[RQ1](<../RQ1 Root.md>)'));

    assert.equal(
      await execCheck(
        createTestIo(dir.path),
        { target: 'reqs' }),
      0);

    await assert.rejects(
      execMove(
        io,
        { file:
            'reqs/parts/EV1 Passes.md',
          destination: 'reqs/RQ1 Root.md' }),
      /the file already exists/);
  });

test(
  'execLog appends an entry to an evidence only',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await execLog(
      io,
      { file:
          'reqs/evidence/EV2 Fails.md',
        status: 'Passed',
        note: 'checked by hand' });

    await execLog(
      io,
      { file:
          'reqs/evidence/EV2 Fails.md',
        status: 'Failed',
        time:
          '2026-02-01T00:00:00Z' });

    assert.equal(
      io.out(),
      'Logged reqs/evidence/EV2 Fails.md: 2026-01-02T03:04:05.000Z Passed - checked by hand\nLogged reqs/evidence/EV2 Fails.md: 2026-02-01T00:00:00Z Failed\n');

    assert.ok(
      (await dir.readText(
        'reqs/evidence/EV2 Fails.md'))
        .endsWith(
          '## Log\n\n- 2026-01-02T03:04:05.000Z Passed - checked by hand\n- 2026-02-01T00:00:00Z Failed\n'));

    await assert.rejects(
      execLog(
        io,
        { file: 'reqs/RQ1 Root.md',
          status: 'Passed' }),
      /is a requirement; only evidence has a log/);

    await assert.rejects(
      execLog(
        io,
        { file:
            'reqs/evidence/EV2 Fails.md',
          status: 'OK' }),
      /Invalid status/);

    await assert.rejects(
      execLog(
        io,
        { file:
            'reqs/evidence/EV2 Fails.md',
          status: 'Passed',
          time: 'soon' }),
      /Invalid time/);
  });
