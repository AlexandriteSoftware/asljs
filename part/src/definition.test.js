import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import os
  from 'node:os';
import path
  from 'node:path';
import { mkdtemp,
         mkdir,
         writeFile }
  from 'node:fs/promises';
import { Definition }
  from './definition.js';

test(
  'RQ202: Definition loads markdown definition metadata and structured rules',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-definition-'));

    await mkdir(
      path.join(
        workspacePath,
        'rules'),
      { recursive: true });

    await writeFile(
      path.join(
        workspacePath,
        'rules',
        'Todo Item_R1.js'),
      `export async function validate(artefact) {
  if (!artefact.dueDate || artefact.dueDate < '2030-01-01') {
    throw new Error('Due date must be in the future.');
  }
}
`,
      'utf8',
    );

    await writeFile(
      path.join(
        workspacePath,
        'Todo Item.md'),
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
`,
      'utf8',
    );

    const definition =
      await Definition.load(
        path.join(
          workspacePath,
          'Todo Item.md'),
        {
          rootPath: workspacePath,
        });

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
        type: 'Folders',
        pattern: 'Todo Items',
        exclude: ['Todo Items/Templates'],
        gitIgnore: true,
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
            workspacePath,
            'rules',
            'Todo Item_R1.js'),
        },
      ]);
  });

test(
  'RQ203: Definition returns null for markdown files that do not match the definition format',
  async () => {
    const workspacePath =
      await mkdtemp(
        path.join(
          os.tmpdir(),
          'part-definition-invalid-'));

    const definitionPath =
      path.join(
        workspacePath,
        'Todo Item.md');

    await writeFile(
      definitionPath,
      `# Different Name

This file should not be treated as a definition.
`,
      'utf8',
    );

    const definition =
      await Definition.load(
        definitionPath,
        {
          rootPath: workspacePath,
        });

    assert.equal(
      definition,
      null);
  });