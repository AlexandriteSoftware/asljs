export function toPosixPath(
    path: string
  ): string
{
  const posixPath =
    path.replaceAll(
      '\\',
      '/');

  return posixPath;
}
