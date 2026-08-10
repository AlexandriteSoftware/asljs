import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import test
  from 'node:test';
import { createPinoLoggerProvider }
  from '../logging/pino.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { providersFactory }
  from './providers.js';

const loggerProvider =
  createPinoLoggerProvider();

test.after(
  () =>
  {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'RQ204: ArtefactProvider returns gitignore-filtered artefacts for a definition',
  async () =>
  {
    await using workspace =
      tmpDir();

    const requriementDefinitionContent =
      `# Requirement

Requirement.

## Location

- Pattern: ../development/**/RQ*.md
- GitIgnore
`;

    await workspace.writeText(
      'artefacts/Requirement.md',
      requriementDefinitionContent);

    await workspace.writeText(
      'development/.gitignore',
      'hidden');

    await workspace.writeText(
      'development/visible/RQ101 Example.md',
      '# RQ101 Example\n');

    await workspace.writeText(
      'development/hidden/RQ999 Hidden.md',
      '# RQ999 Hidden\n');

    await workspace.writeText(
      'development/hidden/RQ999 Hidden.md',
      '# RQ999 Hidden\n');

    const { artefactDefinitionProvider, artefactProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.path);

    const [requirementDefinition] =
      await artefactDefinitionProvider
      .getDefinitions();

    const requirementArtefacts =
      await artefactProvider.getArtefacts(
        [ requirementDefinition ]);

    assert.deepEqual(
      requirementArtefacts
        .map(
          artefact => artefact.relativePath)
        .sort(),
      [ 'development/visible/RQ101 Example.md' ]);

    assert.equal(
      await artefactProvider.isArtefactOfDefinition(
        'development/visible/RQ101 Example.md',
        requirementDefinition),
      true);

    assert.equal(
      await artefactProvider.isArtefactOfDefinition(
        'development/hidden/RQ999 Hidden.md',
        requirementDefinition),
      false);
  });

test(
  'RQ205: ArtefactProvider returns all matching definitions for an artefact',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'artefacts/Article.md',
      `# Article

Article.

## Location

- Pattern: ../docs/**/*.md
`);

    await workspace.writeText(
      'artefacts/Specification.md',
      `# Specification

Specification.

## Location

- Pattern: ../docs/specs/*.md
`);

    await workspace.writeText(
      'docs/specs/Example.md',
      '# Example\n');

    const { artefactProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.path);

    const matchingDefinitions =
      await artefactProvider
      .getDefinitionsForArtefact(
        'docs/specs/Example.md');

    assert.deepEqual(
      matchingDefinitions.map(
        definition => definition.name).sort(),
      [ 'Article',
        'Specification' ]);
  });

test(
  'RQ206: ArtefactProvider excludes file artefacts resolved outside project root',
  async () =>
  {
    await using workspace =
      tmpDir();

    const outsideDirectoryPath =
      path.resolve(
        workspace.path,
        '..',
        `${path.basename(workspace.path)}-outside-file`);

    await fs.mkdir(
      outsideDirectoryPath,
      { recursive: true });

    try {
      await workspace.writeText(
        'artefacts/External File.md',
        `# External File

External file.

## Location

- Pattern: ../../${path.basename(
  outsideDirectoryPath)}/*.md
`);

      const outsideFilePath =
        path.resolve(
          outsideDirectoryPath,
          'RQ501 Outside.md');

      await fs.writeFile(
        outsideFilePath,
        '# RQ501\n',
        'utf8');

      const { artefactDefinitionProvider, artefactProvider } =
        providersFactory(
          loggerProvider,
          workspace.path,
          workspace.path);

      const definitions =
        await artefactDefinitionProvider.getDefinitions();

      const [externalFileDefinition] =
        definitions.filter(
          definition => definition.name === 'External File');

      assert.ok(
        externalFileDefinition,
        'Expected External File definition to exist');

      const artefacts =
        await artefactProvider.getArtefacts(
          [ externalFileDefinition ]);

      assert.deepEqual(
        artefacts,
        [ ]);

      assert.equal(
        await artefactProvider.isArtefactOfDefinition(
          outsideFilePath,
          externalFileDefinition),
        false);
    } finally {
      await fs.rm(
        outsideDirectoryPath,
        { recursive: true,
          force: true });
    }
  });

test(
  'RQ206: ArtefactProvider excludes directory artefacts resolved outside project root',
  async () =>
  {
    await using workspace =
      tmpDir();

    const outsideDirectoryPath =
      path.resolve(
        workspace.path,
        '..',
        `${path.basename(workspace.path)}-outside-folder`);

    await fs.mkdir(
      outsideDirectoryPath,
      { recursive: true });

    try {
      await workspace.writeText(
        'artefacts/External Folder.md',
        `# External Folder

External folder.

## Location

- Pattern: ../../${path.basename(
  outsideDirectoryPath)}/
`);

      const { artefactDefinitionProvider, artefactProvider } =
        providersFactory(
          loggerProvider,
          workspace.path,
          workspace.path);

      const definitions =
        await artefactDefinitionProvider.getDefinitions();

      const [externalFolderDefinition] =
        definitions.filter(
          definition => definition.name === 'External Folder');

      assert.ok(
        externalFolderDefinition,
        'Expected External Folder definition to exist');

      const artefacts =
        await artefactProvider.getArtefacts(
          [ externalFolderDefinition ]);

      assert.deepEqual(
        artefacts,
        [ ]);

      assert.equal(
        await artefactProvider.isArtefactOfDefinition(
          outsideDirectoryPath,
          externalFolderDefinition),
        false);
    } finally {
      await fs.rm(
        outsideDirectoryPath,
        { recursive: true,
          force: true });
    }
  });
