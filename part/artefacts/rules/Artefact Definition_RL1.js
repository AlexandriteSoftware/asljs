/*
- RL1 - Each rule in the definition file should have a corresponding rule file
  that implements it. The rule file should be named
  `<DefinitionName>_<RuleId>.<extension>`, for example, `Todo Item_R1.js`.
*/

export async function validate(
  artefact,
  context)
{
  const definition =
    await context.definitions
      .loadDefinitionFromFile(
        artefact.path);
  
  if (!definition) {
    return;
  }
  
  const missingRuleIds =
    definition.rules
      .filter(
        rule => !rule.absoluteFilePath)
      .map(
        rule => rule.id);
    
  if (missingRuleIds.length === 0) {
    return;
  }

  const missingRulesText =
    missingRuleIds.join(', ');

  throw new Error(
    `Definition is missing rule files for: ${missingRulesText}.`);
}