import { Logger }
  from 'asljs-logging';
import { getPropertyValue }
  from '../artefact-property-values.js';
import { Environment }
  from './../environment.js';
import { displayLocation }
  from '../location.js';
import { renderObjectsToMarkdownTable }
  from '../markdown-table.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { Artefact }
  from '../model/artefact.js';
import { ArtefactDataProvider }
  from '../providers/artefact-data-provider.js';

interface InventoryCommandOptions
{
  inventoryDefinitions?: string[];
  format?: string;
  withProperties?: true | string[];
}

interface InventoryEntry
{
  artefact: Artefact;
  definitions: string[];
}

interface InventoryEntryDefinitionData
{
  definition: ArtefactDefinition;
  data: unknown;
}

export async function execInventory(
    logger: Logger,
    environment: Environment,
    options: Partial<InventoryCommandOptions> = {}
  ): Promise<void>
{
  logger.trace(
    'Inventory command: start');

  const { artefactDataProvider, artefactDefinitionProvider, artefactProvider } =
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

  const entries =
    await collectInventoryEntries(
      logger,
      artefactProvider,
      filteredDefinitions);

  const format =
    getInventoryFormat(
      options.format);

  const definitionByName =
    new Map(
      filteredDefinitions.map(
        definition => [ definition.name,
                        definition ] as const));

  const inventoryData =
    await collectInventoryData(
      entries,
      definitionByName,
      artefactDataProvider);

  if (format === 'json') {
    const json =
      JSON.stringify(
        buildJsonInventory(
          entries,
          definitionByName,
          inventoryData),
        null,
        2);

    environment.stdout.write(
      `${json}\n`);

    return;
  }

  const items =
    buildTableInventory(
      entries,
      definitionByName,
      inventoryData,
      options.withProperties);

  const table =
    renderObjectsToMarkdownTable(
      items.columns,
      items.rows);

  environment.stdout.write(
    `${table}\n`);
}

async function collectInventoryEntries(
    logger: Logger,
    artefactProvider: {
    getArtefacts: (definitions?: ArtefactDefinition[]) => Promise<Artefact[]>;
  },
    filteredDefinitions: ArtefactDefinition[]
  ): Promise<InventoryEntry[]>
{
  const artefactIndex = new Map<string, InventoryEntry>();

  for (const definition of filteredDefinitions) {
    logger.trace(
      'Inventory command: collecting items for definition "%s"',
      definition.name);

    const definitionArtefacts =
      await artefactProvider.getArtefacts(
        [ definition ]);

    logger.trace(
      'Inventory command: collected %d artefacts for definition "%s"',
      definitionArtefacts.length,
      definition.name);

    for (const artefact of definitionArtefacts) {
      const existingEntry =
        artefactIndex.get(
          artefact.location);

      const entry =
        existingEntry
        ?? { artefact,
             definitions: [ ] };

      entry.definitions.push(
        definition.name);

      entry.definitions.sort(
        (left, right) => left.localeCompare(right));

      artefactIndex.set(
        artefact.location,
        entry);
    }
  }

  return Array.from(
    artefactIndex.values())
    .sort(
      (left, right) =>
        left.artefact.location.localeCompare(
          right.artefact.location));
}

function getInventoryFormat(
    format: string | undefined
  ): 'table' | 'json'
{
  const normalised =
    (format ?? 'table').trim();

  if (
    normalised === ''
    || normalised === 'table'
  ) {
    return 'table';
  }

  if (normalised === 'json') {
    return 'json';
  }

  throw new Error(
    `Unknown inventory format: ${format}`);
}

function buildTableInventory(
    entries: InventoryEntry[],
    definitionByName: Map<string, ArtefactDefinition>,
    inventoryData: Map<string, InventoryEntryDefinitionData[]>,
    withProperties: true | string[] | undefined
  ): {
  columns: { property: string; name: string; }[];
  rows: Record<string, string>[];
}
{
  const baseColumns =
    [ { property: 'location',
        name: 'Location' },
      { property: 'definitions',
        name: 'Definitions' } ];

  const propertyColumns =
    resolvePropertyColumns(
      definitionByName,
      withProperties);

  const includeProperties =
    propertyColumns.length > 0;

  const columns =
    [ ...baseColumns,
      ...propertyColumns.map(
        propertyColumn => ({ property: propertyColumn,
                             name: propertyColumn })) ];

  const rows =
    entries.map(
      (
          entry
        ) =>
      {
      const row: Record<string, string> =
        { location:
            displayLocation(
              entry.artefact.location),
          definitions:
            entry.definitions.join(',') };

      if (!includeProperties) {
        return row;
      }

      const dataByDefinition =
        inventoryData.get(
          entry.artefact.location)
        ?? [ ];

      for (const propertyColumn of propertyColumns) {
        const separatorIndex =
          propertyColumn.indexOf('.');

        const definitionName =
          propertyColumn.slice(
            0,
            separatorIndex);

        const propertyName =
          propertyColumn.slice(separatorIndex + 1);

        const definitionData =
          dataByDefinition.find(
            item => item.definition.name === definitionName);

        const value =
          definitionData
          ? getPropertyValue(
            definitionData.data,
            propertyName)
          : undefined;

        row[propertyColumn] =
          formatValueForTable(
            value);
      }

      return row;
    });

  return { columns,
           rows };
}

function resolvePropertyColumns(
    definitionByName: Map<string, ArtefactDefinition>,
    withProperties: true | string[] | undefined
  ): string[]
{
  if (withProperties === undefined) {
    return [ ];
  }

  const allColumns =
    collectPropertyColumns(
      definitionByName);

  if (withProperties === true) {
    return allColumns;
  }

  const columnSet =
    new Set(allColumns);

  for (const selectedColumn of withProperties) {
    if (!columnSet.has(selectedColumn)) {
      throw new Error(
        `Unknown inventory property: ${selectedColumn}`);
    }
  }

  return withProperties;
}

function buildJsonInventory(
    entries: InventoryEntry[],
    definitionByName: Map<string, ArtefactDefinition>,
    inventoryData: Map<string, InventoryEntryDefinitionData[]>
  ): Record<string, unknown>[]
{
  return entries.map(
    (
        entry
      ) =>
    {
      const row: Record<string, unknown> =
        { location:
            displayLocation(
              entry.artefact.location) };

      const dataByDefinition =
        inventoryData.get(
          entry.artefact.location)
        ?? [ ];

      for (const definitionName of entry.definitions) {
        const definition =
          definitionByName.get(
            definitionName);

        if (!definition) {
          continue;
        }

        const definitionData =
          dataByDefinition.find(
            item => item.definition.name === definitionName);

        const definitionObject: Record<string, unknown> = {};

        for (const property of definition.properties) {
          definitionObject[property.name] =
            definitionData
            ? getPropertyValue(
              definitionData.data,
              property.name)
            : null;
        }

        row[definitionName] = definitionObject;
      }

      return row;
    });
}

function collectPropertyColumns(
    definitionByName: Map<string, ArtefactDefinition>
  ): string[]
{
  const columns =
    Array.from(
      definitionByName.values())
    .flatMap(
      definition =>
        definition.properties.map(
          property => `${definition.name}.${property.name}`));

  return columns.sort(
    (left, right) => left.localeCompare(right));
}

function formatValueForTable(
    value: unknown
  ): string
{
  if (
    value === null
    || value === undefined
  ) {
    return '';
  }

  if (Array.isArray(value)) {
    return value
      .map(
        entry =>
          typeof entry === 'string'
            ? entry
            : JSON.stringify(entry))
      .join(',');
  }

  if (
    typeof value
    === 'string'
  ) {
    return value;
  }

  return JSON.stringify(value);
}

async function collectInventoryData(
    entries: InventoryEntry[],
    definitionByName: Map<string, ArtefactDefinition>,
    artefactDataProvider: ArtefactDataProvider
  ): Promise<Map<string, InventoryEntryDefinitionData[]>>
{
  const inventoryData = new Map<string, InventoryEntryDefinitionData[]>();

  for (const entry of entries) {
    const values: InventoryEntryDefinitionData[] = [ ];

    for (const definitionName of entry.definitions) {
      const definition =
        definitionByName.get(
          definitionName);

      if (!definition) {
        continue;
      }

      const data =
        await artefactDataProvider.tryGetArtefactData(
          entry.artefact,
          definition.name);

      values.push(
        { definition,
          data });
    }

    inventoryData.set(
      entry.artefact.location,
      values);
  }

  return inventoryData;
}
