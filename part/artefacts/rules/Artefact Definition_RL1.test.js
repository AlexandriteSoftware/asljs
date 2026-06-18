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

  workspace.mkdir('rules');

  if (withRuleFiles) {
    workspace.writeText(
      'rules/Todo Item_RL1.js',
      'export async function validate() { }\n');

    workspace.writeText(
      'rules/Todo Item_RL2.js',
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

  const context =
    createContext(
      workspace);

  const invocation =
    validate(
      { path: workspace.resolve('Todo Item.md'),
          name: 'Todo Item',
          basePath: workspace.path,
          relativePath: 'Todo Item.md' },
      context);

  if (withRuleFiles) {
    await assert.doesNotReject(
      invocation);
  } else {
    await assert.rejects(
      invocation);
  }
}

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
    { logger,
      definitions: definitionProvider,
      artefacts: artefactProvider };

  return context;
}
