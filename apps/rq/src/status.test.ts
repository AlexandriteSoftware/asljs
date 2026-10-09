import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { display,
         loadGraph,
         RqGraph }
  from './graph.js';
import { TestStatus }
  from './results.js';
import { getStatuses,
         withAncestors }
  from './status.js';
import { ranWith,
         writeFixture }
  from './testing/fixture.js';

function statuses(
    graph: RqGraph,
    results: [string, TestStatus][]
  ): Record<string, string>
{
  return Object.fromEntries(
    [ ...getStatuses(
      graph,
      ranWith(
        graph,
        results)) ]
      .map(
        (
          [file, status]
        ) => [ display(
          graph,
          file),
               `${status.status}${
            status.message === ''
              ? ''
              : ` - ${status.message}`
          }` ]));
}

test(
  'getStatuses passes a requirement only when everything below it passes',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    assert.deepEqual(
      statuses(
        graph,
        [ ]),
      { 'R1 Root.md':
          'FAIL - 1 of 2 links failed',
        'R2 Part.md':
          'NOT RUN - 1 of 1 links not run',
        'tests/T1 Passes.md': 'FAIL',
        'tests/T2 Fails.md': 'NOT RUN' });

    assert.deepEqual(
      statuses(
        graph,
        [ [ 'T1',
            'PASS' ],
          [ 'T2',
            'FAIL' ] ]),
      { 'R1 Root.md':
          'FAIL - 1 of 2 links failed',
        'R2 Part.md':
          'FAIL - 1 of 1 links failed',
        'tests/T1 Passes.md': 'PASS',
        'tests/T2 Fails.md': 'FAIL' });

    assert.deepEqual(
      statuses(
        graph,
        [ [ 'T1',
            'PASS' ],
          [ 'T2',
            'PASS' ] ]),
      { 'R1 Root.md': 'PASS',
        'R2 Part.md': 'PASS',
        'tests/T1 Passes.md': 'PASS',
        'tests/T2 Fails.md': 'PASS' });
  });

test(
  'getStatuses fails a requirement with no links and one in a cycle',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'R1 A.md',
      '# R1 A\n\n## Implementation\n\n- [R2](<R2 B.md>)\n');

    await dir.writeText(
      'R2 B.md',
      '# R2 B\n\n## Implementation\n\n- [R1](<R1 A.md>)\n');

    await dir.writeText(
      'R3 C.md',
      '# R3 C\n');

    assert.deepEqual(
      statuses(
        await loadGraph(
          dir.resolve('R1 A.md')),
        [ ]),
      { 'R1 A.md':
          'FAIL - 1 of 1 links failed',
        'R2 B.md':
          'FAIL - 1 of 1 links failed' });

    assert.deepEqual(
      statuses(
        await loadGraph(
          dir.resolve('R3 C.md')),
        [ ]),
      { 'R3 C.md':
          'FAIL - links to no requirement or test' });
  });

test(
  'getStatuses takes the recorded results, and recalculates only what it is asked to',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/R2 Part.md',
      `${await dir.readText(
        'reqs/R2 Part.md')}\n## Status\n\n- Result: FAIL - recorded\n`);

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    const status =
      (
      options: Parameters<typeof getStatuses>[1]
    ): string[] =>
      [ ...getStatuses(
        graph,
        options) ]
        .map(
          (
            [file, { status, message }]
          ) =>
            `${
              display(
                graph,
                file)
            }: ${status} ${message}`.trim())
        .sort();

    assert.deepEqual(
      status({}),
      [ 'R1 Root.md: FAIL 2 of 2 links failed',
        'R2 Part.md: FAIL recorded',
        'tests/T1 Passes.md: FAIL',
        'tests/T2 Fails.md: NOT RUN' ]);

    assert.deepEqual(
      status(
        { ...ranWith(
          graph,
          [ [ 'T1',
              'PASS' ] ]),
          recalculate:
            new Set(
              [ dir.resolve('reqs/R1 Root.md') ]) }),
      [ 'R1 Root.md: FAIL 1 of 2 links failed',
        'R2 Part.md: FAIL recorded',
        'tests/T1 Passes.md: PASS',
        'tests/T2 Fails.md: NOT RUN' ]);

    assert.deepEqual(
      status(
        ranWith(
          graph,
          [ [ 'T1',
              'PASS' ] ])),
      [ 'R1 Root.md: NOT RUN 1 of 2 links not run',
        'R2 Part.md: NOT RUN 1 of 1 links not run',
        'tests/T1 Passes.md: PASS',
        'tests/T2 Fails.md: NOT RUN' ]);

    assert.deepEqual(
      [ ...withAncestors(
        graph,
        [ dir.resolve(
          'reqs/tests/T2 Fails.md') ]) ]
        .map(
          file =>
            display(
              graph,
              file))
        .sort(),
      [ 'R1 Root.md',
        'R2 Part.md',
        'tests/T2 Fails.md' ]);
  });
