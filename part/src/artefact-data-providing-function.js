/**
 * @typedef
 *   { import('./artefact.js')
 *       .Artefact }
 *   Artefact
 * @typedef
 *   { import('./artefact-definition.js')
 *       .ArtefactDefinition }
 *   ArtefactDefinition
 * @typedef
 *   { import('./providers/markdown-document-provider.js')
 *       .MarkdownDocumentProvider }
 *   MarkdownDocumentProvider
 * @typedef
 *   { import('./logging.js')
 *       .Logger }
 *   Logger
 */

/**
 * @typedef {Object} ArtefactDataProvidingContext
 * @property {Logger} logger
 * @property {MarkdownDocumentProvider} markdownDocuments
 */

/**
 * @typedef
 *   { (artefact: Artefact,
 *      context: ArtefactDataProvidingContext)
 *     => Promise<any> } ArtefactDataProvidingFunction
 */

export { };