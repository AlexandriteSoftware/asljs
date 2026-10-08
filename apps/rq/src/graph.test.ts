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
import { writeFixture }
  from './testing/fixture.js';

function shape(
    graph: RqGraph
  ): Record<string, string[]>
{
  return Object.fromEntries(
    [ ...graph.nodes.values() ]
      .map(
        node => [ display(
          graph,
          node.path),
                  node.children.map(
                    child =>
              display(
                graph,
                child)) ]));
}

test(
  'loadGraph finds the root of a folder and follows the links',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    assert.deepEqual(
      graph.roots.map(
        root =>
          display(
            graph,
            root)),
      [ 'RQ1 Root.md' ]);

    assert.deepEqual(
      shape(graph),
      { 'RQ1 Root.md':
          [ 'RQ2 Part.md',
            'evidence/EV1 Passes.md' ],
        'RQ2 Part.md':
          [ 'evidence/EV2 Fails.md' ],
        'evidence/EV1 Passes.md': [ ],
        'evidence/EV2 Fails.md': [ ] });

    assert.deepEqual(
      graph.errors,
      [ ]);
  });

test(
  'loadGraph of a file starts at it',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const graph =
      await loadGraph(
        dir.resolve('reqs/RQ2 Part.md'));

    assert.deepEqual(
      Object.keys(
        shape(graph)),
      [ 'RQ2 Part.md',
        'evidence/EV2 Fails.md' ]);
  });

test(
  'loadGraph reports broken links, cycles and unreachable documents',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/A.md',
      '# A\n\n[B](B.md) [missing](Missing.md)\n');

    await dir.writeText(
      'reqs/B.md',
      '# B\n\n[C](C.md)\n');

    await dir.writeText(
      'reqs/C.md',
      '# C\n\n[B](B.md)\n');

    await dir.writeText(
      'reqs/.hidden/D.md',
      '# D\n');

    const graph =
      await loadGraph(
        dir.resolve('reqs/A.md'));

    assert.deepEqual(
      graph.errors,
      [ 'A.md: the link to Missing.md points at no file.',
        'cycle: B.md -> C.md -> B.md.' ]);

    await dir.writeText(
      'reqs/E.md',
      '# E\n\n[A](A.md)\n');

    await dir.writeText(
      'reqs/F.md',
      '# F\n\n[F2](F2.md)\n');

    await dir.writeText(
      'reqs/F2.md',
      '# F2\n\n[F](F.md)\n');

    assert.deepEqual(
      (await loadGraph(
        dir.resolve('reqs'))).errors,
      [ 'A.md: the link to Missing.md points at no file.',
        'cycle: B.md -> C.md -> B.md.',
        'F.md: not reachable from any root.',
        'F2.md: not reachable from any root.' ]);
  });

test(
  'loadGraph takes every unlinked document of a folder as a root',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/A.md',
      '# A\n\n[C](C.md)\n');

    await dir.writeText(
      'reqs/B.md',
      '# B\n\n[C](C.md)\n');

    await dir.writeText(
      'reqs/C.md',
      '# C\n');

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    assert.deepEqual(
      shape(graph),
      { 'A.md':
          [ 'C.md' ],
        'B.md':
          [ 'C.md' ],
        'C.md': [ ] });

    assert.deepEqual(
      graph.errors,
      [ ]);

    await dir.writeText(
      'reqs/A.md',
      '# A\n\n[B](B.md)\n');

    await dir.writeText(
      'reqs/B.md',
      '# B\n\n[C](C.md)\n');

    await dir.writeText(
      'reqs/C.md',
      '# C\n\n[A](A.md)\n');

    assert.match(
      (await loadGraph(
        dir.resolve('reqs'))).errors[0],
      /no document is a root; every document is linked from another\./);

    await assert.rejects(
      loadGraph(
        dir.resolve('missing')),
      /no such file or folder/);
  });
