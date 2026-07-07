import { ArtefactDataProvider }
  from './providers/artefact-data-provider.js';
import { ArtefactProvider }
  from './providers/artefact-provider.js';
import { DefinitionProvider }
  from './providers/definition-provider.js';
import { MarkdownDocumentProvider }
  from './providers/markdown-document-provider.js';
import { Artefact }
  from './artefact.js';
import { Logger }
  from './logging.js';

export interface RuleValidationContext {
  logger: Logger;
  rootPath: string;
  artefacts: ArtefactProvider;
  artefactData: ArtefactDataProvider;
  definitions: DefinitionProvider;
  markdownDocuments: MarkdownDocumentProvider;
}

export type RuleValidationFunction =
  (
    artefact: Artefact,
    context: RuleValidationContext
  ) => Promise<void>;

export function createRuleValidationContext(
    logger: Logger,
    rootPath: string
  ): RuleValidationContext
{
  const definitionProvider =
    new DefinitionProvider(
      logger,
      rootPath);

  const artefactProvider =
    new ArtefactProvider(
      logger,
      rootPath,
      definitionProvider);

  const artefactDataProvider =
    new ArtefactDataProvider(
      logger,
      rootPath);

  const markdownDocumentProvider =
    new MarkdownDocumentProvider();

  const context: RuleValidationContext =
    { logger,
      rootPath,
      definitions: definitionProvider,
      artefacts: artefactProvider,
      artefactData: artefactDataProvider,
      markdownDocuments: markdownDocumentProvider };

  return context;
}
