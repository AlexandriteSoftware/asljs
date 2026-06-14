import path
  from 'node:path';
import { ArtefactProvider }
  from '../providers/artefactProvider.js';
import { DefinitionProvider }
  from '../providers/definitionProvider.js';
import { runRules }
  from '../ruleRunner.js';

export async function execInventory(
  environment,
  options = {})
{
  const rootDirectory =
    process.cwd();

  const definitions =
    await loadDefinitions(
      rootDirectory,
      options);

  const artefacts =
    new ArtefactProvider(rootDirectory, definitions);

  const items =
    await collectInventoryItems(
      rootDirectory,
      definitions,
      artefacts);

  const table =
    formatInventoryTable(items);

  environment.stdout.write(
    `${table}\n`);
}

export async function generateInventoryTable(
  rootDirectory,
  options = {})
{
  return execInventory(
    rootDirectory,
    options);
}

export async function loadDefinitions(
  rootDirectory,
  options)
{
  const provider =
    new DefinitionProvider(rootDirectory);

  const definitionsDirectory =
    options.definitionsPath
    ? path.resolve(
      rootDirectory,
      options.definitionsPath)
    : rootDirectory;

  const definitions =
    await provider.getDefinitions(
      definitionsDirectory);

  return definitions;
}

async function collectInventoryItems(
  rootDirectory,
  definitions,
  artefacts)
{
  const artefactIndex =
    new Map();

  for (const definition of definitions) {
    const definitionArtefacts =
      await artefacts.getArtefacts(definition);

    for (const artefact of definitionArtefacts) {
      const artifactPath =
        path.resolve(
          rootDirectory,
          artefact.file);

      if (path.resolve(artifactPath) === path.resolve(
        definition.definitionPath)) {
        continue;
      }

      const existingEntry =
        artefactIndex.get(
          artefact.file) ?? {
        file: artefact.file,
        definitions: [],
        rulesOk: true,
      };

      const artifactResult =
        await inspectArtifact(
          rootDirectory,
          definition,
          artefact,
          artefacts);

      existingEntry.definitions.push(
        {
        name: definition.name,
        orderKey: toPosixPath(
          path.relative(
            rootDirectory,
            definition.definitionPath)),
      });

      existingEntry.rulesOk = existingEntry.rulesOk && artifactResult.rulesOk;

      artefactIndex.set(
        artefact.file,
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
        (left, right) => left.orderKey.localeCompare(
          right.orderKey) || left.name.localeCompare(
            right.name))
      .map(
        (definition) => definition.name)
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

async function inspectArtifact(
  rootDirectory,
  definition,
  artefact,
  artefacts)
{
  const ruleResults =
    await runRules(
      definition,
      artefact,
      {
    artifactPath: path.resolve(
      rootDirectory,
      artefact.file),
    artefacts,
    rootDirectory,
  });

  return {
    file: artefact.file,
    definition: definition.name,
    rulesOk: ruleResults.every(
      (result) => result.result === 'Ok'),
  };
}

function formatInventoryTable(items)
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

export function formatDefinitionTable(
  rootDirectory,
  definitions)
{
  const rows =
    definitions.map(
      (definition) => [
    definition.name,
    toPosixPath(
      path.relative(
        rootDirectory,
        definition.definitionPath)),
  ]);

  const headers =
    ['Name', 'Location'];

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

export function formatDefinitionDetails(
  definition,
  rootDirectory)
{
  return serializeMarkdownList(
    {
    name: definition.name,
    description: definition.description,
    location: definition.location,
    properties: definition.properties,
    rules: definition.rules.map(
      (rule) => ({
      id: rule.id,
      description: rule.description,
      ...(rule.filePath
? { filePath: rule.filePath }
: {}),
    })),
    definitionPath: toPosixPath(
      path.relative(
        rootDirectory,
        definition.definitionPath)),
  });
}

export function formatCheckTable(items)
{
  const rows =
    items.map(
      (item) => [item.path, item.rule, item.result]);

  const headers =
    ['Path', 'Rule', 'Result'];

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
    (definition) => allowedNames.has(
      definition.name));
}

export function filterRuleResults(
  ruleResults,
  definition,
  ruleNames = [])
{
  if (ruleNames.length === 0) {
    return ruleResults;
  }

  const allowedRuleNames =
    new Set(ruleNames);

  return ruleResults.filter(
    (ruleResult) => allowedRuleNames.has(
      `${definition.name}_${ruleResult.rule.id}`));
}

export function resolveDefinition(
  definitions,
  rootDirectory,
  target)
{
  const normalizedTarget =
    toPosixPath(target);

  const absoluteTarget =
    path.resolve(
      rootDirectory,
      target);

  const byPath =
    definitions.find(
      (definition) => path.resolve(
        definition.definitionPath) === absoluteTarget)
    ?? definitions.find(
      (definition) => toPosixPath(
        path.relative(
          rootDirectory,
          definition.definitionPath)) === normalizedTarget,
    );

  if (byPath) {
    return byPath;
  }

  const byName =
    definitions.filter(
      (definition) => definition.name === target);

  if (byName.length === 1) {
    return byName[0];
  }

  if (byName.length > 1) {
    throw new Error(`Multiple definitions match: ${target}`);
  }

  throw new Error(`Definition not found: ${target}`);
}

function serializeMarkdownList(
  value,
  indent = 0)
{
  if (Array.isArray(value)) {
    return value
      .map(
        (entry) => serializeArrayEntry(
          entry,
          indent))
      .join('\n');
  }

  return Object.entries(value)
    .map(
      ([key, entry]) => serializeObjectEntry(
        key,
        entry,
        indent))
    .join('\n');
}

function serializeObjectEntry(
  key,
  value,
  indent)
{
  const prefix =
    ' '.repeat(indent);

  if (isScalar(value)) {
    return `${prefix}- ${key}: ${String(value)}`;
  }

  const nested =
    serializeMarkdownList(
      value,
      indent + 2);

  return `${prefix}- ${key}:\n${nested}`;
}

function serializeArrayEntry(
  value,
  indent)
{
  const prefix =
    ' '.repeat(indent);

  if (isScalar(value)) {
    return `${prefix}- ${String(value)}`;
  }

  if (Array.isArray(value)) {
    const nested =
      value.map(
        (entry) => serializeArrayEntry(
          entry,
          indent + 2)).join('\n');

    return `${prefix}-\n${nested}`;
  }

  const nested =
    Object.entries(value)
    .map(
      ([key, entry]) => serializeObjectEntry(
        key,
        entry,
        indent + 2))
    .join('\n');

  return `${prefix}-\n${nested}`;
}

function isScalar(value)
{
  return value === null || typeof value !== 'object';
}

function formatRow(
  cells,
  widths)
{
  return `| ${cells.map(
    (cell, index) => cell.padEnd(
      widths[index])).join(' | ')} |`;
}

function toPosixPath(value)
{
  return value.replaceAll(
    '\\',
    '/');
}
