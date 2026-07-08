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
  from './model/artefact.js';
import { Logger,
         LoggerProvider }
  from './logging/logging.js';
import { providersFactory }
  from './providers/providers.js';

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
    projectPath: string,
    definitionsPath: string
  ): RuleValidationContext
{
  const providers =
    providersFactory(
      loggerProvider,
      projectPath,
      definitionsPath);

  const artefactDefinitionProvider =
    providers.artefactDefinitionProvider;

  const artefactDefinitionRuleProvider =
    providers.artefactDefinitionRuleProvider;

  const artefactProvider =
    providers.artefactProvider;

  const artefactDataProvider =
    providers.artefactDataProvider;

  const markdownDocumentProvider =
    providers.markdownDocumentProvider;

  const context: RuleValidationContext =
    { logger: loggerProvider.getLogger('RuleValidationContext'),
      rootPath: projectPath,
      definitions: artefactDefinitionProvider,
      artefacts: artefactProvider,
      artefactData: artefactDataProvider,
      markdownDocuments: markdownDocumentProvider,
      rules: artefactDefinitionRuleProvider };

  return context;
}
