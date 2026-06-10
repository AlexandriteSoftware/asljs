import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';

import { ArtefactProvider } from './artefactProvider.js';
import { DefinitionProvider } from './definitionProvider.js';

// See RQ204

test('ArtefactProvider returns gitignore-filtered artefacts for a definition', async () =>
{
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'part-artefacts-'));
  const definitionsPath = path.join(workspacePath, 'artefacts');

  await mkdir(definitionsPath, { recursive: true });
  await mkdir(path.join(workspacePath, 'development', 'visible'), { recursive: true });
  await mkdir(path.join(workspacePath, 'development', 'hidden'), { recursive: true });
  await writeFile(path.join(workspacePath, '.gitignore'), 'development/hidden/\n', 'utf8');
  await writeFile(
    path.join(definitionsPath, 'Requirement.md'),
    `# Requirement

Requirement.

## Location

- Files: ../development/**/RQ*.md
- GitIgnore
`,
    'utf8',
  );
  await writeFile(path.join(workspacePath, 'development', 'visible', 'RQ101 Example.md'), '# RQ101 Example\n', 'utf8');
  await writeFile(path.join(workspacePath, 'development', 'hidden', 'RQ999 Hidden.md'), '# RQ999 Hidden\n', 'utf8');

  const definitions = new DefinitionProvider(workspacePath);
  const [requirementDefinition] = await definitions.getDefinitions(definitionsPath);
  const artefacts = new ArtefactProvider(workspacePath, definitions);
  const requirementArtefacts = await artefacts.getArtefacts(requirementDefinition);

  assert.deepEqual(requirementArtefacts.map((artefact) => artefact.file), ['development/visible/RQ101 Example.md']);
  assert.equal(await artefacts.isArtefactOfDefinition('development/visible/RQ101 Example.md', requirementDefinition), true);
  assert.equal(await artefacts.isArtefactOfDefinition('development/hidden/RQ999 Hidden.md', requirementDefinition), false);
});

test('ArtefactProvider returns all matching definitions for an artefact', async () =>
{
  const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'part-artefacts-'));
  const definitionsPath = path.join(workspacePath, 'artefacts');

  await mkdir(definitionsPath, { recursive: true });
  await mkdir(path.join(workspacePath, 'docs', 'specs'), { recursive: true });
  await writeFile(
    path.join(definitionsPath, 'Article.md'),
    `# Article

Article.

## Location

- Files: ../docs/**/*.md
`,
    'utf8',
  );
  await writeFile(
    path.join(definitionsPath, 'Specification.md'),
    `# Specification

Specification.

## Location

- Files: ../docs/specs/*.md
`,
    'utf8',
  );
  await writeFile(path.join(workspacePath, 'docs', 'specs', 'Example.md'), '# Example\n', 'utf8');

  const definitions = new DefinitionProvider(workspacePath);
  const artefacts = new ArtefactProvider(workspacePath, definitions);
  const matchingDefinitions = await artefacts.getDefinitionsForArtefact('docs/specs/Example.md');

  assert.deepEqual(
    matchingDefinitions.map((definition) => definition.name).sort(),
    ['Article', 'Specification'],
  );
});