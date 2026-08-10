import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import test
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { createPinoLoggerProvider }
  from '../logging/pino.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execInventory }
  from './inventory.js';

const loggerProvider =
  createPinoLoggerProvider();

test.after(
  (): void =>
  {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

const execInventoryLogger =
  loggerProvider.getLogger(
    'execInventory');

test(
  'RQ121: inventory enumerates artefacts in Todo Item example',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Todo Item.md',
      `# Todo Item

A todo item is a task that needs to be done.

## Properties

- Due date: when it needs to be done.

## Location

- Pattern: Todo Items/*.md
`);

    const futureYear =
      new Date().getUTCFullYear() + 1;

    await workspace.writeText(
      'Todo Items/Buy milk.md',
      `# Buy milk

- Due date: ${futureYear}-07-01

I need to buy milk.
`);

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          loggerProvider });

    await execInventory(
      execInventoryLogger,
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| Location\s+\| Definitions\s+\|/);

    assert.match(
      environment.stdout.toString(),
      /\| Todo Items\/Buy milk\.md \| Todo Item\s+\|/);
  });

test(
  'RQ121: inventory can include definition properties in table output',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      `# Article

Markdown article.

## Properties

### PrimaryArticle

- Type: artefact

### Tags

- Type: string[]

## Location

- Pattern: articles/*.md
`);

    await workspace.writeText(
      'parts/Article.js',
      `export async function getData(artefact) {
  if (artefact.name === 'A') {
    return {
      primaryArticle: 'B.md',
      tags: ['one', 'two']
    };
  }

  return {
    primaryArticle: '',
    tags: []
  };
}
`);

    await workspace.writeText(
      'articles/A.md',
      '# A\n');

    await workspace.writeText(
      'articles/B.md',
      '# B\n');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          loggerProvider });

    await execInventory(
      execInventoryLogger,
      environment,
      { withProperties: true });

    assert.equal(
      environment.stderr.toString(),
      '');

    const output =
      environment.stdout.toString();

    assert.match(
      output,
      /\| Location\s+\| Definitions\s+\| Article\.PrimaryArticle\s+\| Article\.Tags\s+\|/);

    assert.match(
      output,
      /\| articles\/A\.md\s+\| Article\s+\| B\.md\s+\| one,two\s+\|/);
  });

test(
  'RQ121: inventory can include only selected properties in table output',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      `# Article

Markdown article.

## Properties

### PrimaryArticle

- Type: artefact

### Tags

- Type: string[]

## Location

- Pattern: articles/*.md
`);

    await workspace.writeText(
      'parts/Article.js',
      `export async function getData(artefact) {
  if (artefact.name === 'A') {
    return {
      primaryArticle: 'B.md',
      tags: ['one', 'two']
    };
  }

  return {
    primaryArticle: '',
    tags: []
  };
}
`);

    await workspace.writeText(
      'articles/A.md',
      '# A\n');

    await workspace.writeText(
      'articles/B.md',
      '# B\n');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          loggerProvider });

    await execInventory(
      execInventoryLogger,
      environment,
      { withProperties:
          [ 'Article.PrimaryArticle' ] });

    assert.equal(
      environment.stderr.toString(),
      '');

    const output =
      environment.stdout.toString();

    assert.match(
      output,
      /\| Location\s+\| Definitions\s+\| Article\.PrimaryArticle\s+\|/);

    assert.doesNotMatch(
      output,
      /Article\.Tags/);

    assert.match(
      output,
      /\| articles\/A\.md\s+\| Article\s+\| B\.md\s+\|/);
  });

test(
  'RQ121: inventory rejects unknown selected properties',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      `# Article

Markdown article.

## Properties

### PrimaryArticle

- Type: artefact

## Location

- Pattern: articles/*.md
`);

    await workspace.writeText(
      'articles/A.md',
      '# A\n');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          loggerProvider });

    await assert.rejects(
      async () =>
      {
        await execInventory(
          execInventoryLogger,
          environment,
          { withProperties:
              [ 'Article.Missing' ] });
      },
      /Unknown inventory property: Article\.Missing/);
  });

test(
  'RQ121: inventory can output json format with raw property values',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      `# Article

Markdown article.

## Properties

### PrimaryArticle

- Type: artefact

### RelatedArticles

- Type: artefact[]

### Metadata

- Type: object

## Location

- Pattern: articles/*.md
`);

    await workspace.writeText(
      'parts/Article.js',
      `export async function getData(artefact) {
  if (artefact.name === 'A') {
    return {
      primaryArticle: 'B.md',
      relatedArticles: ['C.md'],
      metadata: {
        priority: 3
      }
    };
  }

  return {
    primaryArticle: '',
    relatedArticles: [],
    metadata: {
      priority: 0
    }
  };
}
`);

    await workspace.writeText(
      'articles/A.md',
      '# A\n');

    await workspace.writeText(
      'articles/B.md',
      '# B\n');

    await workspace.writeText(
      'articles/C.md',
      '# C\n');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          loggerProvider });

    await execInventory(
      execInventoryLogger,
      environment,
      { format: 'json' });

    assert.equal(
      environment.stderr.toString(),
      '');

    const output =
      environment.stdout.toString();

    assert.match(
      output,
      /^\[\n  \{/);

    const parsed =
      JSON.parse(output) as Array<Record<string, unknown>>;

    const entry =
      parsed.find(
        item => item.location === 'articles/A.md');

    assert.ok(entry);

    const article =
      entry.Article as Record<string, unknown>;

    assert.equal(
      article.PrimaryArticle,
      'B.md');

    assert.deepEqual(
      article.RelatedArticles,
      [ 'C.md' ]);

    assert.deepEqual(
      article.Metadata,
      { priority: 3 });
  });

test(
  'RQ121: inventory resolves artefact locations relative to the definition file',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.mkdir(
      'artefacts/parts');

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Pattern: ../development/**/RQ*.md
`);

    await workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          loggerProvider });

    await execInventory(
      execInventoryLogger,
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| development\/RQ101 Example\.md \| Requirement\s+\|/);
  });

test(
  'RQ121: inventory lists all definitions applied to the same artefact',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      `# Article

Markdown article.

## Location

- Pattern: **/*.md
`);

    await workspace.writeText(
      'definitions/Artefact Definition.md',
      `# Artefact Definition

Definition file.

## Location

- Pattern: ../definitions/**/*.md
`);

    await workspace.writeText(
      'definitions/Requirement.md',
      '# Requirement\n');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          loggerProvider });

    await execInventory(
      execInventoryLogger,
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| definitions\/Requirement\.md\s+\| Artefact Definition,Article\s+\|/);
  });

test(
  'RQ121: inventory lists artefacts for selected definitions',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      `# Article

Markdown article.

## Location

- Pattern: **/*.md
`);

    await workspace.writeText(
      'definitions/Artefact Definition.md',
      `# Artefact Definition

Definition file.

## Location

- Pattern: ../definitions/**/*.md
`);

    await workspace.writeText(
      'definitions/Requirement.md',
      '# Requirement\n');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          loggerProvider });

    await execInventory(
      execInventoryLogger,
      environment,
      { inventoryDefinitions:
          [ 'Article' ] });

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| definitions\/Requirement\.md\s+\| Article\s+\|/);
  });

test(
  'RQ121: inventory respects Definitions parameter',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'definitions/Todo Item.md',
      `# Todo Item

A todo item is a task that needs to be done.

## Properties

- Due date: when it needs to be done.

## Location

- Pattern: ../Todo Items/*.md
`);

    await workspace.writeText(
      'Todo Items/Buy milk.md',
      `# Buy milk

- Due date: 2020-07-01
`);

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path });

    await execInventory(
      execInventoryLogger,
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| Todo Items\/Buy milk\.md \| Todo Item\s+\|/);
  });

test(
  'RQ206: inventory can render a diagram report',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Article.md',
      `# Article

Markdown article.

## Properties

### PrimaryArticle

- Type: artefact

The primary referenced article.

### RelatedArticles

- Type: artefact[]

The related articles.

## Location

- Pattern: articles/*.md
`);

    await workspace.writeText(
      'parts/Article.js',
      `export async function getData(artefact) {
  if (artefact.name === 'A') {
    return {
      primaryArticle: 'B.md',
      relatedArticles: ['C.md']
    };
  }

  return {
    primaryArticle: '',
    relatedArticles: []
  };
}
`);

    await workspace.writeText(
      'articles/A.md',
      '# A\n');

    await workspace.writeText(
      'articles/B.md',
      '# B\n');

    await workspace.writeText(
      'articles/C.md',
      '# C\n');

    await workspace.mkdir(
      'tools');

    await workspace.writeText(
      'tools/mmdc.js',
      `import fs from 'node:fs/promises';

const args = process.argv.slice(2);

let inputPath = '';
let outputPath = '';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '-i' && i + 1 < args.length) {
    inputPath = args[++i] ?? '';
    continue;
  }

  if (arg === '-o' && i + 1 < args.length) {
    outputPath = args[++i] ?? '';
    continue;
  }
}

if (inputPath === '' || outputPath === '') {
  process.stderr.write('Missing -i/-o arguments.\\n');
  process.exit(2);
}

const graph = await fs.readFile(inputPath, 'utf8');

const svg =
  [ '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">',
    '  <desc>'
    + graph
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
    + '</desc>',
    '</svg>' ].join('\\n');

await fs.writeFile(outputPath, svg, 'utf8');
`);

    const originalMmdcPath =
      process.env.PART_MMDC_PATH;

    process.env.PART_MMDC_PATH =
      workspace.resolve(
        'tools/mmdc.js');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          loggerProvider });

    try {
      await execInventory(
        execInventoryLogger,
        environment,
        { format: 'diagram' });
    } finally {
      process.env.PART_MMDC_PATH = originalMmdcPath;
    }

    assert.equal(
      environment.stderr.toString(),
      '');

    const output =
      environment.stdout.toString();

    assert.match(
      output,
      /<svg[\s\S]*<\/svg>/);

    assert.match(
      output,
      /graph TD/);

    assert.match(
      output,
      /articles\/A\.md/);

    assert.match(
      output,
      /articles\/B\.md/);

    assert.match(
      output,
      /articles\/C\.md/);

    assert.match(
      output,
      /narticles_A_md --&gt; narticles_B_md/);

    assert.match(
      output,
      /narticles_A_md --&gt; narticles_C_md/);
  });
