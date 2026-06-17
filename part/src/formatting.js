/**
 * @param {string} path
 * @returns {string}
 */
export function toPosixPath(
  path)
{
  const posixPath =
    path.replaceAll(
      '\\',
      '/');

  return posixPath;
}
