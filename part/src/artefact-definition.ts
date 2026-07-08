import { Location }
  from './location.js';

/**
 * Artefact definition rule.
 */
export interface ArtefactDefinitionRule {
  /**
   * An identifier, uniquely and invariably identifying the artefact definition
   * rule among other rules.
   */
  id: string;

  /**
   * An identifier, uniquely and invariably identifying the artefact definition
   * rule among other rules. Usually, artefact definition name concatenated with
   * rule id.
   */
  name: string;

  /**
   * Name of the artefact definition this rule belongs to.
   */
  definition: string;

  /**
   * A description of the artefact definition rule.
   * 
   * @remarks
   * Usually, the list item or section in the artefact definition file that
   * defines the rule.
   */
  description: string;
}

/**
 * Artefact definition.
 */
export interface ArtefactDefinition {
  /**
   * Artefact definition full path.
   */
  path: string;

  /**
   * Artefact definition name. Usually the name of the artefact definition file
   * without extension.
   */
  name: string;

  /**
   * Artefact definition description.
   * 
   * @remarks
   * The description is usually the content of the first section of the artefact
   * definition file.
   */
  description: string;

  /**
   * Defines location of artefacts that are defined by this artefact definition.
   */
  location: Location;

  /**
   * Defines rules that are defined by this artefact definition.
   */
  rules: ArtefactDefinitionRule[];
}
