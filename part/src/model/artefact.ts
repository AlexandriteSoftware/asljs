/**
 * Project artefact.
 */
export interface Artefact
{
  /**
   * Artefact's name. Usually the name of the artefact file without extension.
   */
  name: string;

  /**
   * Artefact's full path.
   */
  path: string;

  /**
   * Artefact's relative path, from the base path.
   */
  basePath: string;

  /**
   * Artefact's base path. Usually the project root path.
   */
  relativePath: string;

  /**
   * Definition names, this artefact matches. See [ArtefactDefinition][1].
   * 
   * [1]: ./artefact-definition.ts
   */
  definitions: string[];
}
