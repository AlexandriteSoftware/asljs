/*
RL1 - Each rule in the definition file should have a corresponding rule file that implements it. The rule file should be named <DefinitionName>_<RuleId>.<extension>, for example, Todo Item_R1.js.
*/

import { Definition }
  from '../../src/definition.js';

export async function validate(
  artefact,
  context)
{
  const definition =
    await Definition.load(
      context.artifactPath,
      { rootPath: context.rootDirectory });
  
  if (!definition) {
    return;
  }
  
  const missingRuleIds =
    definition.rules
      .filter((rule) => !rule.absoluteFilePath)
      .map((rule) => rule.id);
    
  if (missingRuleIds.length === 0) {
    return;
  }
  
  throw new Error(
    `Definition is missing rule files for: ${missingRuleIds.join(', ')}.`);
}