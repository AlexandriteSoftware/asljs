/*
### RL1

The first comment in the JS rule file should be multiline and include
the rule description exactly as it is in the definition file. See the example
below.
*/

import path
  from 'node:path';

/**
 * @type { import('asljs-part').RuleValidationFunction }
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
    `Rule File_RL1.validate(${fileName}): `;

  const match =
    artefact.name.match(
      /^(.+)_(\w+\d+)/);

  if (!match) { 
    return;
  }

  const definitionName =
    match[1];

  const ruleId =
    match[2];

  const ruleDefinition =
    await context.definitions
      .getDefinition(definitionName);

  if (!ruleDefinition) {
    return logAndThrowError(
      `Definition "${definitionName}" not found.`);
  }

  const rule =
    ruleDefinition.rules.find(
      item => item.id === ruleId);

  if (!rule) {
    return logAndThrowError(
      `Rule "${ruleId}" not found in definition "${definitionName}".`);
  }

  const inSync =
    await context.rules.isRuleInSync(
      ruleDefinition.name,
      rule.id);

  if (!inSync) {
    return logAndThrowError(
      `Rule script is not in sync with the definition rule.`);
  }

  return;

  /**
   * @param {string} message 
   */
  function logAndThrowError(
    message)
  {
    logger.trace(
      `${ctx}${message}`);

    throw new Error(
      message);
  }
}
