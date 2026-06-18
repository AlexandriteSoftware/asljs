/*
RL10 - At least one test file has requirement ID in its content.
*/

import { readFile }
  from 'node:fs/promises';
import path
  from 'node:path';

/**
 * @type { import('../../src/rule-validation-function.js')
 *           .RuleValidationFunction }
 */
export async function validate(
  artefact,
  context)
{
  const logger =
    context.logger;

  const fileName =
    path.basename(
      artefact.path);

  const ctx =
    `Requirement_RL10.validate(${fileName}}): `;

  const idMatch =
    artefact.name.match(/^(RQ\d+)/);

  if (!idMatch) { 
    return;
  }

  const requirementId =
    idMatch[1];

  const definitions =
    await context.definitions
      .getDefinitions();

  const unitTestFileDefinition =
    definitions.find(
      item => item.name === 'Unit Test File');

  if (!unitTestFileDefinition) {
    const message =
      'Unit Test File definition not found.';

    logger.trace(
      `${ctx}${message}`);

    throw new Error(
      message);
  }

  const testFileArtefacts =
    await context.artefacts
      .getArtefacts(
        [ unitTestFileDefinition ]);

  const testFiles =
    testFileArtefacts
      .map(
        item => item.path);

  logger.trace(
    `${ctx}searching for requirement ID "${requirementId}" in test files.`);

  logger.trace(
    `${ctx}found ${testFiles.length} test file(s).`);

  for (const testFile of testFiles) {
    const content =
      await readFile(
        testFile,
        'utf8');

    if (content.includes(requirementId)) {
      return;
    }
  }

  throw new Error(
    `No test file found containing requirement ID "${requirementId}".`);
}
