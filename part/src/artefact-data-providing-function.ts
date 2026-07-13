import { Logger }
  from './logging/logging.js';
import { Artefact }
  from './model/artefact.js';
import { MarkdownDocumentProvider }
  from './providers/markdown-document-provider.js';

/**
 * Provides an execution context for the artefact data providing function.
 */
export interface ArtefactDataProvidingContext
{
  logger: Logger;
  markdownDocuments: MarkdownDocumentProvider;
}

/**
 * Provides a data object for a given artefact.
 */
export type ArtefactDataProvidingFunction = (
  artefact: Artefact,
  context: ArtefactDataProvidingContext
) => Promise<Record<string, unknown>>;
