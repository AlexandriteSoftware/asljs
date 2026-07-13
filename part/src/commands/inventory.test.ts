import assert
  from 'node:assert/strict';
import test,
       { after }
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

after(
  () =>
  {
    loggerProvider.dispose();
  }
);

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
`
    );

    const futureYear =
      new Date().getUTCFullYear() + 1;

    await workspace.writeText(
      'Todo Items/Buy milk.md',
      `# Buy milk

- Due date: ${futureYear}-07-01

I need to buy milk.
`
    );

    const environment =
      createEnvironment(
        {
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path,
        loggerProvider
      });

    await execInventory(
      execInventoryLogger,
      environment
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    assert.match(
      environment.stdout.toString(),
      /\| Location\s+\| Definitions\s+\|/
    );

    assert.match(
      environment.stdout.toString(),
      /\| Todo Items\/Buy milk\.md \| Todo Item\s+\|/
    );
  }
);

test(
  'RQ121: inventory resolves artefact locations relative to the definition file',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.mkdir(
      'artefacts/parts'
    );

    await workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Pattern: ../development/**/RQ*.md
`
    );

    await workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n'
    );

    const environment =
      createEnvironment(
        {
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path,
        loggerProvider
      });

    await execInventory(
      execInventoryLogger,
      environment
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    assert.match(
      environment.stdout.toString(),
      /\| development\/RQ101 Example\.md \| Requirement\s+\|/
    );
  }
);

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
`
    );

    await workspace.writeText(
      'definitions/Artefact Definition.md',
      `# Artefact Definition

Definition file.

## Location

- Pattern: ../definitions/**/*.md
`
    );

    await workspace.writeText(
      'definitions/Requirement.md',
      '# Requirement\n'
    );

    const environment =
      createEnvironment(
        {
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path,
        loggerProvider
      });

    await execInventory(
      execInventoryLogger,
      environment
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    assert.match(
      environment.stdout.toString(),
      /\| definitions\/Requirement\.md\s+\| Artefact Definition,Article\s+\|/
    );
  }
);

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
`
    );

    await workspace.writeText(
      'definitions/Artefact Definition.md',
      `# Artefact Definition

Definition file.

## Location

- Pattern: ../definitions/**/*.md
`
    );

    await workspace.writeText(
      'definitions/Requirement.md',
      '# Requirement\n'
    );

    const environment =
      createEnvironment(
        {
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path,
        loggerProvider
      });

    await execInventory(
      execInventoryLogger,
      environment,
      { inventoryDefinitions: ['Article'] }
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    assert.match(
      environment.stdout.toString(),
      /\| definitions\/Requirement\.md\s+\| Article\s+\|/
    );
  }
);

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
`
    );

    await workspace.writeText(
      'Todo Items/Buy milk.md',
      `# Buy milk

- Due date: 2020-07-01
`
    );

    const environment =
      createEnvironment(
        {
        cwd: workspace.path,
        definitions: workspace.path,
        project: workspace.path
      });

    await execInventory(
      execInventoryLogger,
      environment
    );

    assert.equal(
      environment.stderr.toString(),
      ''
    );

    assert.match(
      environment.stdout.toString(),
      /\| Todo Items\/Buy milk\.md \| Todo Item\s+\|/
    );
  }
);
