import path
  from 'node:path';
import { DefinitionProvider }
  from '../providers/definitionProvider.js';

export async function execDefinition(
  environment,
  options)
{
  const rootDirectory =
    environment.cwd;

  const definitionProvider =
    new DefinitionProvider(
      environment.logger,
      rootDirectory,
      environment.definitions);

  const definitions =
    await definitionProvider.getDefinitions();

  const markdown =
    formatDefinitionDetails(
      resolveDefinition(
        definitions,
        rootDirectory,
        options.target),
      rootDirectory);

  environment.stdout.write(
    `${markdown}\n`);
}

function resolveDefinition(
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

function formatDefinitionDetails(
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

function toPosixPath(value)
{
  return value.replaceAll(
    '\\',
    '/');
}
