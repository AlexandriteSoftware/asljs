import { ArtefactDataProvider }
  from './providers/artefact-data-provider.js';
import { ArtefactProvider }
  from './providers/artefact-provider.js';
import { ArtefactDefinitionRuleProvider }
  from './providers/artefact-definition-rule-provider.js';
import { ArtefactDefinitionProvider }
  from './providers/artefact-definition-provider.js';
import { MarkdownDocumentProvider }
  from './providers/markdown-document-provider.js';
import { Artefact }
  from './artefact.js';
import { Logger,
         LoggerProvider }
  from './logging/logging.js';

export interface RuleValidationContext {
  logger: Logger;
  rootPath: string;
  artefacts: ArtefactProvider;
  artefactData: ArtefactDataProvider;
  definitions: ArtefactDefinitionProvider;
  rules: ArtefactDefinitionRuleProvider;
  markdownDocuments: MarkdownDocumentProvider;
}

export type RuleValidationFunction =
  (
    artefact: Artefact,
    context: RuleValidationContext
  ) => Promise<void>;

export function createRuleValidationContext(
    loggerProvider: LoggerProvider,
    rootPath: string
  ): RuleValidationContext
{
  const artefactDefinitionProvider =
    new ArtefactDefinitionProvider(
      loggerProvider.getLogger('DefinitionProvider'),
      rootPath);

  const artefactDefinitionRuleProvider =
    new ArtefactDefinitionRuleProvider(
      loggerProvider.getLogger('ArtefactDefinitionRuleProvider'),
      artefactDefinitionProvider);

  const artefactProvider =
    new ArtefactProvider(
      loggerProvider.getLogger('ArtefactProvider'),
      rootPath,
      artefactDefinitionProvider);

  const artefactDataProvider =
    new ArtefactDataProvider(
      loggerProvider.getLogger('ArtefactDataProvider'),
      rootPath);

  const markdownDocumentProvider =
    new MarkdownDocumentProvider();

  const context: RuleValidationContext =
    { logger: loggerProvider.getLogger('RuleValidationContext'),
      rootPath,
      definitions: artefactDefinitionProvider,
      artefacts: artefactProvider,
      artefactData: artefactDataProvider,
      markdownDocuments: markdownDocumentProvider,
      rules: artefactDefinitionRuleProvider };

  return context;
}
