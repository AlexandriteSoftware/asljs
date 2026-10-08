import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { execCheck }
  from './check.js';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'execCheck passes a well-formed graph without running its steps',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execCheck(
        io,
        { target: 'reqs' }),
      0);

    assert.equal(
      io.out(),
      'OK  2 requirements, 2 evidence\n');

    assert.ok(
      !(await dir.readText(
        'reqs/evidence/EV2 Fails.md')).includes('## Log'));
  });

test(
  'execCheck reports problems of the graph and of each document',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/RQ1 Root.md',
      `# RQ1 Root

[Gone](Gone.md)

## Implementation

- [RQ2](<RQ2 Leaf.md>)
- [EV1][ev1]
- Just text

Stray paragraph.

## Log

- 2026-01-01T00:00:00Z Passed

[ev1]: <EV1 Proof.md>
`);

    await dir.writeText(
      'reqs/RQ2 Leaf.md',
      'No heading.\n');

    await dir.writeText(
      'reqs/EV1 Proof.md',
      `# EV1 Proof

## Steps

Nothing to run.

## Log

- 2026-01-01T00:00:00Z Passed - fine
- someday Passed
`);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execCheck(
        io,
        { target: 'reqs' }),
      1);

    assert.equal(
      io.out(),
      `Error  RQ1 Root.md: the link to Gone.md points at no file.
Error  RQ1 Root.md: the Implementation section holds more than a list.
Error  RQ1 Root.md: the Implementation item "Just text" links to no requirement or evidence.
Error  RQ1 Root.md: a requirement has a Log section; only evidence is run.
Error  RQ2 Leaf.md: no level 1 heading.
Error  RQ2 Leaf.md: links to no requirement or evidence.
Error  EV1 Proof.md: the Steps section has no commands.
Error  EV1 Proof.md: the log entry "someday Passed" is not "<time> Passed|Failed[ - <note>]".
`);
  });
