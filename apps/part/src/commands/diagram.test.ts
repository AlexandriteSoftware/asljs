import { createTestLoggerProvider,
         TmpEnv }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execDiagram }
  from './diagram.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async (): Promise<void> =>
  {
    await loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

const logger =
  loggerProvider.getLogger(
    'execDiagram');

const MODULE_DEFINITION =
  `# Module

A module.

## Properties

### Name

- Type: String

The module name.

### Uses

- Type: Artefact[]

Modules it uses.

### Tests

- Type: Artefact[]

Modules that test it.

## Location

- Pattern: \`../*/*/mod.md\`
`;

const PLUGIN =
  `const data = {
  'file:apps/c/mod.md':
    { Name: 'C',
      Uses: [ '../../libs/a/mod.md' ],
      Tests: [ 'file:libs/b/mod.md' ] },
  'file:libs/a/mod.md':
    { Name: 'A "core"',
      Uses: [ 'file:libs/b/mod.md', 'file:missing/x.md' ] },
  'file:libs/b/mod.md':
    { Name: '' },
  'file:tools/d/mod.md':
    { Name: 'D',
      Uses: [ 'file:libs/a/mod.md' ] }
};

export default () => ({
  name: 'test',
  data: { Module: async artefact => data[artefact.location] ?? {} }
});
`;

async function createWorkspace(
  ): Promise<ReturnType<typeof tmpDir>>
{
  const workspace =
    tmpDir();

  await workspace.writeText(
    'defs/Module.md',
    MODULE_DEFINITION);

  await workspace.writeText(
    'plugin.js',
    PLUGIN);

  for (
    const folder of [ 'apps/c',
                      'libs/a',
                      'libs/b',
                      'tools/d' ]
  ) {
    await workspace.writeText(
      `${folder}/mod.md`,
      'A module.\n');
  }

  return workspace;
}

function createDiagramEnvironment(
    workspace: ReturnType<typeof tmpDir>
  ): ReturnType<typeof createEnvironment>
{
  return createEnvironment(
    { cwd: workspace.path,
      definitions:
        [ workspace.resolve('defs'),
          workspace.resolve('plugin.js') ],
      project: workspace.path,
      loggerProvider });
}

test(
  'RQ124: diagram draws the candidates with styled, labelled and grouped edges',
  async () =>
  {
    await using workspace =
      await createWorkspace();

    await workspace.writeText(
      'docs/Modules.md',
      `# Modules

## Nodes

- Definitions: Module
- Label: Name
- Exclude: \`tools/**\`

## Edges

### Uses

### Module.Tests

- Style: dotted
- Label: tests
- Direction: reverse

## Layout

- Direction: LR
- Group: folder
`);

    const environment =
      createDiagramEnvironment(workspace);

    await execDiagram(
      logger,
      environment,
      { document: 'docs/Modules.md' });

    assert.equal(
      environment.stdout.toString(),
      [ 'graph LR',
        '  subgraph gapps["apps"]',
        '    napps_c_mod_md["C"]',
        '  end',
        '  subgraph glibs["libs"]',
        '    nlibs_a_mod_md["A #quot;core#quot;"]',
        '    nlibs_b_mod_md["libs/b/mod.md"]',
        '  end',
        '  napps_c_mod_md --> nlibs_a_mod_md',
        '  nlibs_b_mod_md -.->|"tests"| napps_c_mod_md',
        '  nlibs_a_mod_md --> nlibs_b_mod_md',
        '' ].join('\n'));
  });

test(
  'RQ124: diagram nodes are what the roots reach along the followed properties',
  async () =>
  {
    await using workspace =
      await createWorkspace();

    await workspace.writeText(
      'docs/From C.md',
      `# From C

## Nodes

- Definitions: Module

## Root

- Artefacts: apps/c/mod.md
- Follow: Uses

## Edges

### Uses

### Tests

- Style: thick
`);

    await workspace.writeText(
      'docs/From D.md',
      `# From D

## Nodes

- Definitions: Module

## Root

- Artefacts: file:tools/d/mod.md
- Depth: 1

## Edges

### Uses
`);

    const fromC =
      createDiagramEnvironment(workspace);

    await execDiagram(
      logger,
      fromC,
      { document: 'docs/From C.md' });

    assert.equal(
      fromC.stdout.toString(),
      [ 'graph TD',
        '  napps_c_mod_md["apps/c/mod.md"]',
        '  nlibs_a_mod_md["libs/a/mod.md"]',
        '  nlibs_b_mod_md["libs/b/mod.md"]',
        '  napps_c_mod_md --> nlibs_a_mod_md',
        '  napps_c_mod_md ==> nlibs_b_mod_md',
        '  nlibs_a_mod_md --> nlibs_b_mod_md',
        '' ].join('\n'));

    const fromD =
      createDiagramEnvironment(workspace);

    await execDiagram(
      logger,
      fromD,
      { document: 'docs/From D.md' });

    assert.equal(
      fromD.stdout.toString(),
      [ 'graph TD',
        '  nlibs_a_mod_md["libs/a/mod.md"]',
        '  ntools_d_mod_md["tools/d/mod.md"]',
        '  ntools_d_mod_md --> nlibs_a_mod_md',
        '' ].join('\n'));
  });

test(
  'RQ206: diagram documents are validated',
  async () =>
  {
    await using workspace =
      await createWorkspace();

    const cases =
      [ [ '## Nodes\n\n- Definitions: Module\n- Colour: red\n',
          /"Nodes" has an unknown setting "Colour: red"/ ],
        [ '## Nodes\n\n- Definitions: Module\n\n## Edges\n\n### Name\n',
          /the edge property "Name" is of type String, not Artefact or Artefact\[\]/ ],
        [ '## Nodes\n\n- Definitions: Module\n\n## Edges\n\n### Owner\n',
          /the edge property "Owner" is not a property of the node definitions/ ],
        [ '## Nodes\n\n- Definitions: Module\n\n## Edges\n\n### Uses\n\n- Style: wavy\n',
          /"Style" of "Uses" must be one of solid, dotted, thick, invisible/ ],
        [ '## Nodes\n\n- Definitions: Module\n\n## Root\n\n- Artefacts: x.md\n',
          /the root "x\.md" is not an artefact of the node definitions/ ],
        [ '## Nodes\n\n- Definitions: Module, Gadget\n',
          /"Definitions" names "Gadget", which is not a loaded definition/ ],
        [ '## Root\n\n- Artefacts: x.md\n',
          /the "Nodes" section is missing/ ] ] as const;

    for (const [body, error] of cases) {
      await workspace.writeText(
        'docs/Bad.md',
        `# Bad\n\n${body}`);

      await assert.rejects(
        execDiagram(
          logger,
          createDiagramEnvironment(workspace),
          { document: 'docs/Bad.md' }),
        error);
    }
  });

const FROM_D =
  `# From D

How D is built.

## Nodes

- Definitions: Module

## Root

- Artefacts: tools/d/mod.md
- Depth: 1

## Edges

### Uses
`;

const FROM_D_MERMAID =
  [ 'graph TD',
    '  nlibs_a_mod_md["libs/a/mod.md"]',
    '  ntools_d_mod_md["tools/d/mod.md"]',
    '  ntools_d_mod_md --> nlibs_a_mod_md' ].join('\n');

async function runDiagram(
    workspace: ReturnType<typeof tmpDir>,
    options: Omit<Parameters<typeof execDiagram>[2], 'document'> = {}
  ): Promise<ReturnType<typeof createEnvironment>>
{
  const environment =
    createDiagramEnvironment(workspace);

  await execDiagram(
    logger,
    environment,
    { document: 'docs/From D.md',
      ...options });

  return environment;
}

test(
  'RQ124: diagram saves to a markdown Target section and checks that it is current',
  async () =>
  {
    await using workspace =
      await createWorkspace();

    await workspace.writeText(
      'docs/From D.md',
      `${FROM_D}
## Output

- Target: #Diagram

## Diagram

Generated.
`);

    assert.equal(
      (await runDiagram(
        workspace,
        { check: true })).exitCode,
      1);

    const environment =
      await runDiagram(workspace);

    assert.equal(
      environment.stdout.toString(),
      '');

    const block =
      `\`\`\`mermaid\n${FROM_D_MERMAID}\n\`\`\``;

    const written =
      await workspace.readText(
        'docs/From D.md');

    assert.ok(
      written.endsWith(
        `## Diagram\n\nGenerated.\n\n${block}\n`));

    assert.equal(
      (await runDiagram(
        workspace,
        { check: true })).exitCode,
      undefined);

    await workspace.writeText(
      'docs/From D.md',
      written.replace(
        block,
        '```mermaid\ngraph TD\n```\n\nAfter.'));

    assert.equal(
      (await runDiagram(
        workspace,
        { check: true })).exitCode,
      1);

    await runDiagram(workspace);

    assert.equal(
      await workspace.readText(
        'docs/From D.md'),
      written.replace(
        block,
        `${block}\n\nAfter.`));

    assert.equal(
      (await runDiagram(
        workspace,
        { stdout: true })).stdout.toString(),
      `${FROM_D_MERMAID}\n`);
  });

test(
  'RQ124: diagram saves to a Mermaid file or a section of another document',
  async () =>
  {
    await using workspace =
      await createWorkspace();

    await workspace.writeText(
      'docs/From D.md',
      `${FROM_D}
## Output

- Target: /out/from-d.mmd
`);

    await runDiagram(workspace);

    assert.equal(
      await workspace.readText(
        'out/from-d.mmd'),
      `${FROM_D_MERMAID}\n`);

    assert.equal(
      (await runDiagram(
        workspace,
        { check: true })).exitCode,
      undefined);

    await workspace.writeText(
      'README.md',
      '# Readme\n\n## Graph\n\nThe modules.\n\n## Other\n\nText.\n');

    await workspace.writeText(
      'docs/From D.md',
      `${FROM_D}
## Output

- Target: ../README.md#Graph
`);

    await runDiagram(workspace);

    assert.equal(
      await workspace.readText(
        'README.md'),
      `# Readme\n\n## Graph\n\nThe modules.\n\n\`\`\`mermaid\n${FROM_D_MERMAID}\n\`\`\`\n\n## Other\n\nText.\n`);

    await workspace.writeText(
      'docs/From D.md',
      `${FROM_D}
## Output

- Target: ../README.md#Missing
`);

    await assert.rejects(
      runDiagram(workspace),
      /the Target heading "Missing" is not in the document/);

    await assert.rejects(
      runDiagram(
        workspace,
        { format: 'svg' }),
      /--format applies to printing/);
  });

test(
  'RQ206: diagram Target must name a supported file',
  async () =>
  {
    await using workspace =
      await createWorkspace();

    for (
      const target of [ 'out/graph.png',
                        'out/graph.md',
                        'out/graph.mmd#Diagram' ]
    ) {
      await workspace.writeText(
        'docs/From D.md',
        `${FROM_D}
## Output

- Target: ${target}
`);

      await assert.rejects(
        runDiagram(workspace),
        /"Target" ".+" must/);
    }
  });

test(
  'RQ124: diagram renders SVG with the Mermaid CLI',
  async () =>
  {
    await using workspace =
      await createWorkspace();

    await workspace.writeText(
      'docs/From D.md',
      `# From D

## Nodes

- Definitions: Module

## Root

- Artefacts: tools/d/mod.md
- Depth: 0

## Output

- Target: from-d.svg
`);

    await workspace.writeText(
      'tools/mmdc.js',
      `import fs from 'node:fs/promises';

const args = process.argv.slice(2);
const input = args[args.indexOf('-i') + 1];
const output = args[args.indexOf('-o') + 1];
const graph = await fs.readFile(input, 'utf8');

await fs.writeFile(output, '<svg><desc>' + graph + '</desc></svg>', 'utf8');
`);

    using env =
      new TmpEnv(
        { PART_MMDC_PATH:
            workspace.resolve(
              'tools/mmdc.js') });

    const svg =
      '<svg><desc>graph TD\n  ntools_d_mod_md["tools/d/mod.md"]</desc></svg>\n';

    await runDiagram(workspace);

    assert.equal(
      await workspace.readText(
        'docs/from-d.svg'),
      svg);

    assert.equal(
      (await runDiagram(
        workspace,
        { stdout: true,
          format: 'svg' })).stdout.toString(),
      svg);

    await assert.rejects(
      runDiagram(
        workspace,
        { check: true }),
      /--check cannot compare an SVG target/);
  });
