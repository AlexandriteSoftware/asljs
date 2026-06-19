/**
 * @typedef
 *   { import('./location.js')
 *       .Location }
 *   Location
 */

/**
 * @typedef ArtefactDefinitionRule
 * @property {string} id
 * @property {string} name
 * @property {string} definition
 * @property {string} description
 * @property {string?} path
 */

/**
 * @typedef ArtefactDefinition
 * @property {string} path
 * @property {string} name
 * @property {string} description
 * @property {Location} location
 * @property {ArtefactDefinitionRule[]} rules
 */

export { };
