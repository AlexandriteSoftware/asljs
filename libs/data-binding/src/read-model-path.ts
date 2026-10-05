import { DataModel }
  from './types.js';

export function readModelPath(
    model: DataModel,
    path: string
  ): unknown
{
  if (path === '') {
    return null;
  }

  return readNestedPath(
    model,
    path);
}

/**
 * Returns the object that holds the value at `path`: the model itself for a
 * single-segment path, otherwise the value at the path without its last
 * segment, read by the same rules as `readModelPath`. An event binding calls
 * its action with this object as `this`.
 */
export function readModelPathOwner(
    model: DataModel,
    path: string
  ): unknown
{
  const parts =
    splitPath(path);

  if (parts.length <= 1) {
    return model;
  }

  return readModelPath(
    model,
    parts.slice(
      0,
      -1).join('.'));
}

function readNestedPath(
    source: object,
    path: string
  ): unknown
{
  const parts =
    splitPath(path);

  let current: unknown = source;

  for (const part of parts) {
    if (
      typeof current
      !== 'object'
      || current === null
      || !(part in current)
    ) {
      return null;
    }

    current =
      (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Splits a binding path into its trimmed segments, by the rule `observe().at()`
 * in `asljs-observable` applies: every segment must be non-empty, so `user.`,
 * `user..name` and `.user` throw a `TypeError`. An empty path has no segments.
 *
 * The binding parsers call it on every path, so a malformed path fails when
 * the template is bound, the same way for a plain and an observable model.
 */
export function splitPath(
    path: string
  ): string[]
{
  if (path.trim() === '') {
    return [ ];
  }

  const segments =
    path
    .split('.')
    .map(
      segment => segment.trim());

  if (segments.includes('')) {
    throw new TypeError(
      `Expect path segments to be non-empty: '${path}'.`);
  }

  return segments;
}
