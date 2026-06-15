import { glob }
  from 'glob/raw';
import path
  from 'node:path';
import { ArtefactProvider }
  from '../providers/artefactProvider.js';
import { DefinitionProvider }
  from '../providers/definitionProvider.js';
import { RuleRunner }
  from '../ruleRunner.js';
import { filterDefinitions,
         filterRuleResults,
         formatCheckTable }
  from './inventory.js';

export async function execCheck(
  environment,
  options = { })
{
  const rootDirectory =
    environment.cwd;

  const definitionProvider =
    new DefinitionProvider(
      environment.logger,
      rootDirectory,
      environment.definitions);

  const allDefinitions =
    await definitionProvider.getDefinitions();

  const definitions =
    filterDefinitions(
      allDefinitions,
      options.checkDefinitions);

  const artefacts =
    new ArtefactProvider(
      environment.logger,
      rootDirectory,
      definitionProvider);

  let matchingPaths = null;

  if (options.pattern) {
    const files =
      await glob(
        options.pattern,
        {
          absolute: true,
          cwd: rootDirectory,
          dot: true,
          nodir: true,
        });

    matchingPaths =
      new Set(
        files.map(
          filePath =>
            path.resolve(
              rootDirectory,
              filePath)));
  }

  const results =
    [];

  let hasFailures = false;

  const ruleRunner =
    new RuleRunner(
      environment.logger);

  for (const definition of definitions) {
    const definitionArtefacts =
      await artefacts.getArtefacts(definition);

    const selectedArtefacts =
      definitionArtefacts.filter(
        artefact => {
          const artifactPath =
            artefact.path;

          return matchingPaths === null
                 || matchingPaths.has(artifactPath);
        });

    for (const artefact of selectedArtefacts) {
      const ruleResults =
        filterRuleResults(
          await ruleRunner.runRules(
            definition,
            artefact),
          definition,
          options.checkRules);

      for (const ruleResult of ruleResults) {
        const row =
          {
            path: artefact.relativePath,
            rule: `${definition.name}_${ruleResult.rule.id}`,
            passed: ruleResult.result === 'Ok',
            result: ruleResult.result === 'Ok'
              ? 'OK'
              : ruleResult.message,
          };

        hasFailures =
          hasFailures
          || !row.passed;

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

  environment.stdout.write(
    formatCheckTable(
      results));

  return {
    hasFailures
  };
}
