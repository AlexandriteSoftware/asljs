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
import { createLogger }
  from '../logging.js';
import { DefinitionProvider }
  from './definitionProvider.js';

test(
  'RQ201: DefinitionProvider returns definition markdown files and excludes gitignored files',
  async () =>
{
  const workspacePath =
    await mkdtemp(
      path.join(
        os.tmpdir(),
        'part-provider-'));

  await mkdir(
    path.join(
      workspacePath,
      'hidden'),
    { recursive: true });

  await writeFile(
    path.join(
      workspacePath,
      '.gitignore'),
    'hidden/\n',
    'utf8');

  await writeFile(
    path.join(
      workspacePath,
      'Todo Item.md'),
    `# Todo Item

A todo item.

## Location

- Folders: Todo Items
`,
    'utf8',
  );

  await writeFile(
    path.join(
      workspacePath,
      'Notes.md'),
    `# Notes

This is not a PART definition.
`,
    'utf8',
  );

  await writeFile(
    path.join(
      workspacePath,
      'hidden',
      'Hidden Item.md'),
    `# Hidden Item

Hidden definition.

## Location

- Folders: Hidden Items
`,
    'utf8',
  );

  const provider =
    new DefinitionProvider(
      createLogger(),
      workspacePath);

  const definitions =
    await provider.getDefinitions();

  assert.equal(
    definitions.length,
    1);

  assert.equal(
    definitions[0].name,
    'Todo Item');
});