import path
  from 'node:path';
import { glob }
  from 'glob/raw';
import { ArtefactProvider }
  from '../providers/artefact-provider.js';
import { DefinitionProvider }
  from '../providers/definition-provider.js';
import { RuleRunner }
  from '../rule-runner.js';

/**
 * @typedef
 *   { import('./../environment.js')
 *       .Environment }
 *   Environment
 * @typedef
 *   { import('./../artefact-definition.js')
 *       .ArtefactDefinition }
 *   ArtefactDefinition
 * @typedef
 *   { import('./../artefact-definition.js')
 *       .ArtefactDefinitionRule }
 *   ArtefactDefinitionRule
 * @typedef
 *   { import('./../artefact.js')
 *       .Artefact }
 *   Artefact
 */

/**
 * @param {Environment} environment 
 * @param {*} options 
 */
export async function execCheck(
  environment,
  options = { })
{
  const logger =
    environment.logger;

  logger.trace(
    `Check command: start with ${JSON.stringify(options)}`);

  const rootDirectory =
    environment.project;

  const definitionProvider =
    new DefinitionProvider(
      logger,
      rootDirectory,
      environment.definitions);

  const definitions =
    await definitionProvider.getDefinitions();

  const filteredDefinitions =
    filterDefinitions(
      definitions,
      options.checkDefinitions);

  const rules =
    filteredDefinitions.flatMap(
      definition =>
        definition.rules);

  const selectedRules =
    filterRules(
      rules,
      options.checkRules);

  const definitionsWithRules =
    new Set();

  for (const rule of selectedRules) {
    definitionsWithRules.add(
      rule.definition);
  }

  const selectedDefinitions =
    filterDefinitions(
      filteredDefinitions,
      [...definitionsWithRules]);
  
  const artefactProvider =
    new ArtefactProvider(
      logger,
      rootDirectory,
      definitionProvider);

  /** @type {Artefact[]} */
  const artefacts = [ ];

  /** @type {Record<string, string[]>} */
  const definitionNamesForArtefact = { };

  if (options.pattern) {
    const paths =
      await glob(
        options.pattern,
        {
          absolute: true,
          cwd: environment.cwd,
          dot: true,
          nodir: true,
        });

    for (const artefactPath of paths) {
      const artefactDefinitions =
        await artefactProvider
          .getDefinitionsForArtefact(
            artefactPath);

      if (artefactDefinitions.length === 0)
      {
        continue;
      }

      artefacts.push(
        { path: artefactPath });

      const artefactDefinitionNames =
        artefactDefinitions.map(
          definition => definition.name);

      definitionNamesForArtefact[artefactPath] =
        artefactDefinitionNames;
    }
  } else {
    const artefactPaths =
      new Set();

    for (const definition of selectedDefinitions) {
      const definitionArtefacts =
        await artefactProvider.getArtefacts(
          definition);

      for (const artefact of definitionArtefacts) {
        const added =
          artefactPaths.add(
            artefact.path);

        if (added) {
          artefacts.push(
            artefact);
        }

        const definitionNames =
          definitionNamesForArtefact[artefact.path] || [];

        definitionNames.push(
          definition.name);
          
        definitionNamesForArtefact[artefact.path] =
          definitionNames;
      }
    }
  }

  const results = [];

  let hasFailures = false;

  const ruleRunner =
    new RuleRunner(
      logger);

  for (const artefact of artefacts) {
    for (const rule of selectedRules) {
      const artefactDefinitionNames =
        definitionNamesForArtefact[artefact.path]
        ?? [ ];

      const applicable =
        artefactDefinitionNames.includes(
          rule.definition);

      if (applicable) {
        const ruleResult =
          await ruleRunner.runRule(
            rule,
            artefact);

        const relativePath =
          path.relative(
            options.pattern
              ? environment.cwd
              : environment.project,
            artefact.path);

        const row =
          {
            path: relativePath,
            rule: `${rule.name}`,
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

/**
 * @param {ArtefactDefinition[]} definitions 
 * @param {string[]} definitionNames 
 * @returns {ArtefactDefinition[]}
 */
export function filterDefinitions(
  definitions,
  definitionNames = [])
{
  if (definitionNames.length === 0) {
    return definitions;
  }

  const allowedNames =
    new Set(definitionNames);

  return definitions.filter(
    definition =>
      allowedNames.has(
        definition.name));
}

/**
 * @param {ArtefactDefinitionRule[]} rules 
 * @param {string[]} ruleNames 
 * @returns {ArtefactDefinitionRule[]}
 */
export function filterRules(
  rules,
  ruleNames = [])
{
  if (ruleNames.length === 0) {
    return rules;
  }

  const allowedNames =
    new Set(ruleNames);

  return rules.filter(
    rule =>
      allowedNames.has(
        rule.name));
}

export function formatCheckTable(
  items)
{
  const rows =
    items.map(
      (item) => [item.path, item.rule, item.result]);

  const headers =
    ['Path', 'Rule', 'Result'];

  const widths =
    headers.map(
      (header, index) => {
        const cellWidths =
          rows.map(
            (row) => row[index].length);

        return Math.max(
          header.length,
          ...cellWidths,
          3);
      });

  const lines =
    [];

  lines.push(
    formatRow(
      headers,
      widths));

  lines.push(
    formatRow(
      widths.map(
        (width) => '-'.repeat(width)),
      widths));

  for (const row of rows) {
    lines.push(
      formatRow(
        row,
        widths));
  }

  return lines.join('\n');
}

function formatRow(
  cells,
  widths)
{
  return `| ${cells.map(
    (cell, index) => cell.padEnd(
      widths[index])).join(' | ')} |`;
}
