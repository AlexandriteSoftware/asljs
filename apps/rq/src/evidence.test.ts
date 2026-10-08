import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { runEvidence }
  from './evidence.js';
import { loadGraph }
  from './graph.js';
import { writeFixture }
  from './testing/fixture.js';

const now =
  (): Date =>
  new Date(
    '2026-01-02T03:04:05.000Z');

test(
  'runEvidence runs the steps and appends the outcome to the Log',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    const passes =
      graph.nodes.get(
        dir.resolve(
          'reqs/evidence/EV1 Passes.md'))!;

    assert.deepEqual(
      await runEvidence(
        passes,
        now),
      { time:
          '2026-01-02T03:04:05.000Z',
        status: 'Passed',
        note: '2 steps' });

    assert.ok(
      (await dir.readText(
        'reqs/evidence/EV1 Passes.md'))
        .endsWith(
          '- 2025-12-31T00:00:00.000Z Failed - step 1 exited with code 1\n- 2026-01-02T03:04:05.000Z Passed - 2 steps\n'));

    assert.equal(
      passes.log.at(-1)?.status,
      'Passed');

    const fails =
      graph.nodes.get(
        dir.resolve(
          'reqs/evidence/EV2 Fails.md'))!;

    assert.deepEqual(
      await runEvidence(
        fails,
        now),
      { time:
          '2026-01-02T03:04:05.000Z',
        status: 'Failed',
        note:
          'step 1 exited with code 3' });

    assert.ok(
      (await dir.readText(
        'reqs/evidence/EV2 Fails.md'))
        .endsWith(
          '## Log\n\n- 2026-01-02T03:04:05.000Z Failed - step 1 exited with code 3\n'));
  });

test(
  'runEvidence runs the steps in the evidence folder and fails without steps',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'ev/data.txt',
      'x');

    await dir.writeText(
      'ev/EV1 Reads.md',
      "# EV1 Reads\n\n## Steps\n\n```\nnode -e \"require('fs').readFileSync('data.txt')\"\n```\n");

    await dir.writeText(
      'ev/EV2 Empty.md',
      '# EV2 Empty\n\n## Steps\n\nNothing to run.\n');

    const reads =
      (await loadGraph(
        dir.resolve('ev/EV1 Reads.md'))).nodes
      .values().next().value!;

    assert.equal(
      (await runEvidence(
        reads,
        now)).status,
      'Passed');

    const empty =
      (await loadGraph(
        dir.resolve('ev/EV2 Empty.md'))).nodes
      .values().next().value!;

    assert.deepEqual(
      await runEvidence(
        empty,
        now),
      { time:
          '2026-01-02T03:04:05.000Z',
        status: 'Failed',
        note: 'no steps' });
  });
