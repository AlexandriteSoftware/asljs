import path
  from 'node:path';
import { Environment }
  from './../environment.js';
import { toPosixPath }
  from '../formatting.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';

export interface DefinitionOptions
{
  target: string;
}

export async function execDefinition(
  environment: Environment,
  options: DefinitionOptions
): Promise<void>
{
  const rootDirectory =
    environment.project;

  const { artefactDefinitionProvider } =
    environment.getProviders();

  const definitions =
    await artefactDefinitionProvider.getDefinitions();

  const markdown =
    formatDefinitionDetails(
      resolveDefinition(
        definitions,
        rootDirectory,
        options.target),
      rootDirectory);

  environment.stdout.write(
    `${markdown}\n`
  );
}

function resolveDefinition(
  definitions: ArtefactDefinition[],
  rootDirectory: string,
  target: string
): ArtefactDefinition
{
  const normalizedTarget =
    toPosixPath(target);

  const absoluteTarget =
    path.resolve(
      rootDirectory,
      target);

  const byPath =
    definitions.find(
      (definition) =>
      path.resolve(
        definition.path
      ) === absoluteTarget)
    ?? definitions.find(
      (definition) =>
        toPosixPath(
          path.relative(
            rootDirectory,
            definition.path
          )
        ) === normalizedTarget
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
  definition: ArtefactDefinition,
  rootDirectory: string
): string
{
  return serializeMarkdownList(
    {
      name: definition.name,
      description: definition.description,
      location: definition.locations,
      rules: definition.rules.map(
        (rule) => ({ id: rule.id, description: rule.content })
      ),
      path: toPosixPath(
        path.relative(
          rootDirectory,
          definition.path
        )
      )
    }
  );
}

function serializeMarkdownList(
  value: any,
  indent: number = 0
): string
{
  if (Array.isArray(value)) {
    return value
      .map(
        (entry) =>
          serializeArrayEntry(
            entry,
            indent
          )
      )
      .join('\n');
  }

  return Object.entries(value)
    .map(
      ([key, entry]) =>
        serializeObjectEntry(
          key,
          entry,
          indent
        )
    )
    .join('\n');
}

function serializeObjectEntry(
  key: string,
  value: any,
  indent: number
): string
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
  value: any,
  indent: number
): string
{
  const prefix =
    ' '.repeat(indent);

  if (isScalar(value)) {
    return `${prefix}- ${String(value)}`;
  }

  if (Array.isArray(value)) {
    const nested =
      value.map(
        (entry) =>
        serializeArrayEntry(
          entry,
          indent + 2
        )).join('\n');

    return `${prefix}-\n${nested}`;
  }

  const nested =
    Object.entries(value)
    .map(
      ([key, entry]) =>
        serializeObjectEntry(
          key,
          entry,
          indent + 2
        )
    )
    .join('\n');

  return `${prefix}-\n${nested}`;
}

function isScalar(
  value: any
): boolean
{
  return value === null
    || typeof value !== 'object';
}
