import path
  from 'node:path';
import { toPosixPath }
  from '../formatting.js';
import { FilesystemLocationResolver }
  from './filesystem-location-resolver.js';
import { getInstanceId }
  from './../framework.js';

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
    this.logger =
      logger.scope(
        { instanceId:
            getInstanceId(
              'ArtefactProvider') });

    this.rootPath = path.resolve(rootPath);
    this.definitionsProvider = definitionsProvider;

    this.locationResolver =
      new FilesystemLocationResolver(
        this.logger,
        this.rootPath);
  }

  /**
   * @param {string} artefactPath
   * @returns {Promise<Artefact?>}
   */
  async tryGetArtefact(
    artefactPath)
  {
    this.logger.trace(
      `tryGetArtefact(${artefactPath})`);

    const artefactFullPath =
      path.resolve(
        this.rootPath,
        artefactPath);

    if (!path.isAbsolute(artefactPath)) {
      this.logger.trace(
        `tryGetArtefact() { ${artefactPath} is resolved to ${artefactFullPath} }`);
    }

    const definitions =
      await this.getDefinitionsForArtefact(
        artefactFullPath);

    if (definitions.length === 0) {
      this.logger.trace(
        `tryGetArtefact() { ${artefactPath} is not matched by any artefact definition }`);

      return null;
    }

    return await this.buildArtefact(
      this.rootPath,
      definitions,
      artefactFullPath);
  }

  /**
   * @param {ArtefactDefinition[]?} definitions
   * @returns {Promise<Artefact[]>}
   */
  async getArtefacts(
    definitions = null)
  {
    if (this.logger.level === 'trace') {
      let definitionsList;

      if (definitions === null) {
        definitionsList = '';
      } else {
        definitionsList =
          definitions
            .map(
              definition => definition.name)
            .join(', ');
      }

      this.logger.trace(
        `getArtefacts(${definitionsList})`);
    }

    if (definitions === null) {
      definitions =
        await this.definitionsProvider.getDefinitions();
    }

    const artefactPaths =
      new Set();

    for (const definition of definitions) {
      const paths =
        await this.locationResolver
          .resolve(
            path.dirname(
              definition.path),
            definition.location);
      
      for (const artefactPath of paths) {
        artefactPaths.add(artefactPath);
      }
    }

    const artefacts = [];

    for (const artefactPath of artefactPaths) {
      const artefactDefinitions =
        await this.getDefinitionsForArtefact(
          artefactPath);

      artefacts.push(
        await this.buildArtefact(
          this.rootPath,
          artefactDefinitions,
          artefactPath));
    }

    artefacts.sort(
      (left, right) =>
        left.relativePath.localeCompare(
          right.relativePath));

    return artefacts;
  }

  /**
   * @param {string} artefactPath
   * @param {ArtefactDefinition} definition
   * @returns {Promise<boolean>}
   */
  async isArtefactOfDefinition(
    artefactPath,
    definition)
  {
    const artafactFullPath =
      path.normalize(
        path.resolve(
          this.rootPath,
          artefactPath));

    const match =
      await this.locationResolver
        .check(
          artafactFullPath,
          path.dirname(
            definition.path),
          definition.location);
      
    return match;
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
   * @param {string} projectDirectory 
   * @param {ArtefactDefinition[]} definitions
   * @param {string} artefactPath 
   * @returns {Promise<Artefact>}
   */
  async buildArtefact(
    projectDirectory,
    definitions,
    artefactPath)
  {
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
      definitions:
        definitions
          .map(
            definition => definition.name)
    };
  }
}
