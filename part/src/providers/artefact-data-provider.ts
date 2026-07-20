import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { pathToFileURL }
  from 'node:url';
import { ArtefactDataProvidingContext,
         ArtefactDataProvidingFunction }
  from '../artefact-data-providing-function.js';
import { MarkdownDocumentProvider }
  from '../index.js';
import { Logger }
  from '../logging/logging.js';
import { Artefact }
  from '../model/artefact.js';

/**
 * Provides artefacts based on definitions. Caches artefacts in memory to avoid
 * redundant file system operations.
 */
export class ArtefactDataProvider
{
  constructor(
    private readonly logger: Logger,
    private readonly markdownDocumentProvider: MarkdownDocumentProvider,
    private readonly definitionsPath: string
  )
  {
    if (
      !path.isAbsolute(
        definitionsPath)
    ) {
      throw new Error(
        `'definitionsPath' must be absolute: ${definitionsPath}`
      );
    }
  }

  async tryGetArtefactData(
    artefact: Artefact,
    definition: string
  ): Promise<any>
  {
    this.logger.trace(
      'tryGetArtefactData(%s, %s)',
      artefact.relativePath,
      definition);

    const dataProviderFilePath =
      path.join(
        this.definitionsPath,
        'parts',
        definition + '.js');

    if (
      !(await fs.stat(
        dataProviderFilePath)).isFile()
    ) {
      return null;
    }

    const importUrl =
      pathToFileURL(
        dataProviderFilePath);

    let dataProviderModule;

    try {
      dataProviderModule = await import(
        importUrl.href
      );
    } catch (error) {
      this.logger.error(
        `tryGetArtefactData() { Failed to load data provider module for ${definition}: ${error} }`);

      return null;
    }

    const getDataFunction: ArtefactDataProvidingFunction =
      dataProviderModule.getData;

    if (typeof getDataFunction !== 'function') {
      throw new Error(
        'Data provider module must export getData.'
      );
    }

    const context: ArtefactDataProvidingContext =
      {
      logger: this.logger,
      markdownDocuments: this.markdownDocumentProvider
    };

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
