import test,
       { after }
  from 'node:test';
import assert
  from 'node:assert/strict';
import { createPinoLoggerProvider,
         createRuleValidationContext }
  from 'asljs-part';
import { tmpDirFactory }
  from './testing/tmpDir.js';
import { validate }
  from './Artefact Definition_RL1.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () => {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'Artefact Definition_RL1 checks declared rule file exists',
  async () =>
    await checkDeclaredRulesTest(true));

test(
  'Artefact Definition_RL1 fails when a declared rule file is missing',
  async () =>
    await checkDeclaredRulesTest(false));

/**
 * 
 * @param {boolean} withRuleFiles 
 */
async function checkDeclaredRulesTest(
  withRuleFiles)
{
  await using workspace =
    tmpDir();

  if (withRuleFiles) {
    await workspace.writeText(
      'parts/Todo Item_RL1.js',
      'export async function validate() { }\n');

    await workspace.writeText(
      'parts/Todo Item_RL2.js',
      'export async function validate() { }\n');
  }

  await workspace.writeText(
    'Todo Item.md',
    `# Todo Item

Definition.

## Location

- Pattern: \`Todo Items/*.md\`

## Rules

- RL1 - Must have a rule file.
- RL2 - Must also have a second rule file.
`);

  await workspace.writeText(
    'Artefact Definition.md',
    `# Artefact Definition

Definition.

## Location

- Pattern: \`/*.md\`

## Rules

- RL1 - Rule No. 1
`);

  const context =
    createRuleValidationContext(
      loggerProvider,
      workspace.path);

  const artefact =
    await context.artefacts.tryGetArtefact('Todo Item.md');

  if (!artefact) {
    throw new Error(
      'Failed to load artefact for test.');
  }

  const invocation =
    validate(
      artefact,
      context);

  if (withRuleFiles) {
    await assert.doesNotReject(
      invocation);
  } else {
    await assert.rejects(
      invocation);
  }
}
