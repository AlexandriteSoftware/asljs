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
      'OK  2 requirements, 2 tests\n');

    await assert.rejects(
      dir.stat('.rq/E2 reqs.md'));
  });

test(
  'execCheck reports problems of the graph and of each document',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/R1 Root.md',
      `# R1 Root

See the [notes](notes.md).

## Implementation

- [R2](<R2 Leaf.md>)
- [T1][t1]
- [Gone](<R9 Gone.md>)
- [Notes](notes.md)
- Just text

Stray paragraph.

## Log

- 2026-01-01T00:00:00Z Passed

[t1]: <T1 Proof.md>
`);

    await dir.writeText(
      'reqs/R2 Leaf.md',
      'No heading.\n\n## Steps\n\n```\nnode -v\n```\n');

    await dir.writeText(
      'reqs/notes.md',
      'Not a requirement, so not checked.\n');

    await dir.writeText(
      'reqs/T1 Proof.md',
      `# T1 Proof

## Steps

Nothing to run.

## Implementation

- [R2](<R2 Leaf.md>)

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
      `Error  R1 Root.md: the link to R9 Gone.md points at no file.
Error  R1 Root.md: the link to notes.md is not a requirement or test.
Error  R1 Root.md: the Implementation section holds more than a list.
Error  R1 Root.md: the Implementation item "Just text" links to no requirement or test.
Error  R1 Root.md: has a Log section; results are kept in .rq/E<n> files.
Error  R2 Leaf.md: no level 1 heading.
Error  R2 Leaf.md: links to no requirement or test.
Error  R2 Leaf.md: a requirement has steps; only tests are run.
Error  T1 Proof.md: the Steps section has content before its first step; each step is a ### heading.
Error  T1 Proof.md: a test has an Implementation section; only a requirement links to requirements and tests.
Error  T1 Proof.md: has a Log section; results are kept in .rq/E<n> files.
`);
  });

test(
  'execCheck reports a malformed Status and a test with a coverage',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'R1 A.md',
      '# R1 A\n\n## Implementation\n\n- [T1](<T1 B.md>)\n\n## Status\n\n- Result: DONE\n- Owner: alice\n');

    await dir.writeText(
      'T1 B.md',
      '# T1 B\n\n## Steps\n\n### Run\n\n```sh\nnode -v\n```\n\n## Coverage\n\nCovered.\n\n## Status\n\n- Result: PASS\n- Coverage: COMPLETE\n');

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execCheck(
        io,
        { target: '.' }),
      1);

    assert.equal(
      io.out(),
      `Error  R1 A.md: the Status item "Result: DONE" is not "Result: PASS|FAIL|NOT RUN[ - <note>]", "Coverage: COMPLETE|INCOMPLETE[ - <note>]" or "Execution: <link>".
Error  R1 A.md: the Status item "Owner: alice" is not "Result: PASS|FAIL|NOT RUN[ - <note>]", "Coverage: COMPLETE|INCOMPLETE[ - <note>]" or "Execution: <link>".
Error  T1 B.md: a test has a Coverage status; only a requirement is checked for coverage.
Error  T1 B.md: a test has a Coverage section; only a requirement is checked for coverage.
`);
  });
