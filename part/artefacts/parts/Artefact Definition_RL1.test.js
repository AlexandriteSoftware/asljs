import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from '../../src/tmp-dir.js';
import { createLogger }
  from '../../src/logging.js';
import { createRuleValidationContext }
  from '../../src/rule-validation-function.js';
import { validate }
  from './Artefact Definition_RL1.js';

const logger =
  createLogger(
    { level: 'trace',
      enabled: false });

test(
  'Artefact Definition_RL1 checks declared rule file exists',
  async context =>
    checkDeclaredRulesTest(
      context,
      true));

test(
  'Artefact Definition_RL1 fails when a declared rule file is missing',
  async context =>
    checkDeclaredRulesTest(
      context,
      false));

/**
 * 
 * @param {test.TestContext} testContext 
 * @param {boolean} withRuleFiles 
 */
async function checkDeclaredRulesTest(
  testContext,
  withRuleFiles)
{
  const workspace =
    new TmpDir(
      logger);

  testContext.after(
    () => workspace.cleanup());

  if (withRuleFiles) {
    workspace.writeText(
      'parts/Todo Item_RL1.js',
      'export async function validate() { }\n');

    workspace.writeText(
      'parts/Todo Item_RL2.js',
      'export async function validate() { }\n');
  }

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

  workspace.writeText(
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
      logger,
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
