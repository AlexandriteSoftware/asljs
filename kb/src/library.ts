import path
  from 'node:path';
import { toPosixPath }
  from './formatting.js';

/**
 * Raised when a path cannot be used, because it is empty, or because it
 * resolves outside of the library root.
 */
export class LibraryPathError
  extends Error
{
  constructor(
      message: string
    )
  {
    super(message);

    this.name = 'LibraryPathError';
  }
}

/**
 * Resolve a library-relative path into an absolute path.
 *
 * Absolute inputs are accepted, as long as they stay inside the library.
 * Any path that escapes the library root is rejected.
 */
export function resolveLibraryPath(
    root: string,
    value: string
  ): string
{
  if (
    typeof value
    !== 'string'
    || value.trim() === ''
  ) {
    throw new LibraryPathError(
      'Path must be a non-empty string.');
  }

  const resolved =
    path.resolve(
      root,
      value.trim());

  if (
    !isInsideLibrary(
      root,
      resolved)
  ) {
    throw new LibraryPathError(
      `Path is outside of the library: ${toPosixPath(
        value.trim())}`);
  }

  return resolved;
}

/**
 * Convert an absolute path into a library-relative POSIX path. The library
 * root itself is reported as `.`.
 */
export function toLibraryPath(
    root: string,
    value: string
  ): string
{
  const resolved =
    path.resolve(value);

  if (
    !isInsideLibrary(
      root,
      resolved)
  ) {
    throw new LibraryPathError(
      `Path is outside of the library: ${toPosixPath(value)}`);
  }

  const relative =
    path.relative(
      root,
      resolved);

  if (relative === '') {
    return '.';
  }

  return toPosixPath(relative);
}

/**
 * Check whether an absolute path is the library root or one of its
 * descendants.
 */
export function isInsideLibrary(
    root: string,
    value: string
  ): boolean
{
  const normalizedRoot =
    path.resolve(root);

  const normalizedValue =
    path.resolve(value);

  if (normalizedValue === normalizedRoot) {
    return true;
  }

  return normalizedValue.startsWith(
    withTrailingSeparator(normalizedRoot));
}

/**
 * Resolve the library root.
 *
 * The explicit value wins, then the `KB_LIBRARY` environment variable, then
 * the working directory.
 */
function trimmed(
    value: string | null | undefined
  ): string
{
  if (
    typeof value
    !== 'string'
  ) {
    return '';
  }

  return value.trim();
}

function withTrailingSeparator(
    value: string
  ): string
{
  if (value.endsWith(path.sep)) {
    return value;
  }

  return `${value}${path.sep}`;
}

export function resolveLibraryRoot(
    cwd: string,
    value?: string | null
  ): string
{
  const explicit =
    trimmed(value);

  if (explicit !== '') {
    return path.normalize(
      path.resolve(
        cwd,
        explicit));
  }

  const variable =
    (process.env.KB_LIBRARY ?? '').trim();

  if (variable !== '') {
    return path.normalize(
      path.resolve(
        cwd,
        variable));
  }

  return path.normalize(cwd);
}
