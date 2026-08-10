/**
 * Artefact definition property.
 */
export interface ArtefactDefinitionProperty
{
  /**
   * Property name.
   */
  name: string;

  /**
   * Property type.
   *
   * Supported types are: string, number, boolean, array, object.
   */
  type: string;

  /**
   * Property is a list.
   */
  isList: boolean;

  /**
   * Property is nullable.
   */
  isNullable: boolean;

  /**
   * Property description.
   */
  description: string;
}
