import { Artefact }
  from './artefact.js';
import { ArtefactDefinition }
  from './artefact-definition.js';
import { MarkdownDocumentProvider }
  from './providers/markdown-document-provider.js';
import { Logger }
  from './logging.js';

export interface ArtefactDataProvidingContext {
  logger: Logger;
  markdownDocuments: MarkdownDocumentProvider;
}

export type ArtefactDataProvidingFunction =
  (
    artefact: Artefact,
    context: ArtefactDataProvidingContext
  ) => Promise<any>;