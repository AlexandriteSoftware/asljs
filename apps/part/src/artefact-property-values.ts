import path
  from 'node:path';
import { fromFileLocation,
         hasScheme,
         toFileLocation }
  from './location.js';

/**
 * Whether a definition property type, `Artefact` or `Artefact[]` in any
 * case, holds references to artefacts.
 */
export function isArtefactPropertyType(
    type: string
  ): boolean
{
  const normalised =
    type.trim().replaceAll(
      '`',
      '').toLowerCase();

  return normalised === 'artefact'
    || normalised === 'artefact[]';
}

/**
 * The string values of a reference property; nothing when the value is
 * missing or of another type.
 */
export function getArtefactPropertyValues(
    data: unknown,
    propertyName: string
  ): string[]
{
  const value =
    getPropertyValue(
      data,
      propertyName);

  if (
    typeof value
    === 'string'
  ) {
    return [ value ];
  }

  if (Array.isArray(value)) {
    return value
      .filter(
        entry => typeof entry === 'string')
      .map(
        entry => entry as string);
  }

  return [ ];
}

/**
 * A property value from artefact data, keyed by the property name or by its
 * camel-case form, e.g. `RelatedArticles` or `relatedArticles`.
 */
export function getPropertyValue(
    data: unknown,
    propertyName: string
  ): unknown
{
  if (
    !data
    || typeof data
       !== 'object'
  ) {
    return undefined;
  }

  const record =
    data as Record<string, unknown>;

  return record[propertyName]
    ?? record[toPropertyKey(propertyName)];
}

/**
 * The location a reference property value points at, or `null` when it
 * resolves outside the project. A reference with a scheme is a location. Any other reference is a path
 * relative to the referencing `file:` artefact.
 */
export function resolveReferencedLocation(
    projectPath: string,
    sourceLocation: string,
    reference: string
  ): string | null
{
  if (hasScheme(reference)) {
    return reference;
  }

  const sourcePath =
    fromFileLocation(
      projectPath,
      sourceLocation);

  if (sourcePath === null) {
    return null;
  }

  const resolvedPath =
    path.resolve(
      path.dirname(sourcePath),
      reference);

  const relativePath =
    path.relative(
      projectPath,
      resolvedPath);

  if (relativePath.startsWith('..')) {
    return null;
  }

  return toFileLocation(
    projectPath,
    resolvedPath);
}

function toPropertyKey(
    propertyName: string
  ): string
{
  const parts =
    propertyName.trim().split(
      /[^A-Za-z0-9]+/)
    .filter(
      part => part.length > 0);

  if (parts.length === 0) {
    return propertyName.trim();
  }

  return parts
    .map(
      (part, index) =>
        index === 0
          ? part.charAt(0).toLowerCase() + part.slice(1)
          : part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
