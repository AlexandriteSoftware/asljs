import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { pathToFileURL }
  from 'node:url';
import { MarkdownDocumentProvider }
  from '../index.js';

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
 *   { import('../artefact-data-providing-function.js')
 *       .ArtefactDataProvidingFunction }
 *   ArtefactDataProvidingFunction
 * @typedef
 *   { import('../artefact-data-providing-function.js')
 *       .ArtefactDataProvidingContext }
 *   ArtefactDataProvidingContext
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
 * @property {string} definitionsPath
 */
export class ArtefactDataProvider
{
  /**
   * @param {Logger} logger
   * @param {string} definitionsPath
   */
  constructor(
    logger,
    definitionsPath)
  {
    this.logger = logger;
    this.definitionsPath = definitionsPath;

    this.markdownDocuments =
      new MarkdownDocumentProvider();
  }

  /**
   * @param {Artefact} artefact
   * @param {string} definition
   * @returns {Promise<any>}
   */
  async tryGetArtefactData(
    artefact,
    definition)
  {
    const dataProviderFilePath =
      path.join(
        this.definitionsPath,
        'parts',
        definition + '.js');

    if (!(await fs.stat(
      dataProviderFilePath)).isFile()) {
      return null;
    }

    const importUrl =
      pathToFileURL(
        dataProviderFilePath);

    let dataProviderModule;

    try {
      dataProviderModule =
        await import(
          importUrl.href);
    } catch (error) {
      this.logger.error(
        `Failed to load data provider module for ${definition}: ${error}`);

      return null;
    }

    /** @type {ArtefactDataProvidingFunction} */
    const getDataFunction =
      dataProviderModule.getData;

    if (typeof getDataFunction !== 'function') {
      throw new Error(
        'Data provider module must export getData.');
    }

    /** @type {ArtefactDataProvidingContext} */
    const context =
      { logger: this.logger,
        markdownDocuments: this.markdownDocuments };

    try {
      return await getDataFunction(
        artefact,
        context);
    } catch (error) {
      this.logger.error(
        `Failed to get data for artefact ${artefact.relativePath}: ${error}`);

      return null;
    }
  }
}
