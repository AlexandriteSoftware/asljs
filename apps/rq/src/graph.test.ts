import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { display,
         getNodeKind,
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

/**
 * A requirement whose `## Implementation` list links to `links`.
 */
function requirement(
    title: string,
    ...links: string[]
  ): string
{
  return `# ${title}\n\nStatement.\n\n## Implementation\n\n${
    links
      .map(
        link => `- [${link}](<${link}>)\n`)
      .join('')
  }`;
}

test(
  'loadGraph follows only Implementation links to requirements and evidence',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/RQ1 A.md',
      `${
        requirement(
          'RQ1 A',
          'RQ2 B.md',
          'notes.md')
      }\nSee [RQ3](<RQ3 C.md>).\n`);

    await dir.writeText(
      'reqs/RQ2 B.md',
      requirement('RQ2 B'));

    await dir.writeText(
      'reqs/RQ3 C.md',
      requirement('RQ3 C'));

    await dir.writeText(
      'reqs/notes.md',
      '# notes\n\n[RQ1](<RQ1 A.md>)\n');

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    assert.deepEqual(
      shape(graph),
      { 'RQ1 A.md':
          [ 'RQ2 B.md' ],
        'RQ3 C.md': [ ],
        'RQ2 B.md': [ ] });

    assert.deepEqual(
      graph.errors,
      [ 'RQ1 A.md: the link to notes.md is not a requirement or evidence.' ]);

    await assert.rejects(
      loadGraph(
        dir.resolve('reqs/notes.md')),
      /notes\.md: not a requirement or evidence; the file name must start with RQ<n> or EV<n>\./);
  });

test(
  'loadGraph reports broken links, cycles and unreachable documents',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/RQ1 A.md',
      requirement(
        'RQ1 A',
        'RQ2 B.md',
        'RQ9 Missing.md'));

    await dir.writeText(
      'reqs/RQ2 B.md',
      requirement(
        'RQ2 B',
        'RQ3 C.md'));

    await dir.writeText(
      'reqs/RQ3 C.md',
      requirement(
        'RQ3 C',
        'RQ2 B.md'));

    await dir.writeText(
      'reqs/.hidden/RQ4 D.md',
      requirement('RQ4 D'));

    const graph =
      await loadGraph(
        dir.resolve('reqs/RQ1 A.md'));

    assert.deepEqual(
      graph.errors,
      [ 'RQ1 A.md: the link to RQ9 Missing.md points at no file.',
        'cycle: RQ2 B.md -> RQ3 C.md -> RQ2 B.md.' ]);

    await dir.writeText(
      'reqs/RQ5 E.md',
      requirement(
        'RQ5 E',
        'RQ1 A.md'));

    await dir.writeText(
      'reqs/RQ6 F.md',
      requirement(
        'RQ6 F',
        'RQ7 G.md'));

    await dir.writeText(
      'reqs/RQ7 G.md',
      requirement(
        'RQ7 G',
        'RQ6 F.md'));

    await dir.writeText(
      'reqs/EV1 Orphan.md',
      '# EV1 Orphan\n\n## Steps\n\n```\nnode -v\n```\n');

    assert.deepEqual(
      (await loadGraph(
        dir.resolve('reqs'))).errors,
      [ 'RQ1 A.md: the link to RQ9 Missing.md points at no file.',
        'cycle: RQ2 B.md -> RQ3 C.md -> RQ2 B.md.',
        'EV1 Orphan.md: not reachable from any root.',
        'RQ6 F.md: not reachable from any root.',
        'RQ7 G.md: not reachable from any root.' ]);
  });

test(
  'loadGraph takes every unlinked requirement of a folder as a root',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/RQ1 A.md',
      requirement(
        'RQ1 A',
        'RQ3 C.md'));

    await dir.writeText(
      'reqs/RQ2 B.md',
      requirement(
        'RQ2 B',
        'RQ3 C.md'));

    await dir.writeText(
      'reqs/RQ3 C.md',
      requirement('RQ3 C'));

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    assert.deepEqual(
      shape(graph),
      { 'RQ1 A.md':
          [ 'RQ3 C.md' ],
        'RQ2 B.md':
          [ 'RQ3 C.md' ],
        'RQ3 C.md': [ ] });

    assert.deepEqual(
      graph.errors,
      [ ]);

    await dir.writeText(
      'reqs/RQ1 A.md',
      requirement(
        'RQ1 A',
        'RQ2 B.md'));

    await dir.writeText(
      'reqs/RQ3 C.md',
      requirement(
        'RQ3 C',
        'RQ1 A.md'));

    assert.match(
      (await loadGraph(
        dir.resolve('reqs'))).errors[0],
      /no requirement is a root; every requirement is linked from another\./);

    await assert.rejects(
      loadGraph(
        dir.resolve('missing')),
      /no such file or folder/);
  });

test(
  'getNodeKind reads the kind from the file name',
  () =>
  {
    assert.equal(
      getNodeKind('/x/RQ12 Export.md'),
      'requirement');

    assert.equal(
      getNodeKind('/x/EV3.md'),
      'evidence');

    for (
      const file of [ '/x/notes.md',
                      '/x/RQ Export.md',
                      '/x/rq1 export.md',
                      '/x/RQ1Export.md',
                      '/x/RQ1 Export.txt' ]
    ) {
      assert.equal(
        getNodeKind(file),
        null,
        file);
    }
  });
