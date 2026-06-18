import path
  from 'node:path';
import { readFile }
  from 'node:fs/promises';
import { toPosixPath }
  from '../formatting.js';
import { extractHeading,
         parsePropertyValues }
  from './markdown-query.js';
import { FilesystemLocationResolver }
  from './filesystem-location-resolver.js';

/**
 * @typedef
 *   { import('../artefact.js')
 *       .Artefact }
 *   Artefact
 * @typedef
 *   { import('../artefact-definition.js')
 *       .ArtefactDefinition }
 *   ArtefactDefinition
 * @typedef
 *   { import('./definition-provider.js')
 *       .DefinitionProvider }
 *   DefinitionProvider
 * @typedef
 *   { import('../logging.js')
 *       .Logger }
 *   Logger
 */

/**
 * Provides artefacts based on definitions. Caches artefacts in memory to avoid
 * redundant file system operations.
 *
 * @property {Logger} logger
 * @property {string} rootPath
 * @property {WeakMap} cache
 * @property {DefinitionProvider} definitionsProvider
 * @property {FilesystemLocationResolver} locationResolver
 */
export class ArtefactProvider
{
  /**
   * @param {Logger} logger 
   * @param {string} rootPath 
   * @param {DefinitionProvider} definitionsProvider 
   */
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

  /**
   * @param {ArtefactDefinition} definition 
   * @returns {Promise<Artefact[]>}
   */
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

  /**
   * @param {string} artefactFilePath
   * @param {ArtefactDefinition} definition
   * @returns {Promise<boolean>}
   */
  async isArtefactOfDefinition(
    artefactFilePath,
    definition)
  {
    const resolvedArtefactPath =
      path.resolve(
        this.rootPath,
        artefactFilePath);

    const artefacts =
      await this.getArtefacts(definition);

    return artefacts.some(
      artefact =>
        artefact.path === resolvedArtefactPath);
  }

  /**
   * @param {string} artefactFilePath
   * @returns {Promise<ArtefactDefinition[]>}
   */
  async getDefinitionsForArtefact(
    artefactFilePath)
  {
    const definitions =
      await this.definitionsProvider.getDefinitions();

    const matchingDefinitions = [];

    for (const definition of definitions) {
      if (
        await this.isArtefactOfDefinition(
          artefactFilePath,
          definition))
      {
        matchingDefinitions.push(definition);
      }
    }

    return matchingDefinitions;
  }

  /**
   * @param {ArtefactDefinition} definition 
   * @returns {Promise<Artefact[]>}
   */
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
}

/**
 * @param {string} projectDirectory 
 * @param {ArtefactDefinition} definition 
 * @param {string} artefactPath 
 * @returns {Promise<Artefact>}
 */
async function buildArtefact(
  projectDirectory,
  definition,
  artefactPath)
{
  if (artefactPath.endsWith('.md') === false) {
    return {
      path: artefactPath,
      relativePath:
        toPosixPath(
          path.relative(
            projectDirectory,
            artefactPath)),
      basePath:
        projectDirectory,
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
          projectDirectory,
          artefactPath)),
    basePath:
      projectDirectory,
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
