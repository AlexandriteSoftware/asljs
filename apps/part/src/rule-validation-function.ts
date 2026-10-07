import { Logger,
         LoggerProvider }
  from 'asljs-logging';
import { ArtefactFiles,
         createArtefactFiles }
  from './location.js';
import { Artefact }
  from './model/artefact.js';
import { ArtefactDataProvider }
  from './providers/artefact-data-provider.js';
import { ArtefactDefinitionProvider }
  from './providers/artefact-definition-provider.js';
import { ArtefactProvider }
  from './providers/artefact-provider.js';
import { MarkdownDocumentProvider }
  from './providers/markdown-document-provider.js';
import { Providers,
         providersFactory }
  from './providers/providers.js';

export interface RuleValidationContext
{
  logger: Logger;
  rootPath: string;
  artefacts: ArtefactProvider;
  artefactData: ArtefactDataProvider;
  definitions: ArtefactDefinitionProvider;
  markdownDocuments: MarkdownDocumentProvider;
  files: ArtefactFiles;
}

/**
 * Completes when the artefact satisfies the rule; throws otherwise. The error
 * message is the failure message.
 */
export type RuleValidationFunction =
  (
    artefact: Artefact,
    context: RuleValidationContext
  ) =>
    Promise<void>;

/**
 * Creates the context rules receive, e.g. to call a rule from its tests.
 * `definitions` are definition sources, as for `--definitions`.
 */
export function createRuleValidationContext(
    loggerProvider: LoggerProvider,
    projectPath: string,
    definitions: readonly string[]
  ): RuleValidationContext
{
  const providers =
    providersFactory(
      loggerProvider,
      projectPath,
      definitions);

  return toRuleValidationContext(
    loggerProvider.getLogger(
      'RuleValidationContext'),
    providers);
}

export function toRuleValidationContext(
    logger: Logger,
    providers: Providers
  ): RuleValidationContext
{
  return { logger,
           rootPath:
             providers.projectPath,
           definitions:
             providers.artefactDefinitionProvider,
           artefacts:
             providers.artefactProvider,
           artefactData:
             providers.artefactDataProvider,
           markdownDocuments:
             providers.markdownDocumentProvider,
           files:
             createArtefactFiles(
               providers.projectPath) };
}
