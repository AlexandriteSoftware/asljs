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
import { Environment }
  from '../environment.js';
import { ArtefactDefinition,
         ArtefactDefinitionRule }
  from '../artefact-definition.js';
import { Artefact }
  from '../artefact.js';

export interface CheckCommandOptions {
  pattern?: string;
  checkDefinitions?: string[];
  checkRules?: string[];
  withPositives?: boolean;
}

export async function execCheck(
    environment: Environment,
    options: Partial<CheckCommandOptions> = { }
  ): Promise<void>
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

  const definitionsWithRules = new Set<string>();

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

  const artefacts: Artefact[] = [ ];

  /**
   * List of definition names for each artefact path, limited to the requested
   * definitions.
   */
  const definitionNamesForArtefact: Record<string, string[]> = { };

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
      const artefact =
        await artefactProvider.tryGetArtefact(
          artefactPath);

      if (artefact === null) {
        continue;
      }

      const artefactSelectedDefinitions =
        artefact.definitions
          .filter(
            definition =>
              selectedDefinitionNames.includes(definition));      

      if (artefactSelectedDefinitions.length === 0) {
        continue;
      }

      definitionNamesForArtefact[artefact.path] =
        artefactSelectedDefinitions;

      artefacts.push(artefact);
    }
  } else {
    const definitionArtefacts =
      await artefactProvider.getArtefacts(
        selectedDefinitions);

    artefacts.push(
      ...definitionArtefacts);

    for (const artefact of artefacts) {
      definitionNamesForArtefact[artefact.path] =
        artefact.definitions
          .filter(
            definition =>
              selectedDefinitionNames.includes(definition));
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

export function filterDefinitions(
    definitions: ArtefactDefinition[],
    definitionNames: string[] = []
  ): ArtefactDefinition[]
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

export function filterRules(
    rules: ArtefactDefinitionRule[],
    ruleNames: string[] = []
  ): ArtefactDefinitionRule[]
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
