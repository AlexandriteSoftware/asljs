import { ArtefactDefinitionRule }
  from './artefact-definition-rule.js';
import { Location }
  from './location.js';

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
  locations: Location[];

  /**
   * Defines rules that are defined by this artefact definition.
   */
  rules: ArtefactDefinitionRule[];
}
