import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { pathToFileURL }
  from 'node:url';
import { MarkdownDocumentProvider }
  from '../index.js';
import { getInstanceId }
  from './../framework.js';
import { Artefact }
  from '../artefact.js';
import { ArtefactDefinition }
  from '../artefact-definition.js';
import { DefinitionProvider }
  from './definition-provider.js';
import { ArtefactDataProvidingFunction,
         ArtefactDataProvidingContext }
  from '../artefact-data-providing-function.js';
import { Logger }
  from '../logging.js';

/**
 * Provides artefacts based on definitions. Caches artefacts in memory to avoid
 * redundant file system operations.
 */
export class ArtefactDataProvider
{
  private logger: Logger;
  private definitionsPath: string;
  private markdownDocuments: MarkdownDocumentProvider;

  constructor(
      logger: Logger,
      definitionsPath: string
    )
  {
    this.logger =
      logger.scope(
        { instanceId:
            getInstanceId(
              'ArtefactDataProvider') });

    this.definitionsPath = definitionsPath;

    this.markdownDocuments =
      new MarkdownDocumentProvider();
  }

  async tryGetArtefactData(
      artefact: Artefact,
      definition: string
    ): Promise<any>
  {
    this.logger.trace(
      `tryGetArtefactData(${artefact.relativePath}, ${definition})`);

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
        `tryGetArtefactData() { Failed to load data provider module for ${definition}: ${error} }`);

      return null;
    }

    const getDataFunction: ArtefactDataProvidingFunction =
      dataProviderModule.getData;

    if (typeof getDataFunction !== 'function') {
      throw new Error(
        'Data provider module must export getData.');
    }

    const context: ArtefactDataProvidingContext =
      { logger: this.logger,
        markdownDocuments: this.markdownDocuments };

    try {
      return await getDataFunction(
        artefact,
        context);
    } catch (error) {
      this.logger.error(
        `tryGetArtefactData() { Failed to get data for artefact ${artefact.relativePath}: ${error} }`);

      return null;
    }
  }
}
