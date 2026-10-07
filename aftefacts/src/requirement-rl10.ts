/*
### RL10

At least one test file has requirement ID in its content.
*/

import { type RuleValidationFunction }
  from 'asljs-part';
import { readFile }
  from 'node:fs/promises';

export const validate: RuleValidationFunction =
  async (
      artefact,
      context
    ) =>
  {
  const logger = context.logger;

  const ctx =
    `Requirement_RL10.validate(${artefact.name}): `;

  const idMatch =
    artefact.name.match(/^(RQ\d+)/);

  if (!idMatch) {
    return;
  }

  const requirementId = idMatch[1];

  const unitTestFileDefinition =
    await context.definitions.findDefinition(
      'Unit Test File');

  if (!unitTestFileDefinition) {
    const message =
      'Unit Test File definition not found.';

    logger.trace(
      `${ctx}${message}`);

    throw new Error(
      message);
  }

  const testFiles =
    (await context.artefacts.getArtefacts(
      [ unitTestFileDefinition ]))
    .map(
      item => context.files.path(item));

  logger.trace(
    `${ctx}searching for requirement ID "${requirementId}" in ${testFiles.length} test file(s).`);

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
    `No test for "${requirementId}".`);
};
