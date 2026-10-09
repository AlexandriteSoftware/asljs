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
      [ 'R1 Root.md' ]);

    assert.deepEqual(
      shape(graph),
      { 'R1 Root.md':
          [ 'R2 Part.md',
            'tests/T1 Passes.md' ],
        'R2 Part.md':
          [ 'tests/T2 Fails.md' ],
        'tests/T1 Passes.md': [ ],
        'tests/T2 Fails.md': [ ] });

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
        dir.resolve('reqs/R2 Part.md'));

    assert.deepEqual(
      Object.keys(
        shape(graph)),
      [ 'R2 Part.md',
        'tests/T2 Fails.md' ]);
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
  'loadGraph follows only Implementation links to requirements and tests',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/R1 A.md',
      `${
        requirement(
          'R1 A',
          'R2 B.md',
          'notes.md')
      }\nSee [R3](<R3 C.md>).\n`);

    await dir.writeText(
      'reqs/R2 B.md',
      requirement('R2 B'));

    await dir.writeText(
      'reqs/R3 C.md',
      requirement('R3 C'));

    await dir.writeText(
      'reqs/notes.md',
      '# notes\n\n[R1](<R1 A.md>)\n');

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    assert.deepEqual(
      shape(graph),
      { 'R1 A.md':
          [ 'R2 B.md' ],
        'R3 C.md': [ ],
        'R2 B.md': [ ] });

    assert.deepEqual(
      graph.errors,
      [ 'R1 A.md: the link to notes.md is not a requirement or test.' ]);

    await assert.rejects(
      loadGraph(
        dir.resolve('reqs/notes.md')),
      /notes\.md: not a requirement or test; the file name must start with R<n> or T<n>\./);
  });

test(
  'loadGraph reports broken links, cycles and unreachable documents',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/R1 A.md',
      requirement(
        'R1 A',
        'R2 B.md',
        'R9 Missing.md'));

    await dir.writeText(
      'reqs/R2 B.md',
      requirement(
        'R2 B',
        'R3 C.md'));

    await dir.writeText(
      'reqs/R3 C.md',
      requirement(
        'R3 C',
        'R2 B.md'));

    await dir.writeText(
      'reqs/.hidden/R4 D.md',
      requirement('R4 D'));

    const graph =
      await loadGraph(
        dir.resolve('reqs/R1 A.md'));

    assert.deepEqual(
      graph.errors,
      [ 'R1 A.md: the link to R9 Missing.md points at no file.',
        'cycle: R2 B.md -> R3 C.md -> R2 B.md.',
        'R2 B.md: linked from 2 requirements, R1 A.md, R3 C.md; a requirement has one parent.' ]);

    await dir.writeText(
      'reqs/R5 E.md',
      requirement(
        'R5 E',
        'R1 A.md'));

    await dir.writeText(
      'reqs/R6 F.md',
      requirement(
        'R6 F',
        'R7 G.md'));

    await dir.writeText(
      'reqs/R7 G.md',
      requirement(
        'R7 G',
        'R6 F.md'));

    await dir.writeText(
      'reqs/T1 Orphan.md',
      '# T1 Orphan\n\n## Steps\n\n```\nnode -v\n```\n');

    assert.deepEqual(
      (await loadGraph(
        dir.resolve('reqs'))).errors,
      [ 'R1 A.md: the link to R9 Missing.md points at no file.',
        'cycle: R2 B.md -> R3 C.md -> R2 B.md.',
        'R2 B.md: linked from 2 requirements, R1 A.md, R3 C.md; a requirement has one parent.',
        'R6 F.md: not reachable from any root; link it from a requirement with rq link.',
        'R7 G.md: not reachable from any root; link it from a requirement with rq link.',
        'T1 Orphan.md: not reachable from any root; link it from a requirement with rq link.' ]);
  });

test(
  'loadGraph takes every unlinked requirement of a folder as a root',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/R1 A.md',
      requirement(
        'R1 A',
        'T1 C.md'));

    await dir.writeText(
      'reqs/R2 B.md',
      requirement(
        'R2 B',
        'T1 C.md'));

    await dir.writeText(
      'reqs/T1 C.md',
      '# T1 C\n\n## Steps\n\n```\nnode -v\n```\n');

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    assert.deepEqual(
      shape(graph),
      { 'R1 A.md':
          [ 'T1 C.md' ],
        'R2 B.md':
          [ 'T1 C.md' ],
        'T1 C.md': [ ] });

    assert.deepEqual(
      graph.errors,
      [ ]);

    await dir.writeText(
      'reqs/R1 A.md',
      requirement(
        'R1 A',
        'R2 B.md'));

    await dir.writeText(
      'reqs/R2 B.md',
      requirement(
        'R2 B',
        'R3 C.md'));

    await dir.writeText(
      'reqs/R3 C.md',
      requirement(
        'R3 C',
        'R1 A.md'));

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
  'loadGraph reports a requirement linked from several requirements',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'reqs/R1 A.md',
      requirement(
        'R1 A',
        'R3 C.md'));

    await dir.writeText(
      'reqs/R2 B.md',
      requirement(
        'R2 B',
        'R3 C.md'));

    await dir.writeText(
      'reqs/R3 C.md',
      requirement('R3 C'));

    assert.deepEqual(
      (await loadGraph(
        dir.resolve('reqs'))).errors,
      [ 'R3 C.md: linked from 2 requirements, R1 A.md, R2 B.md; a requirement has one parent.' ]);
  });

test(
  'getNodeKind reads the kind from the file name',
  () =>
  {
    assert.equal(
      getNodeKind('/x/R12 Export.md'),
      'requirement');

    assert.equal(
      getNodeKind('/x/T3.md'),
      'test');

    for (
      const file of [ '/x/notes.md',
                      '/x/R Export.md',
                      '/x/rq1 export.md',
                      '/x/R1Export.md',
                      '/x/R1 Export.txt' ]
    ) {
      assert.equal(
        getNodeKind(file),
        null,
        file);
    }
  });

test(
  'loadGraph makes no edges from the links of a test',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'R1 A.md',
      requirement(
        'R1 A',
        'T1 B.md',
        'T2 D.md'));

    await dir.writeText(
      'T2 D.md',
      '# T2 D\n\n## Steps\n\n### Run\n\n```sh\nnode -v\n```\n');

    await dir.writeText(
      'R2 C.md',
      '# R2 C\n\nNot linked from R1.\n\n## Implementation\n\n- [T1](<T1 B.md>)\n');

    await dir.writeText(
      'T1 B.md',
      '# T1 B\n\nChecks [R1](<R1 A.md>) and [R2](<R2 C.md>).\n\n## Implementation\n\n- [R2](<R2 C.md>)\n\n## Steps\n\n### Run\n\n```sh\nnode -v\n```\n');

    const graph =
      await loadGraph(
        dir.path);

    assert.deepEqual(
      shape(graph),
      { 'R1 A.md':
          [ 'T1 B.md',
            'T2 D.md' ],
        'R2 C.md':
          [ 'T1 B.md' ],
        'T1 B.md': [ ],
        'T2 D.md': [ ] });

    assert.deepEqual(
      graph.roots.map(
        root =>
          display(
            graph,
            root)),
      [ 'R1 A.md',
        'R2 C.md' ]);

    assert.deepEqual(
      graph.errors,
      [ ]);
  });

test(
  'loadGraph reports duplicate ids, and the cycles of a folder without a root',
  async () =>
  {
    await using dir =
      new TmpDir();

    await dir.writeText(
      'R1 A.md',
      requirement(
        'R1 A',
        'a/T1 A.md',
        'b/T1 B.md'));

    await dir.writeText(
      'a/T1 A.md',
      '# T1 A\n');

    await dir.writeText(
      'b/T1 B.md',
      '# T1 B\n');

    assert.deepEqual(
      (await loadGraph(dir.path)).errors,
      [ 'T1: several documents have this id: a/T1 A.md, b/T1 B.md; ids must be unique.' ]);

    await using loop =
      new TmpDir();

    await loop.writeText(
      'R1 A.md',
      requirement(
        'R1 A',
        'R2 B.md'));

    await loop.writeText(
      'R2 B.md',
      requirement(
        'R2 B',
        'R1 A.md',
        'R3 C.md'));

    await loop.writeText(
      'R3 C.md',
      requirement(
        'R3 C',
        'R2 B.md'));

    const graph =
      await loadGraph(loop.path);

    assert.deepEqual(
      graph.roots,
      [ ]);

    assert.deepEqual(
      graph.errors,
      [ 'no requirement is a root; every requirement is linked from another.',
        'cycle: R1 A.md -> R2 B.md -> R1 A.md.',
        'cycle: R2 B.md -> R3 C.md -> R2 B.md.',
        'R2 B.md: linked from 2 requirements, R1 A.md, R3 C.md; a requirement has one parent.' ]);
  });
