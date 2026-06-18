import { ArtefactDataProvider }
  from './providers/artefact-data-provider.js';
import { ArtefactProvider }
  from './providers/artefact-provider.js';
import { DefinitionProvider }
  from './providers/definition-provider.js';
import { MarkdownDocumentProvider }
  from './providers/markdown-document-provider.js';

/**
 * @typedef
 *   { import('./artefact.js')
 *       .Artefact }
 *   Artefact
 * @typedef
 *   { import('./logging.js')
 *       .Logger }
 *   Logger
 */

/**
 * @typedef RuleValidationContext
 * @property {Logger} logger
 * @property {ArtefactProvider} artefacts
 * @property {ArtefactDataProvider} artefactData
 * @property {DefinitionProvider} definitions
 * @property {MarkdownDocumentProvider} markdownDocuments
 */

/**
 * @typedef
 *  { (artefact: Artefact,
 *     context: RuleValidationContext)
 *    => Promise<void> } RuleValidationFunction
 */

/**
 * @param {Logger} logger
 * @param {string} rootDirectoryPath
 * @returns {RuleValidationContext}
 */
export function createRuleValidationContext(
  logger,
  rootDirectoryPath)
{
  const definitionProvider =
    new DefinitionProvider(
      logger,
      rootDirectoryPath);

  const artefactProvider =
    new ArtefactProvider(
      logger,
      rootDirectoryPath,
      definitionProvider);

  const artefactDataProvider =
    new ArtefactDataProvider(
      logger,
      rootDirectoryPath);

  const markdownDocumentProvider =
    new MarkdownDocumentProvider();

  const context =
    { logger,
      definitions: definitionProvider,
      artefacts: artefactProvider,
      artefactData: artefactDataProvider,
      markdownDocuments: markdownDocumentProvider };

  return context;
}
