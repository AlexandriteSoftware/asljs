import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { ArtefactProvider }
  from './artefact-provider.js';
import { DefinitionProvider }
  from './definition-provider.js';
import { createLogger }
  from '../logging.js';
import { TmpDir }
  from 'asljs-tmpdir';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

test(
  'RQ204: ArtefactProvider returns gitignore-filtered artefacts for a definition',
  async () => {
    await using workspace =
      new TmpDir(
        logger);

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

  const definitionsProvider =
    new DefinitionProvider(
      logger,
      workspace.path);

  const [requirementDefinition] =
    await definitionsProvider.getDefinitions();
  
  const artefacts =
    new ArtefactProvider(
      logger,
      workspace.path,
      definitionsProvider);

  const requirementArtefacts =
    await artefacts.getArtefacts(
      [ requirementDefinition ]);

  assert.deepEqual(
    requirementArtefacts
      .map(
        artefact =>
          artefact.relativePath)
      .sort(),
    ['development/visible/RQ101 Example.md']);

  assert.equal(
    await artefacts.isArtefactOfDefinition(
      'development/visible/RQ101 Example.md',
      requirementDefinition),
    true);

  assert.equal(
    await artefacts.isArtefactOfDefinition(
      'development/hidden/RQ999 Hidden.md',
      requirementDefinition),
    false);
});

test(
  'RQ205: ArtefactProvider returns all matching definitions for an artefact',
  async () => {
    await using workspace =
      new TmpDir(
        logger);

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

  const definitions =
    new DefinitionProvider(
      logger,
      workspace.path);

  const artefacts =
    new ArtefactProvider(
      logger,
      workspace.path,
      definitions);

  const matchingDefinitions =
    await artefacts.getDefinitionsForArtefact(
      'docs/specs/Example.md');

  assert.deepEqual(
    matchingDefinitions.map(
      (definition) => definition.name).sort(),
    ['Article', 'Specification']);
});