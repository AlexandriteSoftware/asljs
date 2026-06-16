import path
  from 'node:path';
import { readFile }
  from 'node:fs/promises';
import { glob }
  from 'glob';
import { extractHeading,
         parsePropertyValues }
  from './markdown.js';
import { FilesystemLocationResolver }
  from './filesystemLocationResolver.js';

/**
 * Provides artefacts based on definitions. Caches artefacts in memory to avoid
 * redundant file system operations.
 */
export class ArtefactProvider
{
  constructor(
    logger,
    rootPath,
    definitionsProvider)
  {
    this.logger = logger;
    this.rootPath = path.resolve(rootPath);
    this.cache = new WeakMap();
    this.definitionsProvider = definitionsProvider;

    this.locationResolver =
      new FilesystemLocationResolver(
        this.logger,
        this.rootPath);
  }

  async getArtefacts(
    definition)
  {
    const cachedArtefacts =
      this.cache.get(definition);

    if (cachedArtefacts) {
      return cachedArtefacts;
    }

    const artefacts =
      await this.loadArtefacts(
        definition);

    this.cache.set(
      definition,
      artefacts);

    return artefacts;
  }

  async isArtefactOfDefinition(
    artefactPath,
    definition)
  {
    const resolvedArtefactPath =
      path.resolve(
        this.rootPath,
        artefactPath);

    const artefacts =
      await this.getArtefacts(definition);

    return artefacts.some(
      artefact =>
        artefact.path === resolvedArtefactPath);
  }

  async getDefinitionsForArtefact(
    artefactPath)
  {
    const definitions =
      await this.definitionsProvider.getDefinitions();

    const matchingDefinitions =
      [];

    for (const definition of definitions) {
      if (await this.isArtefactOfDefinition(
        artefactPath,
        definition)) {
        matchingDefinitions.push(definition);
      }
    }

    return matchingDefinitions;
  }

  async loadArtefacts(
    definition)
  {
    const artefactPaths =
      await this.locationResolver
        .resolve(
          path.dirname(
            definition.path),
          definition.location.patterns,
          definition.location.exclude ?? [],
          definition.location.filters ?? []);

    const artefacts = [];

    for (const artefactPath of artefactPaths) {
      artefacts.push(
        await buildArtefact(
          this.rootPath,
          definition,
          artefactPath));
    }

    artefacts.sort(
      (left, right) =>
        left.relativePath.localeCompare(
          right.relativePath));

    return artefacts;
  }

  async listArtefactPaths(
    rootDirectory,
    definition)
  {
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

    const artefactPaths =
      new Set();

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
        if (!this.gitIgnore.isIgnored(match)) {
          artefactPaths.add(
            path.resolve(match));
        }
      }
    }

    return Array.from(artefactPaths);
  }
}

async function buildArtefact(
  rootDirectory,
  definition,
  artefactPath)
{
  if (artefactPath.endsWith('.md') === false) {
    return {
      path: artefactPath,
      relativePath:
        toPosixPath(
          path.relative(
            rootDirectory,
            artefactPath)),
      basePath:
        rootDirectory,
      name:
        path.basename(
          artefactPath,
          path.extname(artefactPath)),
    };
  }

  const content =
    await readFile(
      artefactPath,
      'utf8');

  const propertyDefinitions =
    definition.propertyDefinitions ?? new Map();

  const properties =
    parsePropertyValues(
      content,
      propertyDefinitions);

  return {
    path: artefactPath,
    relativePath:
      toPosixPath(
        path.relative(
          rootDirectory,
          artefactPath)),
    basePath:
      rootDirectory,
    name:
      path.basename(
        artefactPath,
        path.extname(artefactPath)),
    title:
      extractHeading(content)
      ?? path.basename(
        artefactPath,
        path.extname(artefactPath)),
    properties,
    ...properties
  };
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
      path.dirname(
        definition.definitionPath),
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
  return value.replace(
    /[\\/]+$/,
    '');
}

function toPosixPath(
  value)
{
  return value.replaceAll(
    '\\',
    '/');
}