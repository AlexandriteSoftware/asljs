import { Artefact }
  from './artefact.js';
import { MarkdownDocumentProvider }
  from './providers/markdown-document-provider.js';
import { Logger }
  from './logging/logging.js';

/**
 * Provides an execution context for the artefact data providing function.
 */
export interface ArtefactDataProvidingContext {
  logger: Logger;
  markdownDocuments: MarkdownDocumentProvider;
}

/**
 * Provides a data object for a given artefact.
 */
export type ArtefactDataProvidingFunction =
  (
    artefact: Artefact,
    context: ArtefactDataProvidingContext
  ) => Promise<Record<string, unknown>>;