import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { execBacklinks,
         execLinks,
         execList,
         execToJson }
  from './query.js';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'execList prints every node from the root down, as text or JSON',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execList(
        io,
        { target: 'reqs' }),
      0);

    assert.equal(
      io.out(),
      `requirement  reqs/RQ1 Root.md
requirement  reqs/RQ2 Part.md
evidence     reqs/evidence/EV1 Passes.md  Failed
evidence     reqs/evidence/EV2 Fails.md  Not run
`);

    const json =
      createTestIo(dir.path);

    await execList(
      json,
      { target: 'reqs/RQ2 Part.md',
        json: true });

    assert.deepEqual(
      JSON.parse(
        json.out()),
      [ { path: 'reqs/RQ2 Part.md',
          kind: 'requirement',
          title: 'RQ2 Part',
          status: null },
        { path:
            'reqs/evidence/EV2 Fails.md',
          kind: 'evidence',
          title: 'EV2 Fails',
          status: null } ]);
  });

test(
  'execList writes structure errors to standard error',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'RQ1 A.md',
      '# RQ1 A\n\n## Implementation\n\n- [RQ2](<RQ2 B.md>)\n');

    const io =
      createTestIo(dir.path);

    await execList(
      io,
      { target: 'RQ1 A.md' });

    assert.equal(
      io.err(),
      'Error  RQ1 A.md: the link to RQ2 B.md points at no file.\n');
  });

test(
  'execLinks prints what a requirement links to, missing and other files included',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/RQ2 Part.md',
      '# RQ2 Part\n\n[RQ1](<RQ1 Root.md>)\n\n## Implementation\n\n- [EV2](<evidence/EV2 Fails.md>)\n- [Gone](<RQ9 Gone.md>)\n- [notes](notes.md)\n');

    const io =
      createTestIo(
        dir.resolve('reqs'));

    await execLinks(
      io,
      { file: 'RQ2 Part.md' });

    assert.equal(
      io.out(),
      'evidence     evidence/EV2 Fails.md  Not run\nmissing      RQ9 Gone.md\nother        notes.md\n');

    await assert.rejects(
      execLinks(
        io,
        { file: 'Nope.md' }),
      /Nope\.md: no such file\./);

    await assert.rejects(
      execLinks(
        io,
        { file: 'notes.md' }),
      /notes\.md: not a requirement or evidence/);
  });

test(
  'execBacklinks prints the requirements that link to a document',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await execBacklinks(
      io,
      { file:
          'reqs/evidence/EV2 Fails.md',
        json: true });

    assert.deepEqual(
      JSON.parse(
        io.out()),
      [ { path: 'reqs/RQ2 Part.md',
          kind: 'requirement',
          title: 'RQ2 Part',
          status: null } ]);

    const outside =
      createTestIo(dir.path);

    await execBacklinks(
      outside,
      { file:
          'reqs/evidence/EV2 Fails.md',
        in: 'reqs/evidence' });

    assert.equal(
      outside.out(),
      '');
  });

test(
  'execToJson prints the graph with the structural fields',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    await execToJson(
      io,
      { target: 'reqs' });

    const json =
      JSON.parse(
        io.out());

    assert.deepEqual(
      json.roots,
      [ 'reqs/RQ1 Root.md' ]);

    assert.deepEqual(
      json.errors,
      [ ]);

    assert.deepEqual(
      json.nodes[0],
      { path: 'reqs/RQ1 Root.md',
        kind: 'requirement',
        title: 'RQ1 Root',
        body:
          'The tool works. See the [website](https://example.com/page.md) and the\n[notes](notes.md).',
        links:
          [ 'reqs/RQ2 Part.md',
            'reqs/evidence/EV1 Passes.md' ],
        steps: [ ],
        log: [ ] });

    assert.deepEqual(
      json.nodes[2].log,
      [ { time:
            '2025-12-31T00:00:00.000Z',
          status: 'Failed',
          note:
            'step 1 exited with code 1' } ]);
  });
