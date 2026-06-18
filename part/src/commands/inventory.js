import { ArtefactProvider }
  from '../providers/artefact-provider.js';
import { DefinitionProvider }
  from '../providers/definition-provider.js';
import { renderObjectsToMarkdownTable }
  from '../markdown-table.js';

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
 * @typedef {Object} InventoryCommandOptions
 * @property {string[]} [inventoryDefinitions]
 */

/**
 * @typedef {Object} InventoryItem
 * @property {string} location
 * @property {string} definitions
 */

/**
 * @param {Environment} environment 
 * @param {Partial<InventoryCommandOptions>} options 
 */
export async function execInventory(
  environment,
  options = { })
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

  const definitions =
    await definitionProvider.getDefinitions();

  const definitionNames =
    definitions.map(
      definition => definition.name);

  const inventoryDefinitions =
    options.inventoryDefinitions === undefined
    || options.inventoryDefinitions.length === 0
      ? definitionNames
      : options.inventoryDefinitions;

  const filteredDefinitions =
    definitions.filter(
      definition =>
        inventoryDefinitions.includes(
          definition.name));

  /**
   * @type {Map<string, { location: string, definitions: string[] }>}
   */
  const artefactIndex =
    new Map();

  for (const definition of filteredDefinitions) {
    logger.trace(
      `Inventory command: collecting items for definition "${definition.name}"`);

    const definitionArtefacts =
      await artefactProvider.getArtefacts(
        [ definition ]);

    logger.trace(
      `Inventory command: collected ${definitionArtefacts.length} artefacts for definition "${definition.name}"`);

    for (const artefact of definitionArtefacts) {
      const existingEntry =
        artefactIndex.get(
          artefact.relativePath);

      let entry;

      if (existingEntry === undefined) {
        entry = { location: artefact.relativePath,
                  definitions: [ ] };
      } else {
        entry = existingEntry;
      }

      entry.definitions.push(
        definition.name);

      entry.definitions.sort(
        (left, right) =>
          left.localeCompare(right));

      artefactIndex.set(
        artefact.relativePath,
        entry);
    }
  }

  /** @type {InventoryItem[]} */
  const items =
    Array.from(
      artefactIndex.values(),
      entry => {
        return { location:
                   entry.location,
                 definitions:
                   entry.definitions.join(',') };
      });

  items.sort(
    (left, right) =>
      left.location.localeCompare(
        right.location));

  const table =
    renderObjectsToMarkdownTable(
      [ { property: 'location', name: 'Location' },
        { property: 'definitions', name: 'Definitions' } ],
      items);

  environment.stdout.write(
    `${table}\n`);
}
