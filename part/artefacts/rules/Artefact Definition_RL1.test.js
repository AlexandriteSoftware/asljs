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
import { validate }
  from './Artefact Definition_RL1.js';

test(
  'Artefact Definition_RL1 ignores markdown files that are not definitions',
  async () =>
  {
    const workspacePath = await mkdtemp(
  path.join(
    os.tmpdir(),
    'part-artefact-definition-rl1-'));
    const articlePath = path.join(
      workspacePath,
      'Article.md');

    await writeFile(
      articlePath,
      '# Different Name\n\nNot a definition.\n',
      'utf8');

    await assert.doesNotReject(
  () => validate(
    {},
    {
      artifactPath: articlePath,
      rootDirectory: workspacePath,
    }));
  });

test(
  'Artefact Definition_RL1 passes when each declared rule file exists',
  async () =>
{
  const workspacePath = await mkdtemp(
  path.join(
    os.tmpdir(),
    'part-artefact-definition-rl1-'));
  const rulesPath = path.join(
    workspacePath,
    'rules');
  const definitionPath = path.join(
    workspacePath,
    'Todo Item.md');

  await mkdir(
    rulesPath,
    { recursive: true });
  await writeFile(
    path.join(
      rulesPath,
      'Todo Item_RL1.js'),
    'export async function validate() {}\n',
    'utf8');
  await writeFile(
    definitionPath,
    `# Todo Item

Definition.

## Location

- Files: Todo Items/*.md

## Rules

- RL1 - Must have a rule file.
`,
    'utf8');

  await assert.doesNotReject(
  () => validate(
    {},
    {
    artifactPath: definitionPath,
    rootDirectory: workspacePath,
  }));
});

test(
  'Artefact Definition_RL1 fails when a declared rule file is missing',
  async () =>
{
  const workspacePath = await mkdtemp(
  path.join(
    os.tmpdir(),
    'part-artefact-definition-rl1-'));
  const definitionPath = path.join(
    workspacePath,
    'Todo Item.md');

  await writeFile(
    definitionPath,
    `# Todo Item

Definition.

## Location

- Files: Todo Items/*.md

## Rules

- RL1 - Must have a rule file.
- RL2 - Must also have a second rule file.
`,
    'utf8');

  await assert.rejects(
    () => validate(
      {},
      {
      artifactPath: definitionPath,
      rootDirectory: workspacePath,
    }),
    /Definition is missing rule files for: RL1, RL2\./);
});