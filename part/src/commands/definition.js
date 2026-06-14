import { loadDefinitions,
         formatDefinitionDetails,
         resolveDefinition,
         formatDefinitionTable }
  from './inventory.js';

export async function execDefinition(
  rootDirectory,
  options = {})
{
  const definitions =
    await loadDefinitions(
    rootDirectory,
    options);

  if (options.definitionTarget) {
    return formatDefinitionDetails(
      resolveDefinition(
        definitions,
        rootDirectory,
        options.definitionTarget),
      rootDirectory);
  }

  return formatDefinitionTable(
    rootDirectory,
    definitions);
}
