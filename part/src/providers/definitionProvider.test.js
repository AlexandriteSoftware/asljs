import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import { createLogger }
  from '../logging.js';
import { TmpDir }
  from '../tmpDir.js';
import { DefinitionProvider }
  from './definitionProvider.js';

test(
  'RQ201: DefinitionProvider returns definition markdown files and excludes gitignored files',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    workspace.mkdir('hidden');

    workspace.writeText(
      '.gitignore',
      'hidden/\n');

    workspace.writeText(
      'Todo Item.md',
      `# Todo Item

A todo item.

## Location

- Folders: Todo Items
`);

    workspace.writeText(
      'Notes.md',
      `# Notes

This is not a PART definition.
`);

    workspace.writeText(
      'hidden/Hidden Item.md',
      `# Hidden Item

Hidden definition.

## Location

- Folders: Hidden Items
`);

    const provider =
      new DefinitionProvider(
        createLogger(),
        workspace.path);

    const definitions =
      await provider.getDefinitions();

    assert.equal(
      definitions.length,
      1);

    assert.equal(
      definitions[0].name,
      'Todo Item');
  });

test(
  'RQ202: DefinitionProvider loads markdown definition metadata and structured rules',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    workspace.mkdir('rules');

    workspace.writeText(
      'rules/Todo Item_R1.js',
      `export async function validate(artefact) {
  if (!artefact.dueDate || artefact.dueDate < '2030-01-01') {
    throw new Error('Due date must be in the future.');
  }
}
`);

    workspace.writeText(
      'Todo Item.md',
      `# Todo Item

A todo item is a task that needs to be done.

## Properties

- Due date: when it needs to be done.

## Location

- Folders: Todo Items
- Exclude: Todo Items/Templates
- GitIgnore

## Rules

- R1 Due date must be in the future.
`);

    const definitionProvider =
      new DefinitionProvider(
        createLogger(),
        workspace.path);

    const definition =
      await definitionProvider.loadDefinitionFromFile(
        workspace.resolve('Todo Item.md'));

    assert.ok(definition);

    assert.equal(
      definition.name,
      'Todo Item');

    assert.equal(
      definition.description,
      'A todo item is a task that needs to be done.');

    assert.deepEqual(
      definition.location,
      {
        patterns: ['Todo Items'],
        exclude: ['Todo Items/Templates'],
        filters: [{ name: 'GitIgnore' }],
      });

    assert.deepEqual(
      definition.properties,
      {
        dueDate: 'when it needs to be done.',
      });

    assert.equal(
      definition.ruleIds.length,
      1);

    assert.deepEqual(
      definition.rules,
      [
        {
          id: 'R1',
          description: 'Due date must be in the future.',
          filePath: 'rules/Todo Item_R1.js',
          absoluteFilePath: path.join(
            workspace.path,
            'rules',
            'Todo Item_R1.js'),
        },
      ]);
  });

test(
  'RQ203: Definition returns null for markdown files that do not match the definition format',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    const definitionPath =
      'Todo Item.md';

    workspace.writeText(
      definitionPath,
      `# Different Name

This file should not be treated as a definition.
`);

    const definitionProvider =
      new DefinitionProvider(
        createLogger(),
        workspace.path);

    const definition =
      await definitionProvider.loadDefinitionFromFile(
        workspace.resolve(definitionPath));

    assert.equal(
      definition,
      null);
  });
