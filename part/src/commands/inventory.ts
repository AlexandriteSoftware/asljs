import path
  from 'node:path';
import { Environment }
  from './../environment.js';
import { toPosixPath }
  from '../formatting.js';
import { Logger }
  from '../logging/logging.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { ArtefactDefinitionProperty }
  from '../model/artefact-definition-property.js';
import { Artefact }
  from '../model/artefact.js';
import { ArtefactDataProvider }
  from '../providers/artefact-data-provider.js';
import { renderObjectsToMarkdownTable }
  from '../markdown-table.js';

interface InventoryCommandOptions
{
  inventoryDefinitions?: string[];
  report?: string;
}

interface InventoryItem
{
  location: string;
  definitions: string;
}

interface InventoryEntry
{
  artefact: Artefact;
  definitions: string[];
}

export async function execInventory(
    logger: Logger,
    environment: Environment,
    options: Partial<InventoryCommandOptions> = {}
  ): Promise<void>
{
  logger.trace(
    'Inventory command: start');

  const { artefactDataProvider,
          artefactDefinitionProvider,
          artefactProvider } =
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

  const report =
    getInventoryReportFormat(
      options.report);

  if (report === 'diagram') {
    const svg =
      await buildInventoryDiagramSvg(
        environment.project,
        entries,
        filteredDefinitions,
        artefactDataProvider);

    environment.stdout.write(
      `${svg}\n`);

    return;
  }

  const items: InventoryItem[] =
    entries.map(
      (
          entry
        ) =>
      {
        return { location:
                   entry.artefact.relativePath,
                 definitions:
                   entry.definitions.join(',') };
      });

  const table =
    renderObjectsToMarkdownTable(
      [ { property: 'location',
          name: 'Location' },
        { property: 'definitions',
          name: 'Definitions' } ],
      items);

  environment.stdout.write(
    `${table}\n`);
}

async function collectInventoryEntries(
    logger: Logger,
    artefactProvider: { getArtefacts: (definitions?: ArtefactDefinition[]) => Promise<Artefact[]>; },
    filteredDefinitions: ArtefactDefinition[]
  ): Promise<InventoryEntry[]>
{
  const artefactIndex =
    new Map<string, InventoryEntry>();

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

function getInventoryReportFormat(
    report: string | undefined
  ): 'table' | 'diagram'
{
  const normalised =
    (report ?? 'table').trim();

  if (
    normalised === ''
    || normalised === 'table'
  ) {
    return 'table';
  }

  if (normalised === 'diagram') {
    return 'diagram';
  }

  throw new Error(
    `Unknown inventory report format: ${report}`);
}

async function buildInventoryDiagramSvg(
    projectPath: string,
    entries: InventoryEntry[],
    definitions: ArtefactDefinition[],
    artefactDataProvider: ArtefactDataProvider
  ): Promise<string>
{
  const nodes =
    entries.map(
      (entry, index) =>
        ({ id:
             entry.artefact.relativePath,
           label:
             entry.artefact.relativePath,
           y:
             24 + index * 88 }));

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
      artefactDataProvider,
      nodeById);

  const width = 520;

  const height =
    Math.max(
      120,
      40 + nodes.length * 88);

  const mermaid =
    buildMermaidDiagram(
      nodes,
      edges);

  const nodeSvg =
    nodes.map(
      node =>
        renderDiagramNode(
          node,
          width - 80))
    .join('\n');

  const edgeSvg =
    edges.map(
      edge =>
        renderDiagramEdge(
          edge,
          width - 80,
          nodeById))
    .join('\n');

  return [ `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Inventory diagram">`,
           `  <desc>${escapeXml(mermaid)}</desc>`,
           '  <defs>',
           '    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">',
           '      <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />',
           '    </marker>',
           '  </defs>',
           '  <style>',
           '    .node { fill: #f8fafc; stroke: #334155; stroke-width: 1.5; }',
           '    .label { fill: #0f172a; font: 14px sans-serif; }',
           '    .edge { fill: none; stroke: #64748b; stroke-width: 1.5; marker-end: url(#arrow); }',
           '  </style>',
           edgeSvg,
           nodeSvg,
           '</svg>' ].join('\n');
}

async function collectDiagramEdges(
    projectPath: string,
    entries: InventoryEntry[],
    definitionByName: Map<string, ArtefactDefinition>,
    artefactDataProvider: ArtefactDataProvider,
    nodeById: Map<string, { id: string; label: string; y: number; }>
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

      const artefactData =
        await artefactDataProvider.tryGetArtefactData(
          entry.artefact,
          definition.name);

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
  return type === 'artefact'
    || type === 'artefact[]';
}

function getArtefactPropertyValues(
    data: unknown,
    propertyName: string
  ): string[]
{
  if (
    !data
    || typeof data
       !== 'object'
  ) {
    return [ ];
  }

  const record =
    data as Record<string, unknown>;

  const value =
    record[propertyName]
    ?? record[toPropertyKey(propertyName)];

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
    nodes: Array<{ id: string; label: string; y: number; }>,
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

function renderDiagramNode(
    node: { id: string; label: string; y: number; },
    width: number
  ): string
{
  const x = 40;
  const height = 48;

  return [ `  <g transform="translate(${x}, ${node.y})">`,
           `    <rect class="node" width="${width}" height="${height}" rx="8" ry="8" />`,
           `    <text class="label" x="16" y="30">${escapeXml(node.label)}</text>`,
           '  </g>' ].join('\n');
}

function renderDiagramEdge(
    edge: { from: string; to: string; },
    width: number,
    nodeById: Map<string, { id: string; label: string; y: number; }>
  ): string
{
  const source =
    nodeById.get(edge.from);

  const target =
    nodeById.get(edge.to);

  if (
    !source
    || !target
  ) {
    return '';
  }

  const nodeHeight = 48;
  const sourceX = 40 + width;
  const targetX = 40;

  const sourceY =
    source.y + nodeHeight / 2;

  const targetY =
    target.y + nodeHeight / 2;

  return `  <path class="edge" d="M ${sourceX} ${sourceY} C ${sourceX + 40} ${sourceY}, ${targetX - 40} ${targetY}, ${targetX} ${targetY}" />`;
}

function escapeXml(
    value: string
  ): string
{
  return value
    .replaceAll(
      '&',
      '&amp;')
    .replaceAll(
      '<',
      '&lt;')
    .replaceAll(
      '>',
      '&gt;')
    .replaceAll(
      '"',
      '&quot;')
    .replaceAll(
      "'",
      '&apos;');
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
  return `n${value.replace(
    /[^A-Za-z0-9_]/g,
    '_')}`;
}
