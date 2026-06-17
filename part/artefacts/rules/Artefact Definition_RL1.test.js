import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from '../../src/tmp-dir.js';
import { createLogger }
  from '../../src/logging.js';
import { ArtefactProvider }
  from '../../src/providers/artefact-provider.js';
import { DefinitionProvider }
  from '../../src/providers/definition-provider.js';
import { validate }
  from './Artefact Definition_RL1.js';

const logger =
  createLogger(
    { level: 'trace',
      enabled: false });

test(
  'Artefact Definition_RL1 passes when each declared rule file exists',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.mkdir('rules');

    workspace.writeText(
      'rules/Todo Item_RL1.js',
      'export async function validate() { }\n');

    workspace.writeText(
      'Todo Item.md',
      `# Todo Item

Definition.

## Location

- Pattern: \`Todo Items/*.md\`

## Rules

- RL1 - Must have a rule file.
`);

    const context =
      createContext(
        workspace);

    await assert.doesNotReject(
      async () =>
        await validate(
          { path: workspace.resolve('Todo Item.md'),
            name: 'Todo Item' },
          context));
  });

test(
  'Artefact Definition_RL1 fails when a declared rule file is missing',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Todo Item.md',
      `# Todo Item

Definition.

## Location

- Pattern: \`Todo Items/*.md\`

## Rules

- RL1 - Must have a rule file.
- RL2 - Must also have a second rule file.
`);

    const context =
      createContext(
        workspace);

    await assert.rejects(
      async () =>
        await validate(
          { path: workspace.resolve('Todo Item.md'),
            name: 'Todo Item' },
          context));
  });

/**
 * @param {TmpDir} workspace
 */
function createContext(
  workspace)
{
  const definitionProvider =
    new DefinitionProvider(
      logger,
      workspace.path);

  const artefactProvider =
    new ArtefactProvider(
      logger,
      workspace.path,
      definitionProvider);

  const context =
    {
      logger,
      definitions: definitionProvider,
      artefacts: artefactProvider
    };

  return context;
}
