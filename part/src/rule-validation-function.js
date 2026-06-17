/**
 * @typedef
 *   { import('./artefact.js')
 *       .Artefact }
 *   Artefact
 * @typedef
 *   { import('./providers/artefact-provider.js')
 *       .ArtefactProvider }
 *   ArtefactProvider
 * @typedef
 *   { import('./providers/definition-provider.js')
 *       .DefinitionProvider }
 *   DefinitionProvider
 * @typedef
 *   { import('./logging.js')
 *       .Logger }
 *   Logger
 */

/**
 * @typedef RuleValidationContext
 * @property {ArtefactProvider} artefacts
 * @property {DefinitionProvider} definitions
 * @property {Logger} logger
 */

/**
 * @typedef
 *  { (artefact: Artefact,
 *     context: RuleValidationContext)
 *    => Promise<void> } ruleValidationFunction
 */

export { };
