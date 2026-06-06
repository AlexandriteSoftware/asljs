import path from 'node:path';
import { readdir, readFile } from 'node:fs/promises';

import { glob } from 'glob';

import {
  extractHeading,
  parsePropertyValues,
} from './markdown.js';
import { DefinitionProvider } from './definitionProvider.js';
import { GitIgnore } from './gitIgnore.js';
import { runRules } from './ruleRunner.js';

const IGNORED_DIRECTORIES = new Set([
  '.git',
  'coverage',
  'dist',
  'node_modules',
  'part',
]);

export async function buildInventoryReport(rootDirectory, options = {})
{
  const definitions = await loadDefinitions(rootDirectory, options);
  const items = await collectInventoryItems(rootDirectory, definitions);
  return formatInventoryTable(items);
}

export async function buildArtefactDefinitionReport(rootDirectory, options = {})
{
  const definitions = await loadDefinitions(rootDirectory, options);

  if (options.definitionTarget) {
    return formatDefinitionDetails(resolveDefinition(definitions, rootDirectory, options.definitionTarget), rootDirectory);
  }

  return formatDefinitionTable(rootDirectory, definitions);
}

export async function buildCheckReport(rootDirectory, options = {})
{
  const definitions = filterDefinitions(await loadDefinitions(rootDirectory, options), options.definitionNames);
  const matchingPaths = options.pattern
    ? new Set((await glob(options.pattern, {
      absolute: true,
      cwd: rootDirectory,
      dot: true,
      nodir: true,
    })).map((filePath) => path.resolve(filePath)))
    : null;
  const results = [];
  let hasFailures = false;

  for (const definition of definitions) {
    const artifactPaths = await listArtifactPaths(rootDirectory, definition);
    const selectedArtifactPaths = artifactPaths
      .map((artifactPath) => path.resolve(artifactPath))
      .filter((artifactPath) => matchingPaths === null || matchingPaths.has(artifactPath));

    for (const artifactPath of selectedArtifactPaths) {
      const artefact = await buildArtefact(rootDirectory, definition, artifactPath);
      const ruleResults = filterRuleResults(
        await runRules(definition, artefact, {
          artifactPath,
          rootDirectory,
        }),
        definition,
        options.ruleNames,
      );

      for (const ruleResult of ruleResults) {
        const row = {
          path: artefact.file,
          rule: `${definition.name}_${ruleResult.rule.id}`,
          passed: ruleResult.result === 'Ok',
          result: ruleResult.result === 'Ok' ? 'OK' : ruleResult.message,
        };

        hasFailures = hasFailures || !row.passed;

        if (!options.withPositives && row.passed) {
          continue;
        }

        results.push(row);
      }
    }
  }

  results.sort((left, right) => {
    const pathCompare = left.path.localeCompare(right.path);

    if (pathCompare !== 0) {
      return pathCompare;
    }

    return left.rule.localeCompare(right.rule);
  });

  return {
    report: formatCheckTable(results),
    hasFailures,
  };
}

export async function generateInventoryTable(rootDirectory, options = {})
{
  return buildInventoryReport(rootDirectory, options);
}

async function loadDefinitions(rootDirectory, options)
{
  const provider = new DefinitionProvider(rootDirectory);
  const definitionsDirectory = options.definitionsPath
    ? path.resolve(rootDirectory, options.definitionsPath)
    : rootDirectory;
  const definitions = await provider.getDefinitions(definitionsDirectory);

  return definitions;
}

async function collectInventoryItems(rootDirectory, definitions)
{
  const artefactIndex = new Map();

  for (const definition of definitions) {
    const artifactPaths = await listArtifactPaths(rootDirectory, definition);

    for (const artifactPath of artifactPaths) {
      if (path.resolve(artifactPath) === path.resolve(definition.definitionPath)) {
        continue;
      }

      const relativePath = toPosixPath(path.relative(rootDirectory, artifactPath));
      const existingEntry = artefactIndex.get(relativePath) ?? {
        file: relativePath,
        definitions: [],
        rulesOk: true,
      };
      const artifactResult = await inspectArtifact(rootDirectory, definition, artifactPath);

      existingEntry.definitions.push({
        name: definition.name,
        orderKey: toPosixPath(path.relative(rootDirectory, definition.definitionPath)),
      });
      existingEntry.rulesOk = existingEntry.rulesOk && artifactResult.rulesOk;
      artefactIndex.set(relativePath, existingEntry);
    }
  }

  const items = Array.from(artefactIndex.values(), (entry) => ({
    file: entry.file,
    definitions: entry.definitions
      .sort((left, right) => left.orderKey.localeCompare(right.orderKey) || left.name.localeCompare(right.name))
      .map((definition) => definition.name)
      .join(','),
    rules: entry.rulesOk ? 'Ok' : 'Fail',
  }));

  items.sort((left, right) => left.file.localeCompare(right.file));
  return items;
}

async function inspectArtifact(rootDirectory, definition, artifactPath)
{
  const artifact = await buildArtefact(rootDirectory, definition, artifactPath);
  const ruleResults = await runRules(definition, artifact, {
    artifactPath,
    rootDirectory,
  });

  return {
    file: artifact.file,
    definition: definition.name,
    rulesOk: ruleResults.every((result) => result.result === 'Ok'),
  };
}

async function buildArtefact(rootDirectory, definition, artifactPath)
{
  const content = await readFile(artifactPath, 'utf8');
  const properties = parsePropertyValues(content, definition.propertyDefinitions);

  return {
    file: toPosixPath(path.relative(rootDirectory, artifactPath)),
    title: extractHeading(content) ?? path.basename(artifactPath, '.md'),
    type: definition.typeId,
    properties,
    ...properties,
  };
}

async function listArtifactPaths(rootDirectory, definition)
{
  const gitIgnore = definition.location.gitIgnore ? new GitIgnore(rootDirectory) : null;
  const searchPatterns = toSearchPatterns(definition.location);
  const artifactPaths = new Set();

  for (const pattern of searchPatterns) {
    const matches = await glob(pattern, {
      absolute: true,
      cwd: rootDirectory,
      dot: true,
      nodir: true,
      ignore: definition.location.exclude,
    });

    for (const match of matches) {
      if (!gitIgnore || !gitIgnore.isIgnored(match)) {
        artifactPaths.add(match);
      }
    }
  }

  return Array.from(artifactPaths);
}

function toSearchPatterns(location)
{
  if (location.type === 'Files') {
    return [location.pattern];
  }

  return [
    `${trimTrailingSlash(location.pattern)}/**/*.md`,
  ];
}

function trimTrailingSlash(value)
{
  return value.replace(/[\\/]+$/, '');
}

async function listMarkdownFiles(rootDirectory, options)
{
  try {
    const entries = await readdir(rootDirectory, {
      withFileTypes: true,
    });
    const files = [];

    for (const entry of entries) {
      const entryPath = path.join(rootDirectory, entry.name);

      if (entry.isDirectory()) {
        if (options.ignoredDirectories.has(entry.name)) {
          continue;
        }

        files.push(...await listMarkdownFiles(entryPath, options));
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(entryPath);
      }
    }

    return files;
  }
  catch (error) {
    if (options.allowMissingRoot && isMissingPathError(error)) {
      return [];
    }

    throw error;
  }
}

function formatInventoryTable(items)
{
  const rows = items.map((item) => [item.file, item.definitions, item.rules]);
  const headers = ['Location', 'Definitions', 'Rules'];
  const widths = headers.map((header, index) => {
    const cellWidths = rows.map((row) => row[index].length);
    return Math.max(header.length, ...cellWidths, 3);
  });
  const lines = [];

  lines.push(formatRow(headers, widths));
  lines.push(formatRow(widths.map((width) => '-'.repeat(width)), widths));

  for (const row of rows) {
    lines.push(formatRow(row, widths));
  }

  return lines.join('\n');
}

function formatDefinitionTable(rootDirectory, definitions)
{
  const rows = definitions.map((definition) => [
    definition.name,
    toPosixPath(path.relative(rootDirectory, definition.definitionPath)),
  ]);
  const headers = ['Name', 'Location'];
  const widths = headers.map((header, index) => {
    const cellWidths = rows.map((row) => row[index].length);
    return Math.max(header.length, ...cellWidths, 3);
  });
  const lines = [];

  lines.push(formatRow(headers, widths));
  lines.push(formatRow(widths.map((width) => '-'.repeat(width)), widths));

  for (const row of rows) {
    lines.push(formatRow(row, widths));
  }

  return lines.join('\n');
}

function formatDefinitionDetails(definition, rootDirectory)
{
  return serializeMarkdownList({
    name: definition.name,
    description: definition.description,
    location: definition.location,
    properties: definition.properties,
    rules: definition.rules.map((rule) => ({
      id: rule.id,
      description: rule.description,
      ...(rule.filePath ? { filePath: rule.filePath } : {}),
    })),
    definitionPath: toPosixPath(path.relative(rootDirectory, definition.definitionPath)),
  });
}

function formatCheckTable(items)
{
  const rows = items.map((item) => [item.path, item.rule, item.result]);
  const headers = ['Path', 'Rule', 'Result'];
  const widths = headers.map((header, index) => {
    const cellWidths = rows.map((row) => row[index].length);
    return Math.max(header.length, ...cellWidths, 3);
  });
  const lines = [];

  lines.push(formatRow(headers, widths));
  lines.push(formatRow(widths.map((width) => '-'.repeat(width)), widths));

  for (const row of rows) {
    lines.push(formatRow(row, widths));
  }

  return lines.join('\n');
}

async function findMatchingDefinitions(rootDirectory, artifactPath, definitions)
{
  const matches = [];

  for (const definition of definitions) {
    const artifactPaths = await listArtifactPaths(rootDirectory, definition);

    if (artifactPaths.some((currentPath) => path.resolve(currentPath) === path.resolve(artifactPath))) {
      matches.push(definition);
    }
  }

  return matches;
}

function filterDefinitions(definitions, definitionNames = [])
{
  if (definitionNames.length === 0) {
    return definitions;
  }

  const allowedNames = new Set(definitionNames);
  return definitions.filter((definition) => allowedNames.has(definition.name));
}

function filterRuleResults(ruleResults, definition, ruleNames = [])
{
  if (ruleNames.length === 0) {
    return ruleResults;
  }

  const allowedRuleNames = new Set(ruleNames);
  return ruleResults.filter((ruleResult) => allowedRuleNames.has(`${definition.name}_${ruleResult.rule.id}`));
}

function resolveDefinition(definitions, rootDirectory, target)
{
  const normalizedTarget = toPosixPath(target);
  const absoluteTarget = path.resolve(rootDirectory, target);
  const byPath = definitions.find((definition) => path.resolve(definition.definitionPath) === absoluteTarget)
    ?? definitions.find(
      (definition) => toPosixPath(path.relative(rootDirectory, definition.definitionPath)) === normalizedTarget,
    );

  if (byPath) {
    return byPath;
  }

  const byName = definitions.filter((definition) => definition.name === target);

  if (byName.length === 1) {
    return byName[0];
  }

  if (byName.length > 1) {
    throw new Error(`Multiple definitions match: ${target}`);
  }

  throw new Error(`Definition not found: ${target}`);
}

function serializeMarkdownList(value, indent = 0)
{
  if (Array.isArray(value)) {
    return value
      .map((entry) => serializeArrayEntry(entry, indent))
      .join('\n');
  }

  return Object.entries(value)
    .map(([key, entry]) => serializeObjectEntry(key, entry, indent))
    .join('\n');
}

function serializeObjectEntry(key, value, indent)
{
  const prefix = ' '.repeat(indent);

  if (isScalar(value)) {
    return `${prefix}- ${key}: ${String(value)}`;
  }

  const nested = serializeMarkdownList(value, indent + 2);
  return `${prefix}- ${key}:\n${nested}`;
}

function serializeArrayEntry(value, indent)
{
  const prefix = ' '.repeat(indent);

  if (isScalar(value)) {
    return `${prefix}- ${String(value)}`;
  }

  if (Array.isArray(value)) {
    const nested = value.map((entry) => serializeArrayEntry(entry, indent + 2)).join('\n');
    return `${prefix}-\n${nested}`;
  }

  const nested = Object.entries(value)
    .map(([key, entry]) => serializeObjectEntry(key, entry, indent + 2))
    .join('\n');
  return `${prefix}-\n${nested}`;
}

function isScalar(value)
{
  return value === null || typeof value !== 'object';
}

function formatRow(cells, widths)
{
  return `| ${cells.map((cell, index) => cell.padEnd(widths[index])).join(' | ')} |`;
}

function toPosixPath(value)
{
  return value.replaceAll('\\', '/');
}
