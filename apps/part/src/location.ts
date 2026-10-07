import path
  from 'node:path';
import { toPosixPath }
  from './formatting.js';
import { Artefact }
  from './model/artefact.js';

/**
 * Scheme prefix of filesystem artefact locations.
 */
export const FILE_SCHEME = 'file:';

/**
 * Gives filesystem paths of `file:` artefacts.
 */
export interface ArtefactFiles
{
  /**
   * Absolute path of a `file:` artefact. Throws for any other scheme.
   */
  path(
    artefact: Pick<Artefact, 'location'>
  ): string;
}

/**
 * Whether the value starts with a URI scheme. A single letter followed by a
 * colon is a Windows drive, not a scheme.
 */
export function hasScheme(
    value: string
  ): boolean
{
  return /^[a-z][a-z0-9+.-]+:/i.test(value);
}

/**
 * Location of a file or directory inside the project: `file:` followed by the
 * POSIX path relative to the project root.
 */
export function toFileLocation(
    projectPath: string,
    absolutePath: string
  ): string
{
  const relativePath =
    toPosixPath(
      path.relative(
        projectPath,
        absolutePath));

  return `${FILE_SCHEME}${relativePath}`;
}

/**
 * Absolute path of a `file:` location, or `null` for any other scheme.
 */
export function fromFileLocation(
    projectPath: string,
    location: string
  ): string | null
{
  if (!location.startsWith(FILE_SCHEME)) {
    return null;
  }

  return path.resolve(
    projectPath,
    location.slice(FILE_SCHEME.length));
}

/**
 * Printed form of a location: the relative path for `file:` locations, the
 * full URI otherwise.
 */
export function displayLocation(
    location: string
  ): string
{
  return location.startsWith(FILE_SCHEME)
    ? location.slice(FILE_SCHEME.length)
    : location;
}

export function createArtefactFiles(
    projectPath: string
  ): ArtefactFiles
{
  return { path(
      artefact: Pick<Artefact, 'location'>
    ): string
    {
      const filePath =
        fromFileLocation(
          projectPath,
          artefact.location);

      if (filePath === null) {
        throw new Error(
          `Artefact is not a file: ${artefact.location}`);
      }

      return filePath;
    } };
}
