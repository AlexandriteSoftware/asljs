import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { display,
         loadGraph }
  from './graph.js';
import { getAppearance,
         toMermaid }
  from './mermaid.js';
import { getStatuses }
  from './status.js';
import { ranWith,
         writeFixture }
  from './testing/fixture.js';

test(
  'toMermaid draws requirements and tests by status, edges and links',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/R2 Part.md',
      '## Implementation\n\n- [T2][T2]\n\n[T2]: <tests/T2 Fails.md>\n');

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    graph.nodes.get(graph.roots[0])!.title = 'R1 "Root"';

    assert.equal(
      toMermaid(
        graph,
        (
            file
          ) =>
        {
          const relative =
            display(
              graph,
              file);

          return relative.startsWith('tests/')
            ? null
            : `/${relative}`;
        },
        getStatuses(
          graph,
          ranWith(
            graph,
            [ [ 'T1',
                'FAIL' ] ]))),
      `graph LR
  n0["R1 #quot;Root#quot;"]
  n1["R2 Part"]
  n2(["T1 Passes"])
  n3(["T2 Fails"])
  n0 --> n1
  n0 --> n2
  n1 --> n3
  click n0 href "/R1 Root.md"
  style n0 stroke:#ef8f00,stroke-width:2px,stroke-dasharray:2 3
  click n1 href "/R2 Part.md"
  style n1 stroke:#9e9e9e,stroke-width:2px,stroke-dasharray:2 3
  style n2 stroke:#c62828,stroke-width:2px
  style n3 stroke:#9e9e9e,stroke-width:2px`);
  });

test(
  'getAppearance colours by result and styles a requirement by its coverage',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/R2 Part.md',
      '# R2 Part\n\n## Implementation\n\n- [T2][T2]\n\n[T2]: <tests/T2 Fails.md>\n\n## Status\n\n- Coverage: COMPLETE\n');

    await dir.writeText(
      'reqs/R1 Root.md',
      '# R1 Root\n\n## Implementation\n\n- [R2](<R2 Part.md>)\n- [T1](<tests/T1 Passes.md>)\n\n## Status\n\n- Coverage: INCOMPLETE - speed\n');

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    const appearance =
      (
          results: [string, 'PASS' | 'FAIL'][]
        ): Record<string, string> =>
      {
      const statuses =
        getStatuses(
          graph,
          ranWith(
            graph,
            results));

      return Object.fromEntries(
        [ ...graph.nodes ].map(
          (
              [file, node]
            ) =>
          {
            const { colour, style } =
              getAppearance(
                node,
                statuses.get(file));

            return [ display(
              graph,
              file),
                     `${colour} ${style}` ];
          }));
    };

    assert.deepEqual(
      appearance(
        [ [ 'T1',
            'PASS' ],
          [ 'T2',
            'PASS' ] ]),
      { 'R1 Root.md': 'green dashed',
        'R2 Part.md': 'green solid',
        'tests/T1 Passes.md': 'green solid',
        'tests/T2 Fails.md': 'green solid' });

    assert.deepEqual(
      appearance(
        [ [ 'T1',
            'PASS' ],
          [ 'T2',
            'FAIL' ] ]),
      { 'R1 Root.md': 'amber dashed',
        'R2 Part.md': 'amber solid',
        'tests/T1 Passes.md': 'green solid',
        'tests/T2 Fails.md': 'red solid' });

    assert.match(
      toMermaid(
        graph,
        () => null,
        getStatuses(
          graph,
          ranWith(
            graph,
            [ [ 'T1',
                'PASS' ] ]))),
      /style n0 stroke:#9e9e9e,stroke-width:2px,stroke-dasharray:6 4\n {2}style n1 stroke:#9e9e9e,stroke-width:2px\n {2}style n2 stroke:#2e7d32,stroke-width:2px\n/);
  });
