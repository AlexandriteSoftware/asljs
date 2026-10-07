import { Logger }
  from 'asljs-logging';
import { ArtefactDataProvidingContext }
  from '../artefact-data-providing-function.js';
import { createArtefactFiles }
  from '../location.js';
import { Artefact }
  from '../model/artefact.js';
import { MarkdownDocumentProvider }
  from './markdown-document-provider.js';
import { PluginProvider }
  from './plugin-provider.js';

/**
 * Provides artefact data through the data functions plugins register for
 * definitions.
 */
export class ArtefactDataProvider
{
  constructor(
    private readonly logger: Logger,
    private readonly markdownDocumentProvider: MarkdownDocumentProvider,
    private readonly pluginProvider: PluginProvider,
    private readonly projectPath: string
  )
  {
  }

  /**
   * Data of the artefact for the definition, or `null` when no plugin
   * provides a data function for the definition or the function fails.
   */
  async tryGetArtefactData(
    artefact: Artefact,
    definition: string
  ): Promise<any>
  {
    this.logger.trace(
      'tryGetArtefactData(%s, %s)',
      artefact.location,
      definition);

    const getDataFunction =
      await this.pluginProvider.findData(
        definition);

    if (!getDataFunction) {
      return null;
    }

    const context: ArtefactDataProvidingContext =
      { logger: this.logger,
        markdownDocuments:
          this.markdownDocumentProvider,
        files:
          createArtefactFiles(
            this.projectPath) };

    try {
      return await getDataFunction(
        artefact,
        context);
    } catch (error) {
      this.logger.error(
        `tryGetArtefactData() { Failed to get data for artefact ${artefact.location}: ${error} }`);

      return null;
    }
  }
}
