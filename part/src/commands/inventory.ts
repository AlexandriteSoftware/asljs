import { spawn }
  from 'node:child_process';
import { readFileSync }
  from 'node:fs';
import { existsSync }
  from 'node:fs';
import fs
  from 'node:fs/promises';
import { createRequire }
  from 'node:module';
import os
  from 'node:os';
import path
  from 'node:path';
import { Environment }
  from './../environment.js';
import { toPosixPath }
  from '../formatting.js';
import { Logger }
  from 'asljs-logging';
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

const require =
  createRequire(
    import.meta.url);

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

  if (format === 'diagram') {
    const svg =
      await buildInventoryDiagramSvg(
        environment.project,
        entries,
        filteredDefinitions,
        inventoryData);

    environment.stdout.write(
      `${svg}\n`);

    return;
  }

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
          artefact.relativePath);

      const entry =
        existingEntry
        ?? { artefact,
             definitions: [ ] };

      entry.definitions.push(
        definition.name);

      entry.definitions.sort(
        (left, right) => left.localeCompare(right));

      artefactIndex.set(
        artefact.relativePath,
        entry);
    }
  }

  return Array.from(
    artefactIndex.values())
    .sort(
      (left, right) =>
        left.artefact.relativePath.localeCompare(
          right.artefact.relativePath));
}

function getInventoryFormat(
    format: string | undefined
  ): 'table' | 'diagram' | 'json'
{
  const normalised =
    (format ?? 'table').trim();

  if (
    normalised === ''
    || normalised === 'table'
  ) {
    return 'table';
  }

  if (normalised === 'diagram') {
    return 'diagram';
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
            entry.artefact.relativePath,
          definitions:
            entry.definitions.join(',') };

      if (!includeProperties) {
        return row;
      }

      const dataByDefinition =
        inventoryData.get(
          entry.artefact.relativePath)
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
          ? getArtefactPropertyValueRaw(
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
            entry.artefact.relativePath };

      const dataByDefinition =
        inventoryData.get(
          entry.artefact.relativePath)
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
            ? getArtefactPropertyValueRaw(
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
      entry.artefact.relativePath,
      values);
  }

  return inventoryData;
}

async function buildInventoryDiagramSvg(
    projectPath: string,
    entries: InventoryEntry[],
    definitions: ArtefactDefinition[],
    inventoryData: Map<string, InventoryEntryDefinitionData[]>
  ): Promise<string>
{
  const nodes =
    entries.map(
      entry => ({ id:
                    entry.artefact.relativePath,
                  label:
                    entry.artefact.relativePath }));

  const nodeById =
    new Map(
      nodes.map(
        node => [ node.id,
                  node ] as const));

  const definitionByName =
    new Map(
      definitions.map(
        definition => [ definition.name,
                        definition ] as const));

  const edges =
    await collectDiagramEdges(
      projectPath,
      entries,
      definitionByName,
      inventoryData,
      nodeById);

  const mermaid =
    buildMermaidDiagram(
      nodes,
      edges);

  return renderMermaidToSvg(
    mermaid);
}

async function collectDiagramEdges(
    projectPath: string,
    entries: InventoryEntry[],
    definitionByName: Map<string, ArtefactDefinition>,
    inventoryData: Map<string, InventoryEntryDefinitionData[]>,
    nodeById: Map<string, { id: string; label: string; }>
  ): Promise<Array<{ from: string; to: string; }>>
{
  const edgeKeys = new Set<string>();

  for (const entry of entries) {
    for (const definitionName of entry.definitions) {
      const definition =
        definitionByName.get(
          definitionName);

      if (!definition) {
        continue;
      }

      const definitionData =
        inventoryData.get(
          entry.artefact.relativePath)
        ?.find(
          item => item.definition.name === definitionName);

      const artefactData =
        definitionData?.data;

      if (!artefactData) {
        continue;
      }

      for (const property of definition.properties) {
        if (!isArtefactPropertyType(property.type)) {
          continue;
        }

        const propertyValues =
          getArtefactPropertyValues(
            artefactData,
            property.name);

        for (const propertyValue of propertyValues) {
          const referencedPath =
            resolveReferencedArtefactPath(
              projectPath,
              entry.artefact.path,
              propertyValue);

          if (!referencedPath) {
            continue;
          }

          if (!nodeById.has(referencedPath)) {
            continue;
          }

          edgeKeys.add(
            `${entry.artefact.relativePath}=>${referencedPath}`);
        }
      }
    }
  }

  return Array.from(edgeKeys)
    .map(
      (
          edgeKey
        ) =>
      {
        const separatorIndex =
          edgeKey.indexOf('=>');

        return { from:
                   edgeKey.slice(
                     0,
                     separatorIndex),
                 to:
                   edgeKey.slice(separatorIndex + 2) };
      })
    .sort(
      (left, right) =>
        left.from.localeCompare(right.from)
        || left.to.localeCompare(right.to));
}

function isArtefactPropertyType(
    type: string
  ): boolean
{
  const normalised =
    type.trim().replaceAll(
      '`',
      '');

  return normalised === 'artefact'
    || normalised === 'artefact[]';
}

function getArtefactPropertyValues(
    data: unknown,
    propertyName: string
  ): string[]
{
  const value =
    getArtefactPropertyValueRaw(
      data,
      propertyName);

  if (
    typeof value
    === 'string'
  ) {
    return [ value ];
  }

  if (Array.isArray(value)) {
    return value
      .filter(
        entry => typeof entry === 'string')
      .map(
        entry => entry as string);
  }

  return [ ];
}

function getArtefactPropertyValueRaw(
    data: unknown,
    propertyName: string
  ): unknown
{
  if (
    !data
    || typeof data
       !== 'object'
  ) {
    return undefined;
  }

  const record =
    data as Record<string, unknown>;

  return record[propertyName]
    ?? record[toPropertyKey(propertyName)];
}

function resolveReferencedArtefactPath(
    projectPath: string,
    sourceArtefactPath: string,
    reference: string
  ): string | null
{
  const resolvedPath =
    path.resolve(
      path.dirname(sourceArtefactPath),
      reference);

  const relativePath =
    toPosixPath(
      path.relative(
        projectPath,
        resolvedPath));

  if (relativePath.startsWith('..')) {
    return null;
  }

  return relativePath;
}

function toPropertyKey(
    propertyName: string
  ): string
{
  const parts =
    propertyName.trim().split(
      /[^A-Za-z0-9]+/)
    .filter(
      part => part.length > 0);

  if (parts.length === 0) {
    return propertyName.trim();
  }

  return parts
    .map(
      (part, index) =>
        index === 0
          ? part.charAt(0).toLowerCase() + part.slice(1)
          : part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function buildMermaidDiagram(
    nodes: Array<{ id: string; label: string; }>,
    edges: Array<{ from: string; to: string; }>
  ): string
{
  const lines =
    [ 'graph TD' ];

  for (const node of nodes) {
    lines.push(
      `  ${toMermaidId(node.id)}["${escapeMermaid(node.label)}"]`);
  }

  for (const edge of edges) {
    lines.push(
      `  ${toMermaidId(edge.from)} --> ${toMermaidId(edge.to)}`);
  }

  return lines.join('\n');
}

function escapeMermaid(
    value: string
  ): string
{
  return value.replaceAll(
    '"',
    '\\"');
}

function toMermaidId(
    value: string
  ): string
{
  return `n${
    value.replace(
      /[^A-Za-z0-9_]/g,
      '_')
  }`;
}

async function renderMermaidToSvg(
    mermaidGraph: string
  ): Promise<string>
{
  const tempDirPath =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        'part-mermaid-'));

  const inputPath =
    path.join(
      tempDirPath,
      'inventory.mmd');

  const outputPath =
    path.join(
      tempDirPath,
      'inventory.svg');

  await fs.writeFile(
    inputPath,
    mermaidGraph,
    'utf8');

  try {
    await runMermaidCli(
      inputPath,
      outputPath);

    return await fs.readFile(
      outputPath,
      'utf8');
  } finally {
    await fs.rm(
      tempDirPath,
      { recursive: true,
        force: true });
  }
}

async function runMermaidCli(
    inputPath: string,
    outputPath: string
  ): Promise<void>
{
  const mmdcPath =
    resolveMermaidCliPath();

  const args =
    [ '-i',
      inputPath,
      '-o',
      outputPath,
      '-q' ];

  const command = process.execPath;

  const commandArgs =
    [ mmdcPath,
      ...args ];

  await new Promise<void>(
    (
        resolve,
        reject
      ) =>
    {
      const child =
        spawn(
          command,
          commandArgs,
          { stdio:
              [ 'ignore',
                'pipe',
                'pipe' ] });

      let stderr = '';

      child.stderr.on(
        'data',
        (
            chunk
          ) =>
        {
          stderr += String(chunk);
        });

      child.on(
        'error',
        (
            error
          ) =>
        {
          reject(
            new Error(
              `Failed to run mermaid CLI (mmdc): ${error}`));
        });

      child.on(
        'close',
        (
            code
          ) =>
        {
          if (code === 0) {
            resolve();
            return;
          }

          const details =
            stderr.trim();

          reject(
            new Error(
              details === ''
                ? `Mermaid CLI failed with exit code ${code}.`
                : `Mermaid CLI failed with exit code ${code}: ${details}`));
        });
    }
  );
}

function resolveMermaidCliPath(
  ): string
{
  const override =
    process.env.PART_MMDC_PATH?.trim();

  if (override) {
    return path.resolve(
      override);
  }

  const packageEntryPath =
    require.resolve(
      '@mermaid-js/mermaid-cli');

  const packageRoot =
    findPackageRoot(
      packageEntryPath);

  const packageJsonPath =
    path.join(
      packageRoot,
      'package.json');

  const packageJson =
    JSON.parse(
      readFileSync(
        packageJsonPath,
        'utf8')) as { bin?: string | Record<string, string>; };

  const binField = packageJson.bin;

  if (
    typeof binField
    === 'string'
  ) {
    return path.resolve(
      packageRoot,
      binField);
  }

  const mmdcRelativePath = binField?.mmdc;

  if (
    typeof mmdcRelativePath
    !== 'string'
    || mmdcRelativePath.trim() === ''
  ) {
    throw new Error(
      'Cannot resolve Mermaid CLI binary path from @mermaid-js/mermaid-cli package metadata.');
  }

  return path.resolve(
    packageRoot,
    mmdcRelativePath);
}

function findPackageRoot(
    entryPath: string
  ): string
{
  let currentPath =
    path.dirname(
      entryPath);

  while (true) {
    const packageJsonPath =
      path.join(
        currentPath,
        'package.json');

    if (existsSync(packageJsonPath)) {
      return currentPath;
    }

    const parentPath =
      path.dirname(
        currentPath);

    if (parentPath === currentPath) {
      throw new Error(
        `Cannot locate package root from path: ${entryPath}`);
    }

    currentPath = parentPath;
  }
}
