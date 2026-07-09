/**
 * Artefact definition rule.
 */
export interface ArtefactDefinitionRule
{
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
   * A title of the artefact definition rule. Usually, the the section heading.
   */
  heading: string;

  /**
   * A description of the artefact definition rule.
   *
   * @remarks
   * Usually, the list item or section in the artefact definition file that
   * defines the rule.
   */
  content: string;
}
