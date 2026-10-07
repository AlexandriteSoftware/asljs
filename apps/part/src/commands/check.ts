import { Logger }
  from 'asljs-logging';
import { minimatch }
  from 'minimatch';
import path
  from 'node:path';
import { Environment }
  from '../environment.js';
import { toPosixPath }
  from '../formatting.js';
import { displayLocation,
         FILE_SCHEME,
         hasScheme }
  from '../location.js';
import { renderObjectsToMarkdownTable }
  from '../markdown-table.js';
import { ArtefactDefinitionRule }
  from '../model/artefact-definition-rule.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { Artefact }
  from '../model/artefact.js';
import { RuleRunner,
         RuleRunResult }
  from '../rule-runner.js';

export interface CheckCommandOptions
{
  pattern?: string;
  checkDefinitions?: string[];
  checkRules?: string[];
  withPositives?: boolean;
  withSkipped?: boolean;
}

export async function execCheck(
    logger: Logger,
    environment: Environment,
    options: Partial<CheckCommandOptions> = {}
  ): Promise<void>
{
  logger.trace(
    'Check command: start with %s',
    JSON.stringify(options));

  const providers =
    environment.getProviders();

  const definitions =
    await providers.artefactDefinitionProvider
    .getDefinitions();

  logger.trace(
    'Check command: found %d definitions',
    definitions.length);

  const filteredDefinitions =
    filterDefinitions(
      definitions,
      options.checkDefinitions);

  logger.trace(
    'Check command: list of definitions after filtering %s',
    JSON.stringify(
      filteredDefinitions.map(
        definition => definition.name)));

  const rules =
    filteredDefinitions
    .flatMap(
      definition => definition.rules);

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
      [ ...definitionsWithRules ]);

  const selectedDefinitionNames =
    selectedDefinitions.map(
      definition => definition.name);

  logger.trace(
    'Check command: found %s definitions',
    JSON.stringify(
      selectedDefinitionNames));

  const artefacts =
    filterArtefactsByPattern(
      environment,
      await providers.artefactProvider.getArtefacts(
        selectedDefinitions),
      options.pattern);

  logger.trace(
    'Check command: found %d artefact(s) to check',
    artefacts.length);

  logger.trace(
    'Check command: found %d rule(s) to apply',
    selectedRules.length);

  const results = [ ];

  let hasFailures = false;

  const ruleRunner =
    new RuleRunner(
      logger,
      providers);

  for (const artefact of artefacts) {
    for (const rule of selectedRules) {
      const applicable =
        selectedDefinitionNames.includes(
          rule.definition)
        && artefact.definitions.includes(
          rule.definition);

      logger.trace(
        'Check command: checking artefact "%s" against rule "%s" (applicable=%s)',
        artefact.location,
        rule.name,
        applicable);

      if (!applicable) {
        continue;
      }

      const ruleResult =
        await ruleRunner.runRule(
          rule,
          artefact);

      hasFailures =
        hasFailures
        || ruleResult.result === 'Fail';

      if (
        ruleResult.result === 'Ok'
        && !options.withPositives
      ) {
        continue;
      }

      if (
        ruleResult.result === 'Skip'
        && !options.withSkipped
      ) {
        continue;
      }

      results.push(
        { location:
            displayLocation(
              artefact.location),
          rule: `${rule.name}`,
          result:
            formatResult(
              ruleResult) });
    }
  }

  if (hasFailures) {
    environment.exitCode = 1;
  }

  results.sort(
    (
        left,
        right
      ) =>
    {
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
      [ { property: 'location',
          name: 'Location' },
        { property: 'rule',
          name: 'Rule' },
        { property: 'result',
          name: 'Result' } ],
      results);

  environment.stdout
    .write(
      table);
}

export function filterDefinitions(
    definitions: ArtefactDefinition[],
    definitionNames: string[] = [ ]
  ): ArtefactDefinition[]
{
  if (definitionNames.length === 0) {
    return definitions;
  }

  const allowedNames =
    new Set(
      definitionNames);

  return definitions.filter(
    definition =>
      allowedNames.has(
        definition.name));
}

export function filterRules(
    rules: ArtefactDefinitionRule[],
    ruleNames: string[] = [ ]
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

/**
 * Keeps artefacts whose printed location matches the glob. A pattern with a
 * scheme matches full locations; any other pattern is a path relative to the
 * working directory and matches `file:` artefacts only.
 */
function filterArtefactsByPattern(
    environment: Environment,
    artefacts: Artefact[],
    pattern: string | undefined
  ): Artefact[]
{
  if (!pattern) {
    return artefacts;
  }

  if (hasScheme(pattern)) {
    return artefacts.filter(
      artefact =>
        minimatch(
          artefact.location,
          pattern,
          { dot: true }));
  }

  const projectPattern =
    toPosixPath(
      path.relative(
        environment.project,
        path.resolve(
          environment.cwd,
          pattern)));

  return artefacts.filter(
    artefact =>
      artefact.location.startsWith(FILE_SCHEME)
      && minimatch(
        displayLocation(
          artefact.location),
        projectPattern,
        { dot: true }));
}

function formatResult(
    result: RuleRunResult
  ): string
{
  switch (result.result) {
    case 'Ok':
      return 'OK';

    case 'Skip':
      return 'Skip';

    default:
      return result.message;
  }
}
