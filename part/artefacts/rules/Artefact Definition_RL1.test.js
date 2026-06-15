import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { createLogger }
  from '../../src/logging.js';
import { DefinitionProvider }
  from '../../src/providers/definitionProvider.js';
import { TmpDir }
  from '../../src/TmpDir.js';
import { validate }
  from './Artefact Definition_RL1.js';

test(
  'Artefact Definition_RL1 ignores markdown files that are not definitions',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Article.md',
      '# Different Name\n\nNot a definition.\n');

    const logger =
      createLogger();

    const definitionProvider =
      new DefinitionProvider(
        logger,
        workspace.path);
      
    await assert.doesNotReject(
      () =>
        validate(
          { path: workspace.resolve('Article.md') },
          { definitions: definitionProvider,
            logger: createLogger() }));
  });

test(
  'Artefact Definition_RL1 passes when each declared rule file exists',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    workspace.mkdir('rules');

    workspace.writeText(
      'rules/Todo Item_RL1.js',
      'export async function validate() {}\n');

    workspace.writeText(
      'Todo Item.md',
      `# Todo Item

Definition.

## Location

- Files: Todo Items/*.md

## Rules

- RL1 - Must have a rule file.
`);

    const logger =
      createLogger();

    const definitionProvider =
      new DefinitionProvider(
        logger,
        workspace.path);

    await assert.doesNotReject(
      () =>
        validate(
          { path: workspace.resolve('Todo Item.md') },
          { definitions: definitionProvider,
            logger: createLogger() }));
  });

test(
  'Artefact Definition_RL1 fails when a declared rule file is missing',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    workspace.writeText(
      'Todo Item.md',
      `# Todo Item

Definition.

## Location

- Files: Todo Items/*.md

## Rules

- RL1 - Must have a rule file.
- RL2 - Must also have a second rule file.
`);

    const logger =
      createLogger();

    const definitionProvider =
      new DefinitionProvider(
        logger,
        workspace.path);

    await assert.rejects(
      () =>
        validate(
          { path: workspace.resolve('Todo Item.md') },
          { definitions: definitionProvider,
            logger: createLogger() }),
      /Definition is missing rule files for: RL1, RL2\./);
  });