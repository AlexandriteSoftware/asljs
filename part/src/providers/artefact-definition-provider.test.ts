import test,
       { after }
  from 'node:test';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import { createPinoLoggerProvider }
  from '../logging/pino.js';
import { ArtefactDefinitionProvider }
  from './artefact-definition-provider.js';
import { tmpDirFactory }
  from '../tmpDir.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () => {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'RQ201: DefinitionProvider returns definition markdown files and excludes gitignored files',
  async () => {
    await using workspace =
      tmpDir();

    await workspace.mkdir('hidden');

    await workspace.writeText(
      '.gitignore',
      'hidden/\n');

    await workspace.writeText(
      'Todo Item.md',
      `# Todo Item

A todo item.

## Location

- Folders: Todo Items
`);

    await workspace.writeText(
      'Notes.md',
      `# Notes

This is not a PART definition.
`);

    await workspace.writeText(
      'hidden/Hidden Item.md',
      `# Hidden Item

Hidden definition.

## Location

- Folders: Hidden Items
`);

    const provider =
      new ArtefactDefinitionProvider(
        loggerProvider.getLogger('DefinitionProvider'),
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
  async () => {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'parts/Todo Item_R1.js',
      `export async function validate(artefact) {
  if (!artefact.dueDate || artefact.dueDate < '2030-01-01') {
    throw new Error('Due date must be in the future.');
  }
}
`);

    await workspace.writeText(
      'Todo Item.md',
      `# Todo Item

A todo item is a task that needs to be done.

## Properties

- Due date: when it needs to be done.

## Location

- Pattern: \`Todo Items/**/*.md\`
- Exclude: \`Todo Items/Templates/**/*.md\`
- GitIgnore

## Rules

- R1 Due date must be in the future.
`);

    const definitionProvider =
      new ArtefactDefinitionProvider(
        loggerProvider.getLogger('DefinitionProvider'),
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
      { patterns: [ 'Todo Items/**/*.md' ],
        exclude: [ 'Todo Items/Templates/**/*.md' ],
        filters: [ { name: 'GitIgnore' } ] });

    assert.deepEqual(
      definition.rules,
      [ { id: 'R1',
          definition: 'Todo Item',
          name: 'Todo Item_R1',
          description: 'Due date must be in the future.' } ]);
  });

test(
  'RQ203: Definition returns null for markdown files that do not match the definition format',
  async () => {
    await using workspace =
      tmpDir();

    const definitionPath =
      'Todo Item.md';

    await workspace.writeText(
      definitionPath,
      `# Different Name

This file should not be treated as a definition.
`);

    const definitionProvider =
      new ArtefactDefinitionProvider(
        loggerProvider.getLogger('DefinitionProvider'),
        workspace.path);

    const definition =
      await definitionProvider.loadDefinitionFromFile(
        workspace.resolve(definitionPath));

    assert.equal(
      definition,
      null);
  });
