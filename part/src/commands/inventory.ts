import { Environment }
  from './../environment.js';
import { Logger }
  from '../logging/logging.js';
import { renderObjectsToMarkdownTable }
  from '../markdown-table.js';

interface InventoryCommandOptions
{
  inventoryDefinitions?: string[];
}

interface InventoryItem
{
  location: string;
  definitions: string;
}

export async function execInventory(
    logger: Logger,
    environment: Environment,
    options: Partial<InventoryCommandOptions> = {}
  ): Promise<void>
{
  logger.trace(
    'Inventory command: start');

  const { artefactDefinitionProvider, artefactProvider } =
    environment
    .getProviders();

  const definitions =
    await artefactDefinitionProvider.getDefinitions();

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

  const artefactIndex = new Map<
    string,
    { location: string; definitions: string[]; }
  >();

  for (const definition of filteredDefinitions) {
    logger.trace(
      'Inventory command: collecting items for definition "%s"',
      definition.name);

    const definitionArtefacts =
      await artefactProvider.getArtefacts(
        [definition]);

    logger.trace(
      'Inventory command: collected %d artefacts for definition "%s"',
      definitionArtefacts.length,
      definition.name);

    for (const artefact of definitionArtefacts) {
      const existingEntry =
        artefactIndex.get(
          artefact.relativePath);

      let entry;

      if (existingEntry === undefined) {
        entry = { location: artefact.relativePath, definitions: [] };
      } else {
        entry = existingEntry;
      }

      entry.definitions.push(
        definition.name);

      entry.definitions.sort(
        (left, right) => left.localeCompare(right));

      artefactIndex.set(
        artefact.relativePath,
        entry);
    }
  }

  const items: InventoryItem[] =
    Array.from(
      artefactIndex.values(),
      entry =>
    {
      return {
        location: entry.location,
        definitions: entry.definitions.join(',')
      };
    });

  items.sort(
    (left, right) =>
      left.location.localeCompare(
        right.location));

  const table =
    renderObjectsToMarkdownTable(
      [{ property: 'location', name: 'Location' }, {
      property: 'definitions',
      name: 'Definitions'
    }],
      items);

  environment.stdout.write(
    `${table}\n`);
}
