/**
 * Project artefact.
 */
export interface Artefact
{
  /**
   * Artefact's location, a URI string with a scheme, e.g.
   * `file:docs/Article.md` or `git:tag/v1.0.0`. Together with a definition it
   * uniquely identifies the artefact. See [location.ts][1].
   *
   * [1]: ../location.ts
   */
  location: string;

  /**
   * Artefact's name. For `file:` artefacts, the file name without extension.
   */
  name: string;

  /**
   * Definition names, this artefact matches. See [ArtefactDefinition][1].
   *
   * [1]: ./artefact-definition.ts
   */
  definitions: string[];
}
