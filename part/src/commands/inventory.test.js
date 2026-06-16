import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from '../tmpDir.js';
import { createTestEnvironment }
  from '../testEnvironment.js';
import { execInventory }
  from './inventory.js';
import { execCheck }
  from './check.js';

test(
  'RQ121: inventory reports artefacts in Todo Item example as OK',
  async t => {
    const workspace =
      new TmpDir();

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

## Rules

- R1 Due date must be in the future.
`);

    workspace.writeText(
      'rules/Todo Item_R1.js',
      `import fsp from 'node:fs/promises';

export async function validate(artefact)
{
  const dueDate =
    new Date(
      await fsp.readFile(artefact.path, 'utf-8')
        .then(text => text.match(/- Due date: (.*)/)[1]));

  const now = new Date();

  if (dueDate <= now) {
    throw new Error('Due date must be in the future.');
  }
}
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
      createTestEnvironment(
        { cwd: workspace.path });

    await execInventory(
      environment);

    if (environment.stdout.toString().includes('Fail')) {
      await execCheck(
        environment,
        { target: 'Todo Items/Buy milk.md' });
    }

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| Location\s+\| Definitions\s+\| Rules \|/);

    assert.match(
      environment.stdout.toString(),
      /\| Todo Items\/Buy milk\.md \| Todo Item\s+\| Ok\s+\|/);

    assert.equal(
      environment.stderr.toString(),
      '');
  });

test(
  'RQ121: inventory resolves artefact locations relative to the definition file',
  async t => {
    const workspace =
      new TmpDir();

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

- Files: ../development/**/RQ*.md

## Rules

- RL10 - Requirement rule.
`);

    workspace.writeText(
      'artefacts/rules/Requirement_RL10.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'development/RQ101 Example.md',
      '# RQ101 Example\n');

    const environment =
      createTestEnvironment(
        { cwd: workspace.path });

    await execInventory(
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| development\/RQ101 Example\.md \| Requirement\s+\| \w+\s+\|/);
  });

test(
  'RQ121: inventory lists all definitions applied to the same artefact',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'definitions',
      'rules');

    workspace.mkdir(
      'part');

    workspace.writeText(
      'Article.md',
      `# Article

Markdown article.

## Location

- Files: **/*.md

## Rules

- RL10 - Article rule.
`);

    workspace.writeText(
      'definitions/Artefact Definition.md',
      `# Artefact Definition

Definition file.

## Location

- Files: ../definitions/**/*.md

## Rules

- RL10 - Definition rule.
`);

    workspace.writeText(
      'part/Article_RL10.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'definitions/rules/Artefact Definition_RL10.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'definitions/Requirement.md',
      '# Requirement\n');

    const environment =
      createTestEnvironment(
        { cwd: workspace.path });

    await execInventory(
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| definitions\/Requirement\.md\s+\| Article,Artefact Definition\s+\| \w+\s+\|/);
  });

test(
  'RQ121: inventory respects Definitions parameter and reports Fail when any rule fails',
  async t => {
    const workspace =
      new TmpDir();

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

## Rules

- R1 Due date must be in the future.
`);

    workspace.writeText(
      'part/TodoItem_R1.js',
      `export function validate(todoItem) {
  const now = new Date();
  const dueDate = new Date(todoItem.dueDate);
  if (dueDate <= now) {
    throw new Error('Due date must be in the future.');
  }
}
`);

    workspace.writeText(
      'Todo Items/Buy milk.md',
      `# Buy milk

- Due date: 2020-07-01
`);

    const environment =
      createTestEnvironment(
        { cwd: workspace.path,
          definition: workspace.resolve('definitions') });

    await execInventory(
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| Todo Items\/Buy milk\.md \| Todo Item\s+\| Fail\s+\|/);
  });
