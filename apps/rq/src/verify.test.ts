import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';
import { execVerify }
  from './verify.js';

test(
  'execVerify runs the evidence and fails the requirements above a failure',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execVerify(
        io,
        { target: 'reqs' }),
      1);

    assert.equal(
      io.out(),
      `Fail  RQ1 Root.md - 1 of 2 links failed
Fail  RQ2 Part.md - 1 of 1 links failed
OK    evidence/EV1 Passes.md - 2 steps
Fail  evidence/EV2 Fails.md - step 1 exited with code 3
`);

    assert.ok(
      (await dir.readText(
        'reqs/evidence/EV2 Fails.md'))
        .includes(
          '- 2026-01-02T03:04:05.000Z Failed - step 1 exited with code 3'));
  });

test(
  'execVerify verifies only the subtree of a file',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(
        dir.resolve('reqs'));

    assert.equal(
      await execVerify(
        io,
        { target:
            'evidence/EV1 Passes.md' }),
      0);

    assert.equal(
      io.out(),
      'OK    EV1 Passes.md - 2 steps\n');

    assert.ok(
      !(await dir.readText(
        'reqs/evidence/EV2 Fails.md')).includes('## Log'));
  });

test(
  'execVerify reports structure errors and requirements with no links',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/A.md',
      '# A\n\n[B](B.md) [gone](Gone.md)\n');

    await dir.writeText(
      'reqs/B.md',
      '# B\n\n[A](A.md)\n');

    await dir.writeText(
      'reqs/C.md',
      '# C\n');

    const io =
      createTestIo(dir.path);

    assert.equal(
      await execVerify(
        io,
        { target: 'reqs/A.md' }),
      1);

    assert.equal(
      io.out(),
      `Fail  A.md - 1 of 1 links failed
Fail  B.md - 1 of 1 links failed
Error  A.md: the link to Gone.md points at no file.
Error  cycle: A.md -> B.md -> A.md.
`);

    const leaf =
      createTestIo(dir.path);

    assert.equal(
      await execVerify(
        leaf,
        { target: 'reqs/C.md' }),
      1);

    assert.equal(
      leaf.out(),
      'Fail  C.md - links to no requirement or evidence\n');
  });

test(
  'execVerify checks coverage with an AI agent',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'agent.cjs',
      `let prompt = '';
process.stdin.on('data', chunk => prompt += chunk);
process.stdin.on('end', () => {
  console.log(prompt.includes('RQ2 Part.md (requirement)')
    ? '{"result":"Fail","message":"Nothing covers speed."}'
    : '{"result":"OK"}');
});
`);

    const io =
      createTestIo(
        dir.path,
        { RQ_AI_COMMAND:
            `node "${dir.resolve('agent.cjs')}"` });

    await execVerify(
      io,
      { target: 'reqs',
        ai: 'claude' });

    assert.match(
      io.out(),
      /^Fail {2}RQ1 Root\.md - 1 of 2 links failed; Nothing covers speed\.\nFail {2}RQ2 Part\.md - 1 of 1 links failed\n/);
  });
