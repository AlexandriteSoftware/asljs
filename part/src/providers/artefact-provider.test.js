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
  from '../tmp-dir.js';

const logger =
  createLogger(
    { enabled: false,
      level: 'trace' });

test(
  'RQ204: ArtefactProvider returns gitignore-filtered artefacts for a definition',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'artefacts');

    workspace.mkdir(
      'development');

    workspace.mkdir(
      'development/visible');

    workspace.mkdir(
      'development/hidden');

    const requriementDefinitionContent =
      `# Requirement

Requirement.

## Location

- Files: ../development/**/RQ*.md
- GitIgnore
`;

  workspace.writeText(
    'artefacts/Requirement.md',
    requriementDefinitionContent);

  workspace.writeText(
    'development/.gitignore',
    'hidden');

  workspace.writeText(
    'development/visible/RQ101 Example.md',
    '# RQ101 Example\n');

  workspace.writeText(
    'development/hidden/RQ999 Hidden.md',
    '# RQ999 Hidden\n');

  workspace.writeText(
    'development/hidden/RQ999 Hidden.md',
    '# RQ999 Hidden\n');

  const definitions =
    new DefinitionProvider(
      logger,
      workspace.path);

  const [requirementDefinition] =
    await definitions.getDefinitions();
  
  const artefacts =
    new ArtefactProvider(
      logger,
      workspace.path);

  const requirementArtefacts =
    await artefacts.getArtefacts(
      requirementDefinition);

  assert.deepEqual(
    requirementArtefacts
      .map(
        artefact => artefact.relativePath)
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
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'artefacts');

    workspace.mkdir(
      'docs/specs');

    workspace.writeText(
      'artefacts/Article.md',
      `# Article

Article.

## Location

- Files: ../docs/**/*.md
`);

    workspace.writeText(
      'artefacts/Specification.md',
      `# Specification

Specification.

## Location

- Files: ../docs/specs/*.md
`);

  workspace.writeText(
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