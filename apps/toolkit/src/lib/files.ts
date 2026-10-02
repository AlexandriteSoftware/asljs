import { type Location,
         LocationResolver }
  from 'asljs-locator';
import { type Logger }
  from 'asljs-logging';
import path
  from 'node:path';

/** What to look for, and what to leave out. */
export interface FileSelection
{
  includes: string[];
  excludes: string[];
}

/**
 * The patterns a selection turns into.
 *
 * A pattern naming a directory is expanded to its subtree as well, so `apps`
 * means the directory and everything in it rather than a file of that name.
 * With nothing to include, everything is a candidate.
 */
export function toPatterns(
    patterns: readonly string[],
    fallback: string
  ): string[]
{
  if (patterns.length === 0) {
    return [ fallback ];
  }

  return patterns.flatMap(
    (
        pattern
      ) =>
    {
      const trimmed =
        pattern
        .replaceAll(
          '\\',
          '/')
        .replace(
          /\/+$/,
          '');

      return [ trimmed,
               `${trimmed}/**` ];
    });
}

/**
 * The files a selection matches, relative to `cwd` and sorted.
 *
 * Paths are returned relative because that is what a command line and a dprint
 * `includes` entry want, and absolute paths would differ per machine in a
 * generated configuration.
 */
export async function locateFiles(
    logger: Logger,
    cwd: string,
    selection: FileSelection
  ): Promise<string[]>
{
  const location: Location =
    { patterns:
        toPatterns(
          selection.includes,
          '**/*'),
      exclude:
        toPatterns(
          selection.excludes,
          ''),
      filters:
        [ { name: 'GitIgnore' } ] };

  if (selection.excludes.length === 0) {
    delete location.exclude;
  }

  const resolver =
    new LocationResolver(
      logger,
      cwd);

  const absolutePaths =
    await resolver.resolve(
      cwd,
      location);

  return absolutePaths
    .map(
      absolutePath =>
        path.relative(
          cwd,
          absolutePath)
          .replaceAll(
            '\\',
            '/'))
    .sort();
}

/** The files grouped by the extension that decides how they are handled. */
export function groupByExtension(
    filePaths: readonly string[],
    extensions: readonly string[]
  ): string[]
{
  const wanted =
    new Set(
      extensions.map(
        extension => extension.toLowerCase()));

  return filePaths.filter(
    filePath =>
      wanted.has(
        path.extname(filePath)
          .toLowerCase()));
}
