import { ArtefactProvider }
  from '../providers/artefact-provider.js';
import { DefinitionProvider }
  from '../providers/definition-provider.js';
import { renderObjectsToMarkdownTable }
  from '../markdown-table.js';
import { Environment }
  from './../environment.js';

interface InventoryCommandOptions {
  inventoryDefinitions?: string[];
}

interface InventoryItem {
  location: string;
  definitions: string;
}

export async function execInventory(
    environment: Environment,
    options: Partial<InventoryCommandOptions> = { }
  ): Promise<void>
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

  const artefactIndex =
    new Map<string, { location: string; definitions: string[]; }>();

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

  const items: InventoryItem[] =
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
