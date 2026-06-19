import path
  from 'node:path';
import { toPosixPath }
  from '../formatting.js';
import { DefinitionProvider }
  from '../providers/definition-provider.js';

/**
 * @typedef
 *   { import('./../environment.js')
 *       .Environment }
 *   Environment
 * @typedef
 *   { import('./../artefact-definition.js')
 *       .ArtefactDefinition }
 *   ArtefactDefinition
 */

/**
 * @typedef {Object} DefinitionOptions
 * @property {string} target
 */

/**
 * @param {Environment} environment
 * @param {DefinitionOptions} options
 */
export async function execDefinition(
  environment,
  options)
{
  const rootDirectory =
    environment.project;

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

/**
 * @param {ArtefactDefinition[]} definitions 
 * @param {string} rootDirectory 
 * @param {string} target 
 * @returns {ArtefactDefinition}
 */
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
      definition =>
        path.resolve(
          definition.path) === absoluteTarget)
    ?? definitions.find(
      definition =>
        toPosixPath(
          path.relative(
            rootDirectory,
            definition.path)) === normalizedTarget,
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

/**
 * @param {ArtefactDefinition} definition 
 * @param {string} rootDirectory 
 * @returns {string}
 */
function formatDefinitionDetails(
  definition,
  rootDirectory)
{
  return serializeMarkdownList(
    {
      name: definition.name,
      description: definition.description,
      location: definition.location,
      rules: definition.rules.map(
        (rule) => ({
          id: rule.id,
          description: rule.description,
          ...(rule.path
            ? { path: rule.path }
            : {}),
        })),
      path: toPosixPath(
        path.relative(
          rootDirectory,
          definition.path)),
    });
}

/**
 * @param {any} value 
 * @param {number} indent 
 * @returns {string}
 */
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

/**
 * @param {string} key 
 * @param {any} value
 * @param {number} indent 
 * @returns {string}
 */
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

/**
 * @param {any} value
 * @param {number} indent 
 * @returns {string}
 */
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

/**
 * @param {any} value
 * @returns {boolean}
 */
function isScalar(
  value)
{
  return value === null
         || typeof value !== 'object';
}
