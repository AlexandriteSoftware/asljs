import { DataModel }
  from './types.js';

/**
 * Reads the value at `path` by the rules the `observe().at()` query of
 * `asljs-observable` reads it, so a plain model renders what an observable one
 * would: each segment is read from an object or a function, through its
 * prototype chain, and a path that does not resolve reads `undefined`. An
 * empty path reads `undefined` too.
 */
export function readModelPath(
    model: DataModel,
    path: string
  ): unknown
{
  if (path === '') {
    return undefined;
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
      !isObject(current)
      || !(part in current)
    ) {
      return undefined;
    }

    current =
      (current as Record<string, unknown>)[part];
  }

  return current;
}

function isObject(
    value: unknown
  ): value is object
{
  return (
    typeof value === 'object'
    && value !== null
  )
    || typeof value === 'function';
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
