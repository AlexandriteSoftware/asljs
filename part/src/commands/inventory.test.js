import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from '../tmp-dir.js';
import { createLogger }
  from '../logging.js';
import { createEnvironment }
  from '../environment.js';
import { execInventory }
  from './inventory.js';

const logger =
  createLogger(
    { enabled: false,
      level: 'trace' });

test(
  'RQ121: inventory enumerates artefacts in Todo Item example',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'Todo Items');

    workspace.writeText(
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

    workspace.writeText(
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
          logger });

    await execInventory(
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
  'RQ121: inventory resolves artefact locations relative to the definition file',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'artefacts/rules');

    workspace.mkdir(
      'development');

    workspace.writeText(
      'artefacts/Requirement.md',
      `# Requirement

A statement about the system that must be true.

## Location

- Pattern: ../development/**/RQ*.md
`);

    workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          logger });

    await execInventory(
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
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      `# Article

Markdown article.

## Location

- Pattern: **/*.md
`);

    workspace.writeText(
      'definitions/Artefact Definition.md',
      `# Artefact Definition

Definition file.

## Location

- Pattern: ../definitions/**/*.md
`);

    workspace.writeText(
      'definitions/Requirement.md',
      '# Requirement\n');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          logger });

    await execInventory(
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
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      `# Article

Markdown article.

## Location

- Pattern: **/*.md
`);

    workspace.writeText(
      'definitions/Artefact Definition.md',
      `# Artefact Definition

Definition file.

## Location

- Pattern: ../definitions/**/*.md
`);

    workspace.writeText(
      'definitions/Requirement.md',
      '# Requirement\n');

    const environment =
      createEnvironment(
        { cwd: workspace.path,
          definitions: workspace.path,
          project: workspace.path,
          logger });

    await execInventory(
      environment,
      { inventoryDefinitions: ['Article'] });

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| definitions\/Requirement\.md\s+\| Article\s+\|/);
  });

test(
  'RQ121: inventory respects Definitions parameter',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'definitions');

    workspace.mkdir(
      'Todo Items');

    workspace.mkdir(
      'part');

    workspace.writeText(
      'definitions/Todo Item.md',
      `# Todo Item

A todo item is a task that needs to be done.

## Properties

- Due date: when it needs to be done.

## Location

- Pattern: ../Todo Items/*.md
`);

    workspace.writeText(
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
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| Todo Items\/Buy milk\.md \| Todo Item\s+\|/);
  });
