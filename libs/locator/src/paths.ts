/** A path with forward slashes, which is what glob and .gitignore expect. */
export function toPosixPath(
    filePath: string
  ): string
{
  return filePath.replaceAll(
    '\\',
    '/');
}
