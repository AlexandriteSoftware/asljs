import { type Location }
  from 'asljs-locator';
import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { ArtefactDefinitionProperty }
  from '../model/artefact-definition-property.js';
import { ArtefactDefinitionRule }
  from '../model/artefact-definition-rule.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { providersFactory }
  from './providers.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'RQ201: tryParse parses definition with no locations',
  async (): Promise<void> =>
  {
    await using workspace =
      tmpDir();

    const { artefactDefinitionProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.path);

    const definition =
      artefactDefinitionProvider.tryParse(
        `# Todo Item

A todo item.

## Location
`,
        { path:
            workspace.resolve('Todo Item.md') });

    assert.ok(definition);
  });

test(
  'RQ201: DefinitionProvider returns definition markdown files and excludes gitignored files',
  async () =>
  {
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
      `# Meeting Notes

The heading does not match the file name, so this is not a definition.
`);

    await workspace.writeText(
      'Abstract.md',
      `# Abstract

A definition needs only the heading; Location is optional.
`);

    await workspace.writeText(
      'hidden/Hidden Item.md',
      `# Hidden Item

Hidden definition.

## Location

- Folders: Hidden Items
`);

    const { artefactDefinitionProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.path);

    const definitions =
      await artefactDefinitionProvider.getDefinitions();

    assert.deepEqual(
      definitions.map(
        definition => definition.name),
      [ 'Abstract',
        'Todo Item' ]);

    assert.deepEqual(
      definitions[0].locations,
      [ ]);

    assert.equal(
      definitions[0].source,
      'markdown');
  });

test(
  'RQ202: DefinitionProvider loads definition from markdown',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Todo Item.md',
      `# Todo Item

A todo item is a task that needs to be done.

## Properties

### Due

- Type: DateTime

When it needs to be done.

### Tags

- Type: String[]?

Optional labels.

## Location

- Pattern: \`Todo Items/**/*.md\`
- Exclude: \`Todo Items/Templates/**/*.md\`
- GitIgnore

## Rules

### R1

Due date must be in the future.
`);

    const { artefactDefinitionProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.path);

    const definition =
      await artefactDefinitionProvider.fromFile(
        workspace.resolve('Todo Item.md'));

    assert.ok(definition);

    assert.equal(
      definition.name,
      'Todo Item');

    assert.equal(
      definition.description,
      'A todo item is a task that needs to be done.');

    const expectedProperties: ArtefactDefinitionProperty[] =
      [ { name: 'Due',
          type: 'DateTime',
          isList: false,
          isNullable: false,
          description:
            'When it needs to be done.' },
        { name: 'Tags',
          type: 'String',
          isList: true,
          isNullable: true,
          description: 'Optional labels.' } ];

    assert.deepEqual(
      definition.properties,
      expectedProperties);

    const expectedLocations: Location[] =
      [ { pattern:
            'Todo Items/**/*.md',
          exclude:
            [ 'Todo Items/Templates/**/*.md' ],
          filters:
            [ { name: 'GitIgnore' } ] } ];

    assert.deepEqual(
      definition.locations,
      expectedLocations);

    const expectedRules: ArtefactDefinitionRule[] =
      [ { id: 'R1',
          definition: 'Todo Item',
          name: 'Todo Item_R1',
          heading: 'R1',
          content:
            '### R1\n\nDue date must be in the future.' } ];

    assert.deepEqual(
      definition.rules,
      expectedRules);
  });

test(
  'RQ202: DefinitionProvider loads definition without properties',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Todo Item.md',
      `# Todo Item

A todo item is a task that needs to be done.

## Location

- Pattern: Todo Items/**/*.md
`);

    const { artefactDefinitionProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.path);

    const definition =
      await artefactDefinitionProvider.fromFile(
        workspace.resolve('Todo Item.md'));

    assert.ok(definition);

    assert.deepEqual(
      definition.properties,
      [ ]);
  });

test(
  'RQ203: fromFile throws when content does not match the definition format',
  async () =>
  {
    await using workspace =
      tmpDir();

    const definitionPath = 'Todo Item.md';

    await workspace.writeText(
      definitionPath,
      `# Different Name

This file should not be treated as a definition.
`);

    const providers =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.path);

    const provider =
      providers.artefactDefinitionProvider;

    assert.rejects(
      async () =>
        await provider.fromFile(
          workspace.resolve(definitionPath)));
  });
