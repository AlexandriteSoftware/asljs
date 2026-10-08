import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { runCli }
  from './cli.js';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'rq without arguments prints help',
  async () =>
  {
    const io =
      createTestIo(
        process.cwd());

    assert.equal(
      await runCli(
        [ ],
        io),
      0);

    assert.match(
      io.out(),
      /Usage: rq/);

    assert.match(
      io.out(),
      /verify/);

    assert.match(
      io.out(),
      /view/);
  });

test(
  'rq verify returns the verification exit code',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await runCli(
        [ 'verify',
          'reqs/evidence/EV1 Passes.md' ],
        io),
      0);

    assert.equal(
      await runCli(
        [ 'verify',
          'reqs' ],
        io),
      1);
  });

test(
  'rq verify rejects an unknown agent and a missing path',
  async () =>
  {
    const io =
      createTestIo(
        process.cwd());

    assert.equal(
      await runCli(
        [ 'verify',
          '.',
          '--ai',
          'gpt' ],
        io),
      1);

    assert.match(
      io.err(),
      /Unknown AI agent: gpt\. Use claude or copilot\./);

    assert.equal(
      await runCli(
        [ 'verify',
          'no/such/path' ],
        io),
      1);

    assert.match(
      io.err(),
      /no such file or folder/);
  });

test(
  'rq view rejects an invalid port',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await runCli(
        [ 'view',
          'reqs',
          '--port',
          'x' ],
        io),
      1);

    assert.match(
      io.err(),
      /Invalid port: x/);
  });

test(
  'rq add, links, backlinks, log and check forward their options',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await runCli(
        [ 'add',
          'evidence',
          'reqs/RQ2 Part.md',
          'Bench',
          '--description',
          'It is fast.',
          '--step',
          'node -v',
          '--step',
          'npm -v' ],
        io),
      0);

    assert.equal(
      await dir.readText(
        'reqs/evidence/EV3 Bench.md'),
      '# EV3 Bench\n\nIt is fast.\n\n## Steps\n\n```sh\nnode -v\nnpm -v\n```\n');

    const links =
      createTestIo(dir.path);

    await runCli(
      [ 'links',
        'reqs/RQ2 Part.md',
        '--json' ],
      links);

    assert.deepEqual(
      JSON.parse(
        links.out())
        .map(
          (node: { path: string; }) => node.path),
      [ 'reqs/evidence/EV2 Fails.md',
        'reqs/evidence/EV3 Bench.md' ]);

    const backlinks =
      createTestIo(dir.path);

    await runCli(
      [ 'backlinks',
        'reqs/evidence/EV3 Bench.md',
        '--in',
        'reqs' ],
      backlinks);

    assert.equal(
      backlinks.out(),
      'requirement  reqs/RQ2 Part.md\n');

    assert.equal(
      await runCli(
        [ 'log',
          'reqs/evidence/EV3 Bench.md',
          '--note',
          'no status' ],
        io),
      1);

    assert.match(
      io.err(),
      /required option '--status <status>' not specified/);

    assert.equal(
      await runCli(
        [ 'log',
          'reqs/evidence/EV3 Bench.md',
          '--status',
          'Passed',
          '--time',
          '2026-03-01T00:00:00Z' ],
        io),
      0);

    assert.equal(
      await runCli(
        [ 'check',
          'reqs' ],
        io),
      0);

    assert.equal(
      await runCli(
        [ 'unlink',
          'reqs/RQ1 Root.md',
          'reqs/RQ2 Part.md' ],
        io),
      0);

    assert.equal(
      await runCli(
        [ 'check',
          'reqs' ],
        io),
      1);
  });
