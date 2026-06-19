import path
  from 'node:path';
import { glob }
  from 'glob/raw';
import { ArtefactProvider }
  from '../providers/artefact-provider.js';
import { DefinitionProvider }
  from '../providers/definition-provider.js';
import { toPosixPath }
  from '../formatting.js';
import { renderObjectsToMarkdownTable }
  from '../markdown-table.js';
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
 * @typedef {Object} CheckCommandOptions
 * @property {string} [pattern]
 * @property {string[]} [checkDefinitions]
 * @property {string[]} [checkRules]
 * @property {boolean} [withPositives]
 */

/**
 * @param {Environment} environment 
 * @param {Partial<CheckCommandOptions>} options 
 */
export async function execCheck(
  environment,
  options = { })
{
  const logger =
    environment.logger;

  const localLogger =
    logger.scope(
      { instanceId: 'execCheck' });

  localLogger.trace(
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

  localLogger.trace(
    `Check command: found ${definitions.length} definitions`);

  const filteredDefinitions =
    filterDefinitions(
      definitions,
      options.checkDefinitions);

  localLogger.trace(
    `Check command: list of definitions after filtering ${
      JSON.stringify(
        filteredDefinitions.map(
          definition => definition.name))
    }`);

  const rules =
    filteredDefinitions
      .flatMap(
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

  const selectedDefinitionNames =
    selectedDefinitions.map(
      definition => definition.name);

  localLogger.trace(
    `Check command: found ${
      JSON.stringify(
        selectedDefinitionNames)
    } definitions`);

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
    localLogger.trace(
      `Check command: using pattern=${options.pattern}`);

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

      const artefact =
        await artefactProvider.tryGetArtefact(
          artefactPath);

      if (artefact === null) {
        continue;
      }

      artefacts.push(artefact);

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
          [ definition ]);

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

  localLogger.trace(
    `Check command: found ${artefacts.length} artefact(s) to check`);

  localLogger.trace(
    `Check command: found ${selectedRules.length} rule(s) to apply`);

  const results = [];

  let hasFailures = false;

  const ruleRunner =
    new RuleRunner(
      logger,
      definitionProvider,
      artefactProvider);

  for (const artefact of artefacts) {
    for (const rule of selectedRules) {
      const artefactDefinitionNames =
        definitionNamesForArtefact[artefact.path]
        ?? [ ];

      const applicable =
        artefactDefinitionNames.includes(
          rule.definition);

      localLogger.trace(
        `Check command: checking artefact "${artefact.path}" against rule "${rule.name}" (applicable=${applicable})`);

      if (!applicable) {
        continue;
      }

      const ruleResult =
        await ruleRunner.runRule(
          rule,
          artefact);

      const relativePath =
        toPosixPath(
          path.relative(
            options.pattern
              ? environment.cwd
              : environment.project,
            artefact.path));

      const isOk =
        ruleResult.result === 'Ok';

      const row =
        { location: relativePath,
          rule: `${rule.name}`,
          result:
            isOk
              ? 'OK'
              : ruleResult.message };

      hasFailures =
        hasFailures
        || !isOk;

      if (
        !options.withPositives
        && isOk)
      {
        continue;
      }

      results.push(row);
    }
  }

  results.sort(
    (left, right) => {
      const pathCompare =
        left.location.localeCompare(
          right.location);

      if (pathCompare !== 0) {
        return pathCompare;
      }

      return left.rule
        .localeCompare(
          right.rule);
    });

  const table =
    renderObjectsToMarkdownTable(
      [ { property: 'location', name: 'Location' },
        { property: 'rule', name: 'Rule' },
        { property: 'result', name: 'Result' } ],
      results );

  environment.stdout
    .write(
      table);
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
