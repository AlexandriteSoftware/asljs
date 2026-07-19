import { LoggerProvider }
  from '../logging/logging.js';
import { ArtefactDataProvider }
  from './artefact-data-provider.js';
import { ArtefactDefinitionProvider,
         ArtefactDefinitionProviderImpl }
  from './artefact-definition-provider.js';
import { ArtefactDefinitionRuleProvider }
  from './artefact-definition-rule-provider.js';
import { ArtefactProvider }
  from './artefact-provider.js';
import { FilesystemLocationResolver }
  from './filesystem-location-resolver.js';
import { GitIgnore }
  from './git-ignore.js';
import { MarkdownDocumentProvider }
  from './markdown-document-provider.js';

export interface Providers
{
  projectPath: string;
  definitionsPath: string;
  readonly loggerProvider: LoggerProvider;
  readonly artefactDefinitionProvider: ArtefactDefinitionProvider;
  readonly artefactDefinitionRuleProvider: ArtefactDefinitionRuleProvider;
  readonly artefactDataProvider: ArtefactDataProvider;
  readonly artefactProvider: ArtefactProvider;
  readonly filesystemLocationResolver: FilesystemLocationResolver;
  readonly gitIgnore: GitIgnore;
  readonly markdownDocumentProvider: MarkdownDocumentProvider;
}

export function providersFactory(
    loggerProvider: LoggerProvider,
    projectPath: string,
    definitionsPath: string
  ): Providers
{
  const filesystemLocationResolver =
    new FilesystemLocationResolver(
    loggerProvider.getLogger(
      'FilesystemLocationResolver'
    ),
    projectPath
  );

  const artefactDefinitionProviderLogger =
    loggerProvider.getLogger(
      'ArtefactDefinitionProvider');

  const gitIgnore =
    new GitIgnore(
    loggerProvider.getLogger(
      'GitIgnore'
    )
  );

  const markdownDocumentProvider =
    new MarkdownDocumentProvider(
    loggerProvider.getLogger(
      'MarkdownDocumentProvider'
    )
  );

  const artefactDefinitionProvider =
    new ArtefactDefinitionProviderImpl(
    artefactDefinitionProviderLogger,
    gitIgnore,
    markdownDocumentProvider,
    definitionsPath
  );

  const artefactProvider =
    new ArtefactProvider(
    loggerProvider.getLogger(
      'ArtefactProvider'
    ),
    artefactDefinitionProvider,
    projectPath
  );

  const artefactDataProvider =
    new ArtefactDataProvider(
    loggerProvider.getLogger(
      'ArtefactDataProvider'
    ),
    markdownDocumentProvider,
    definitionsPath
  );

  const artefactDefinitionRuleProvider =
    new ArtefactDefinitionRuleProvider(
    loggerProvider.getLogger(
      'ArtefactDefinitionRuleProvider'
    ),
    artefactDefinitionProvider
  );

  return {
    projectPath,
    definitionsPath,
    loggerProvider,
    artefactDefinitionProvider,
    artefactDefinitionRuleProvider,
    artefactDataProvider,
    artefactProvider,
    filesystemLocationResolver,
    gitIgnore,
    markdownDocumentProvider
  };
}
