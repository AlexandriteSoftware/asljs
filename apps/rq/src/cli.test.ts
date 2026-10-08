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
