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
   * Property type, without the `[]` and `?` suffixes.
   *
   * Documented types are: String, Number, Boolean, Date, DateTime, Timestamp,
   * Object, Artefact.
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
