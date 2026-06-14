import { glob }
  from 'glob/raw';
import path
  from 'node:path';
import { ArtefactProvider }
  from '../providers/artefactProvider.js';
import { runRules }
  from '../ruleRunner.js';
import { filterDefinitions,
         loadDefinitions,
         filterRuleResults,
         formatCheckTable }
  from './inventory.js';

export async function execCheck(
  rootDirectory,
  options = {})
{
  const definitions =
    filterDefinitions(
    await loadDefinitions(
      rootDirectory,
      options),
    options.definitionNames);

  const artefacts =
    new ArtefactProvider(rootDirectory, definitions);

  const matchingPaths =
    options.pattern
    ? new Set((await glob(
      options.pattern,
      {
        absolute: true,
        cwd: rootDirectory,
        dot: true,
        nodir: true,
      })).map(
        (filePath) => path.resolve(filePath)))
    : null;

  const results =
    [];

  let hasFailures = false;

  for (const definition of definitions) {
    const definitionArtefacts =
      await artefacts.getArtefacts(definition);

    const selectedArtefacts =
      definitionArtefacts.filter(
      (artefact) => {
        const artifactPath =
          path.resolve(
          rootDirectory,
          artefact.file);

        return matchingPaths === null || matchingPaths.has(artifactPath);
      });

    for (const artefact of selectedArtefacts) {
      const artifactPath =
        path.resolve(
        rootDirectory,
        artefact.file);

      const ruleResults =
        filterRuleResults(
        await runRules(
          definition,
          artefact,
          {
            artifactPath,
            artefacts,
            rootDirectory,
          }),
        definition,
        options.ruleNames);

      for (const ruleResult of ruleResults) {
        const row =
          {
          path: artefact.file,
          rule: `${definition.name}_${ruleResult.rule.id}`,
          passed: ruleResult.result === 'Ok',
          result: ruleResult.result === 'Ok'
            ? 'OK'
            : ruleResult.message,
        };

        hasFailures = hasFailures || !row.passed;

        if (!options.withPositives && row.passed) {
          continue;
        }

        results.push(row);
      }
    }
  }

  results.sort(
    (left, right) => {
      const pathCompare =
        left.path.localeCompare(
        right.path);

      if (pathCompare !== 0) {
        return pathCompare;
      }

      return left.rule.localeCompare(
        right.rule);
    });

  return {
    report: formatCheckTable(results),
    hasFailures,
  };
}
