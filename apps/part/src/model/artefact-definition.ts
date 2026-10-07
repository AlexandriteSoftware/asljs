import { type Location }
  from 'asljs-locator';
import { ArtefactDefinitionProperty }
  from './artefact-definition-property.js';
import { ArtefactDefinitionRule }
  from './artefact-definition-rule.js';

/**
 * Artefact definition.
 */
export interface ArtefactDefinition
{
  /**
   * Artefact definition document full path. Absent for definitions provided
   * by plugins.
   */
  path?: string;

  /**
   * Where the definition comes from: `markdown` for definition documents, or
   * the name of the plugin that provided it.
   */
  source: string;

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

  /**
   * Defines properties that are returned by the artefact data provider.
   */
  properties: ArtefactDefinitionProperty[];
}
