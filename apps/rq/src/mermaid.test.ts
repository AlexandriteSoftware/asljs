import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { display,
         loadGraph }
  from './graph.js';
import { toMermaid }
  from './mermaid.js';
import { writeFixture }
  from './testing/fixture.js';

test(
  'toMermaid draws requirements, evidence by status, edges and links',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/RQ2 Part.md',
      '[EV2][EV2]\n\n[EV2]: <evidence/EV2 Fails.md>\n');

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    graph.nodes.get(graph.roots[0])!.title = 'RQ1 "Root"';

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

          return relative.startsWith('evidence/')
            ? null
            : `/${relative}`;
        }),
      `graph TD
  n0["RQ1 #quot;Root#quot;"]
  n1["RQ2 Part"]
  n2(["EV1 Passes"])
  n3(["EV2 Fails"])
  n0 --> n1
  n0 --> n2
  n1 --> n3
  click n0 href "/RQ1 Root.md"
  click n1 href "/RQ2 Part.md"
  class n2 failed
  classDef passed fill:#d7f5d7,stroke:#2e7d32
  classDef failed fill:#f8d7d7,stroke:#c62828`);
  });
