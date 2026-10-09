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
      `requirement  reqs/R1 Root.md  FAIL
requirement  reqs/R2 Part.md  NOT RUN
test         reqs/tests/T1 Passes.md  FAIL
test         reqs/tests/T2 Fails.md  NOT RUN
`);

    const json =
      createTestIo(dir.path);

    await execList(
      json,
      { target: 'reqs/R2 Part.md',
        json: true });

    assert.deepEqual(
      JSON.parse(
        json.out()),
      [ { path: 'reqs/R2 Part.md',
          kind: 'requirement',
          title: 'R2 Part',
          status: 'NOT RUN',
          coverage: null },
        { path:
            'reqs/tests/T2 Fails.md',
          kind: 'test',
          title: 'T2 Fails',
          status: 'NOT RUN',
          coverage: null } ]);
  });

test(
  'execList writes structure errors to standard error',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'R1 A.md',
      '# R1 A\n\n## Implementation\n\n- [R2](<R2 B.md>)\n');

    const io =
      createTestIo(dir.path);

    await execList(
      io,
      { target: 'R1 A.md' });

    assert.equal(
      io.err(),
      'Error  R1 A.md: the link to R2 B.md points at no file.\n');
  });

test(
  'execLinks prints what a requirement links to, missing and other files included',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/R2 Part.md',
      '# R2 Part\n\n[R1](<R1 Root.md>)\n\n## Implementation\n\n- [T2](<tests/T2 Fails.md>)\n- [Gone](<R9 Gone.md>)\n- [notes](notes.md)\n');

    const io =
      createTestIo(
        dir.resolve('reqs'));

    await execLinks(
      io,
      { file: 'R2 Part.md' });

    assert.equal(
      io.out(),
      'test         tests/T2 Fails.md  NOT RUN\nmissing      R9 Gone.md\nother        notes.md\n');

    await assert.rejects(
      execLinks(
        io,
        { file: 'Nope.md' }),
      /Nope\.md: no such file in /);

    await assert.rejects(
      execLinks(
        io,
        { file: 'notes.md' }),
      /notes\.md: not a requirement or test/);
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
          'reqs/tests/T2 Fails.md',
        json: true });

    assert.deepEqual(
      JSON.parse(
        io.out()),
      [ { path: 'reqs/R2 Part.md',
          kind: 'requirement',
          title: 'R2 Part',
          status: 'NOT RUN',
          coverage: null } ]);

    const outside =
      createTestIo(
        dir.resolve('reqs/tests'));

    await execBacklinks(
      outside,
      { file: 'T2' });

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
      [ 'reqs/R1 Root.md' ]);

    assert.deepEqual(
      json.errors,
      [ ]);

    assert.deepEqual(
      json.nodes[0],
      { path: 'reqs/R1 Root.md',
        kind: 'requirement',
        title: 'R1 Root',
        body:
          'The tool works. See the [website](https://example.com/page.md) and the\n[notes](notes.md).',
        links:
          [ 'reqs/R2 Part.md',
            'reqs/tests/T1 Passes.md' ],
        steps: [ ],
        status: 'FAIL',
        coverage: null });

    assert.equal(
      json.nodes[2].status,
      'FAIL');
  });
