/*
### RL1 - Rule File

Each rule in the definition file should have a corresponding rule file that
implements it. The rule file should be named
`<DefinitionName>_<RuleId>.<extension>`, for example, `Todo Item_R1.js`.
*/

/**
 * @type { import('../../src/rule-validation-function.js')
 *           .RuleValidationFunction }
 */
export async function validate(
  artefact,
  context)
{
  const definition =
    await context.definitions
      .fromFile(
        artefact.path);
  
  if (!definition) {
    return;
  }

  /** @type {string[]} */
  const missingRuleIds = [];

  for (const rule of definition.rules) {
    const ruleFile =
      await context.rules
        .resolveRuleFile(
          rule.id,
          definition.name,
          definition.path);

    if (!ruleFile) {
      missingRuleIds
        .push(
          rule.id);
    }
  }

  if (missingRuleIds.length === 0) {
    return;
  }

  const missingRulesText =
    missingRuleIds.join(', ');

  throw new Error(
    `Definition is missing rule files for: ${missingRulesText}.`);
}
