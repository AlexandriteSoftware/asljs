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
import { MarkdownDocumentProvider }
  from './markdown-document-provider.js';
import { PluginProvider }
  from './plugin-provider.js';

export interface Providers
{
  projectPath: string;
  definitionsPath: string;
  readonly loggerProvider: LoggerProvider;
  readonly pluginProvider: PluginProvider;
  readonly artefactDefinitionProvider: ArtefactDefinitionProvider;
  readonly artefactDataProvider: ArtefactDataProvider;
  readonly artefactProvider: ArtefactProvider;
  readonly locationResolver: LocationResolver;
  readonly gitIgnore: GitIgnore;
  readonly markdownDocumentProvider: MarkdownDocumentProvider;
}

/**
 * Creates the providers. `plugins` are module specifiers: absolute or
 * `.`-relative paths, or package specifiers resolved from the project root.
 */
export function providersFactory(
    loggerProvider: LoggerProvider,
    projectPath: string,
    definitionsPath: string,
    plugins: readonly string[] = [ ]
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

  const pluginProvider =
    new PluginProvider(
      loggerProvider.getLogger(
        'PluginProvider'),
      loggerProvider,
      plugins,
      projectPath,
      definitionsPath,
      markdownDocumentProvider);

  const artefactDefinitionProvider =
    new ArtefactDefinitionProviderImpl(
      loggerProvider.getLogger(
        'ArtefactDefinitionProvider'),
      gitIgnore,
      markdownDocumentProvider,
      pluginProvider,
      definitionsPath);

  const artefactProvider =
    new ArtefactProvider(
      loggerProvider.getLogger(
        'ArtefactProvider'),
      artefactDefinitionProvider,
      pluginProvider,
      projectPath);

  const artefactDataProvider =
    new ArtefactDataProvider(
      loggerProvider.getLogger(
        'ArtefactDataProvider'),
      markdownDocumentProvider,
      pluginProvider,
      projectPath);

  return { projectPath,
           definitionsPath,
           loggerProvider,
           pluginProvider,
           artefactDefinitionProvider,
           artefactDataProvider,
           artefactProvider,
           locationResolver,
           gitIgnore,
           markdownDocumentProvider };
}
