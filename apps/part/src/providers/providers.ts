import { GitIgnore,
         LocationResolver }
  from 'asljs-locator';
import { LoggerProvider }
  from 'asljs-logging';
import { ArtefactDataProvider }
  from './artefact-data-provider.js';
import { ArtefactDefinitionProvider,
         ArtefactDefinitionProviderImpl }
  from './artefact-definition-provider.js';
import { ArtefactProvider }
  from './artefact-provider.js';
import { DefinitionSourceProvider }
  from './definition-source-provider.js';
import { MarkdownDefinitionReader }
  from './markdown-definition-reader.js';
import { MarkdownDocumentProvider }
  from './markdown-document-provider.js';

export interface Providers
{
  projectPath: string;

  /**
   * Definition sources, as given with `--definitions`.
   */
  definitions: readonly string[];

  readonly loggerProvider: LoggerProvider;
  readonly definitionSourceProvider: DefinitionSourceProvider;
  readonly artefactDefinitionProvider: ArtefactDefinitionProvider;
  readonly artefactDataProvider: ArtefactDataProvider;
  readonly artefactProvider: ArtefactProvider;
  readonly locationResolver: LocationResolver;
  readonly gitIgnore: GitIgnore;
  readonly markdownDocumentProvider: MarkdownDocumentProvider;
  readonly markdownDefinitionReader: MarkdownDefinitionReader;
}

/**
 * Creates the providers. `definitions` are definition sources: absolute paths
 * of md-only folders, plugin library folders or plugin files, or package
 * specifiers resolved from the project root.
 */
export function providersFactory(
    loggerProvider: LoggerProvider,
    projectPath: string,
    definitions: readonly string[]
  ): Providers
{
  const locationResolver =
    new LocationResolver(
      loggerProvider.getLogger(
        'LocationResolver'),
      projectPath);

  const gitIgnore =
    new GitIgnore(
      loggerProvider.getLogger(
        'GitIgnore'));

  const markdownDocumentProvider =
    new MarkdownDocumentProvider(
      loggerProvider.getLogger(
        'MarkdownDocumentProvider'));

  const markdownDefinitionReader =
    new MarkdownDefinitionReader(
      loggerProvider.getLogger(
        'MarkdownDefinitionReader'),
      gitIgnore,
      markdownDocumentProvider);

  const definitionSourceProvider =
    new DefinitionSourceProvider(
      loggerProvider.getLogger(
        'DefinitionSourceProvider'),
      loggerProvider,
      definitions,
      projectPath,
      markdownDefinitionReader,
      markdownDocumentProvider);

  const artefactDefinitionProvider =
    new ArtefactDefinitionProviderImpl(
      loggerProvider.getLogger(
        'ArtefactDefinitionProvider'),
      markdownDefinitionReader,
      definitionSourceProvider);

  const artefactProvider =
    new ArtefactProvider(
      loggerProvider.getLogger(
        'ArtefactProvider'),
      artefactDefinitionProvider,
      definitionSourceProvider,
      projectPath);

  const artefactDataProvider =
    new ArtefactDataProvider(
      loggerProvider.getLogger(
        'ArtefactDataProvider'),
      markdownDocumentProvider,
      definitionSourceProvider,
      projectPath);

  return { projectPath,
           definitions,
           loggerProvider,
           definitionSourceProvider,
           artefactDefinitionProvider,
           artefactDataProvider,
           artefactProvider,
           locationResolver,
           gitIgnore,
           markdownDocumentProvider,
           markdownDefinitionReader };
}
