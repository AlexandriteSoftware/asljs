// @ts-check

/**
 * @typedef ArtefactDefinitionLocationFilter
 * @property {string} name
 */

/**
 * @typedef ArtefactDefinitionLocation
 * @property {string[]} patterns
 * @property {string[]} exclude
 * @property {ArtefactDefinitionLocationFilter[]} filters
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
 * @property {ArtefactDefinitionLocation} location
 * @property {string} properties
 * @property {ArtefactDefinitionRule[]} rules
 * @property {string} propertyDefinitions
 * @property {string} ruleIds
 */

export { };
