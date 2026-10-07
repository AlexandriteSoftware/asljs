import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import test
  from 'node:test';
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
        [ workspace.resolve('artefacts') ]);

    const [requirementDefinition] =
      await artefactDefinitionProvider
      .getDefinitions();

    const requirementArtefacts =
      await artefactProvider.getArtefacts(
        [ requirementDefinition ]);

    assert.deepEqual(
      requirementArtefacts
        .map(
          artefact => artefact.location)
        .sort(),
      [ 'file:development/visible/RQ101 Example.md' ]);

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
        [ workspace.path ]);

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

- Pattern: ../../${
          path.basename(
            outsideDirectoryPath)
        }/*.md
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
          [ workspace.path ]);

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

- Pattern: ../../${
          path.basename(
            outsideDirectoryPath)
        }/
`);

      const { artefactDefinitionProvider, artefactProvider } =
        providersFactory(
          loggerProvider,
          workspace.path,
          [ workspace.path ]);

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

test(
  'RQ204: ArtefactProvider gives no artefacts to a definition without Location',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'Abstract.md',
      '# Abstract\n\nNo location.\n');

    const { artefactProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        [ workspace.path ]);

    assert.deepEqual(
      await artefactProvider.getArtefacts(),
      [ ]);
  });

test(
  'RQ204: ArtefactProvider uses a plugin locator instead of the Location section',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'definitions/Release.md',
      `# Release

A release.

## Location

- Pattern: ../docs/*.md
`);

    await workspace.writeText(
      'docs/Ignored.md',
      '# Ignored\n');

    await workspace.writeText(
      'plugin.js',
      `export default () => ({
  name: 'test',
  locate: {
    Release: async () => [ { location: 'test:release/1', name: '1' } ]
  }
});
`);

    const { artefactProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        [ workspace.resolve('definitions'),
          workspace.resolve('plugin.js') ]);

    assert.deepEqual(
      await artefactProvider.getArtefacts(),
      [ { location: 'test:release/1',
          name: '1',
          definitions:
            [ 'Release' ] } ]);

    assert.deepEqual(
      await artefactProvider.tryGetArtefact(
        'test:release/1'),
      { location: 'test:release/1',
        name: '1',
        definitions:
          [ 'Release' ] });

    assert.equal(
      await artefactProvider.tryGetArtefact(
        'docs/Ignored.md'),
      null);
  });

test(
  'RQ204: ArtefactProvider finds a file artefact by relative or absolute path',
  async () =>
  {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'definitions/Article.md',
      '# Article\n\nArticle.\n\n## Location\n\n- Pattern: ../docs/*.md\n');

    await workspace.writeText(
      'docs/A.md',
      '# A\n');

    const { artefactProvider } =
      providersFactory(
        loggerProvider,
        workspace.path,
        [ workspace.resolve('definitions') ]);

    const expected =
      { location: 'file:docs/A.md',
        name: 'A',
        definitions:
          [ 'Article' ] };

    assert.deepEqual(
      await artefactProvider.tryGetArtefact(
        'docs/A.md'),
      expected);

    assert.deepEqual(
      await artefactProvider.tryGetArtefact(
        workspace.resolve('docs/A.md')),
      expected);

    assert.deepEqual(
      await artefactProvider.tryGetArtefact(
        'file:docs/A.md'),
      expected);
  });
