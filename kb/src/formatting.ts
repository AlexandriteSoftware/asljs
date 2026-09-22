/**
 * Convert a path to its POSIX form, so that library paths are stable across
 * platforms.
 */
export function toPosixPath(
    value: string
  ): string
{
  return value.replaceAll(
    '\\',
    '/');
}

/**
 * Normalise an option value, by trimming whitespace and returning an empty
 * string for non-string values.
 */
export function filterStringOption(
    value: unknown
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

/**
 * Convert a comma-separated option value into an array of trimmed strings,
 * ignoring empty entries.
 */
export function splitCommaSeparatedOption(
    value: unknown
  ): string[]
{
  if (
    typeof value
    !== 'string'
    || value.trim() === ''
  ) {
    return [ ];
  }

  return value
    .split(',')
    .map(
      entry => entry.trim())
    .filter(
      entry => entry.length > 0);
}

/**
 * Message of a failure, whatever was thrown.
 */
export function messageOf(
    error: unknown
  ): string
{
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
