import path
  from 'node:path';
import { readFile }
  from 'node:fs/promises';
import { glob }
  from 'glob';
import { extractHeading,
         parsePropertyValues }
  from './markdown.js';
import { GitIgnore }
  from './gitIgnore.js';

/**
 * Provides artefacts based on definitions. Caches artefacts in memory to avoid
 * redundant file system operations.
 */
export class ArtefactProvider
{
  constructor(
    logger,
    rootPath)
  {
    this.logger = logger;
    this.rootPath = path.resolve(rootPath);
    this.artefactCache = new WeakMap();
    this.loadedDefinitions = null;
  }

  async getArtefacts(
    definition)
  {
    const cachedArtefacts =
      this.artefactCache.get(definition);

    if (cachedArtefacts) {
      return cachedArtefacts;
    }

    const artefacts =
      await loadArtefacts(
        this.rootPath,
        definition);

    this.artefactCache.set(
      definition,
      artefacts);

    return artefacts;
  }

  async isArtefactOfDefinition(
    artefactPath,
    definition)
  {
    const resolvedArtefactPath =
      toAbsolutePath(
        this.rootPath,
        artefactPath);

    const artefacts =
      await this.getArtefacts(definition);

    return artefacts.some(
      artefact =>
        toAbsolutePath(this.rootPath, artefact.file) === resolvedArtefactPath);
  }

  async getDefinitionsForArtefact(
    artefactPath)
  {
    const definitions = await this.loadDefinitions();

    const matchingDefinitions = [];

    for (const definition of definitions) {
      if (await this.isArtefactOfDefinition(artefactPath, definition)) {
        matchingDefinitions.push(definition);
      }
    }

    return matchingDefinitions;
  }
}

async function loadArtefacts(
  rootDirectory,
  definition)
{
  const artefactPaths =
    await listArtefactPaths(
      rootDirectory,
      definition);
     
  const artefacts = [];

  for (const artefactPath of artefactPaths) {
    artefacts.push(
      await buildArtefact(rootDirectory, definition, artefactPath));
  }

  artefacts.sort(
    (left, right) =>
      left.file.localeCompare(right.file));
  return artefacts;
}

async function buildArtefact(rootDirectory, definition, artefactPath)
{
  const content = await readFile(artefactPath, 'utf8');
  const propertyDefinitions = definition.propertyDefinitions ?? new Map();
  const properties = parsePropertyValues(content, propertyDefinitions);

  return {
    file: toPosixPath(path.relative(rootDirectory, artefactPath)),
    title: extractHeading(content) ?? path.basename(artefactPath, '.md'),
    type: definition.typeId ?? null,
    properties,
    ...properties,
  };
}

async function listArtefactPaths(
  rootDirectory,
  definition)
{
  const gitIgnore =
    definition.location.gitIgnore
    ? new GitIgnore(rootDirectory)
    : null;

  const searchPatterns =
    toSearchPatterns(
      rootDirectory,
      definition);

  const ignorePatterns =
    (definition.location.exclude ?? []).map(
      excludePattern =>
        resolveDefinitionLocationPath(
          rootDirectory,
          definition,
          excludePattern));

  const artefactPaths = new Set();

  for (const pattern of searchPatterns) {
    const matches =
      await glob(
        pattern,
        { absolute: true,
          cwd: rootDirectory,
          dot: true,
          nodir: true,
          ignore: ignorePatterns });

    for (const match of matches) {
      if (!gitIgnore || !gitIgnore.isIgnored(match)) {
        artefactPaths.add(path.resolve(match));
      }
    }
  }

  return Array.from(artefactPaths);
}

function toSearchPatterns(
  rootDirectory,
  definition)
{
  const pattern =
    resolveDefinitionLocationPath(
      rootDirectory,
      definition,
      definition.location.pattern);

  if (definition.location.type === 'Files') {
    return [pattern];
  }

  return [`${trimTrailingSlash(pattern)}/**/*.md`];
}

function resolveDefinitionLocationPath(
  rootDirectory,
  definition,
  locationPath)
{
  const resolvedPath =
    path.resolve(
      path.dirname(definition.definitionPath),
      locationPath);

  const relativePath =
    path.relative(
      rootDirectory,
      resolvedPath);

  if (!relativePath.startsWith('..')
      && !path.isAbsolute(relativePath))
  {
    return toPosixPath(relativePath);
  }

  return toPosixPath(resolvedPath);
}

function trimTrailingSlash(
  value)
{
  return value.replace(/[\\/]+$/, '');
}

function toAbsolutePath(
  rootPath,
  targetPath)
{
  return path.isAbsolute(targetPath)
    ? path.resolve(targetPath)
    : path.resolve(rootPath, targetPath);
}

function toPosixPath(
  value)
{
  return value.replaceAll('\\', '/');
}