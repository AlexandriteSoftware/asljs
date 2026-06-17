import path
  from 'node:path';
import { ArtefactProvider }
  from '../providers/artefact-provider.js';
import { DefinitionProvider }
  from '../providers/definition-provider.js';
import { toPosixPath }
  from '../formatting.js';
import { RuleRunner }
  from '../rule-runner.js';

/**
 * @typedef
 *   { import('./../environment.js')
 *       .Environment }
 *   Environment
 * @typedef
 *   { import('./../logging.js')
 *       .Logger }
 *   Logger
 */

/**
 * @param {Environment} environment 
 */
export async function execInventory(
  environment)
{
  const logger =
    environment.logger;

  logger.trace(
    `Inventory command: start`);

  const rootDirectory =
    environment.project;

  const definitionProvider =
    new DefinitionProvider(
      logger,
      environment.definitions);

  const artefactProvider =
    new ArtefactProvider(
      logger,
      rootDirectory,
      definitionProvider);

  const items =
    await collectInventoryItems(
      logger,
      rootDirectory,
      definitionProvider,
      artefactProvider);

  const table =
    formatInventoryTable(items);

  environment.stdout.write(
    `${table}\n`);
}

/**
 * @param {Logger} logger
 * @param {string} rootDirectory
 * @param {DefinitionProvider} definitionProvider
 * @param {ArtefactProvider} artefactProvider
 */
async function collectInventoryItems(
  logger,
  rootDirectory,
  definitionProvider,
  artefactProvider)
{
  logger.trace(
    `Inventory command: collecting items`);

  const artefactIndex =
    new Map();

  const definitions =
    await definitionProvider.getDefinitions();

  const ruleRunner =
    new RuleRunner(
      logger,
      definitionProvider,
      artefactProvider);

  logger.trace(
    `Inventory command: collecting items for ${definitions.length} definitions`);

  for (const definition of definitions) {
    logger.trace(
      `Inventory command: collecting items for definition "${definition.name}"`);

    const definitionArtefacts =
      await artefactProvider.getArtefacts(definition);

    logger.trace(
      `Inventory command: collected ${definitionArtefacts.length} artefacts for definition "${definition.name}"`);

    for (const artefact of definitionArtefacts) {
      const existingEntry =
        artefactIndex.get(
          artefact.relativePath)
        ?? { file: artefact.relativePath,
             definitions: [],
             rulesOk: true };

      const ruleResults =
        await ruleRunner.runRules(
          definition,
          artefact);

      const artifactResult =
        { file: artefact.relativePath,
          definition: definition.name,
          rulesOk:
            ruleResults.every(
              result => result.result === 'Ok') };

      existingEntry.definitions.push(
        { name: definition.name,
          orderKey: toPosixPath(
            path.relative(
              rootDirectory,
              definition.path)) });

      existingEntry.rulesOk =
        existingEntry.rulesOk
        && artifactResult.rulesOk;

      artefactIndex.set(
        artefact.relativePath,
        existingEntry);
    }
  }

  const items =
    Array.from(
      artefactIndex.values(),
      (entry) => ({
        file: entry.file,
        definitions: entry.definitions
          .sort(
            (left, right) =>
              left.orderKey.localeCompare(
                right.orderKey)
              || left.name.localeCompare(
                right.name))
          .map(
            definition => definition.name)
          .join(','),
        rules: entry.rulesOk
          ? 'Ok'
          : 'Fail',
      }));

  items.sort(
    (left, right) => left.file.localeCompare(
      right.file));

  return items;
}

function formatInventoryTable(
  items)
{
  const rows =
    items.map(
      (item) => [item.file, item.definitions, item.rules]);

  const headers =
    ['Location', 'Definitions', 'Rules'];

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
