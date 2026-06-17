/*
RL10 - At least one test file has requirement ID in its content.
*/

import { readFile }
  from 'node:fs/promises';

/**
 * @type { import('../../src/rule-validation-function.js')
 *           .ruleValidationFunction }
 */
export async function validate(
  artefact,
  context)
{
  context.logger.trace(
    `Requirement_RL10.validate(${artefact.path})`);

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
    throw new Error(
      'Unit Test File definition not found.');
  }

  const testFileArtefacts =
    await context.artefacts
      .getArtefacts(
        unitTestFileDefinition);

  const testFiles =
    testFileArtefacts.map(
      item => item.path);

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
