import { type Logger }
  from 'asljs-logging';
import { glob }
  from 'glob';
import { minimatch }
  from 'minimatch';
import path
  from 'node:path';
import { GitIgnore }
  from './git-ignore.js';

/**
 * A named filter applied to the matches, rather than a pattern.
 *
 * `GitIgnore` is the only one implemented: it drops whatever git would ignore.
 */
export interface LocationFilter
{
  name: string;
}

/**
 * Where a set of files lives.
 *
 * A pattern beginning with `/` is resolved against the root the resolver was
 * built with; any other pattern is resolved against the base path passed to
 * the call. That is what lets a definition name a repository-wide location and
 * a location relative to itself in the same vocabulary.
 *
 * Give either `pattern` for one or `patterns` for several; both are accepted
 * and read as one list.
 */
export interface Location
{
  pattern?: string;
  patterns?: string[];
  exclude?: string[];
  filters?: LocationFilter[];
}

/** The patterns of a location, however they were given. */
export function toPatterns(
    location: Location
  ): string[]
{
  const patterns =
    [ ...location.pattern === undefined
      ? [ ]
      : [ location.pattern ],
      ...location.patterns
      ?? [ ] ];

  if (patterns.length === 0) {
    throw new Error(
      'A location needs a pattern or patterns.');
  }

  return patterns;
}

/**
 * Patterns match files only. A pattern ending with `/` would name folders,
 * which `resolve` and `check` cannot treat alike, so it is refused.
 */
function assertFilePatterns(
    patterns: readonly string[]
  ): void
{
  const folderPattern =
    patterns.find(
      pattern => pattern.endsWith('/'));

  if (folderPattern !== undefined) {
    throw new Error(
      `Folder patterns are not supported: "${folderPattern}". Point the pattern at a file, e.g. "${folderPattern}package.json".`);
  }
}

function toLocations(
    location: Location | readonly Location[]
  ): readonly Location[]
{
  return Array.isArray(location)
    ? location
    : [ location as Location ];
}

export class LocationResolver
{
  private logger: Logger;
  private rootPath: string;
  private gitIgnore: GitIgnore;

  constructor(
    logger: Logger,
    rootPath: string
  )
  {
    this.logger = logger;

    this.rootPath =
      path.normalize(
        path.resolve(rootPath));

    this.gitIgnore =
      new GitIgnore(
        this.logger);
  }

  /**
   * Every path the locations match, deduplicated and sorted.
   */
  async resolve(
    basePath: string,
    location: Location | readonly Location[]
  ): Promise<string[]>
  {
    const results: string[] = [ ];

    for (const one of toLocations(location)) {
      const resolved =
        await this.resolveOne(
          basePath,
          one);

      results.push(
        ...resolved);
    }

    const unique =
      [ ...new Set(results) ];

    unique.sort(
      (a, b) => a.localeCompare(b));

    return unique;
  }

  /**
   * Whether the target path belongs to any of the locations.
   *
   * This answers the question without walking the filesystem, which is what
   * makes it usable per file.
   */
  async check(
    targetPath: string,
    basePath: string,
    location: Location | readonly Location[]
  ): Promise<boolean>
  {
    for (const one of toLocations(location)) {
      const matched =
        await this.checkOne(
          targetPath,
          basePath,
          one);

      if (matched) {
        return true;
      }
    }

    return false;
  }

  private async resolveOne(
    basePath: string,
    location: Location
  ): Promise<string[]>
  {
    const patterns =
      toPatterns(location);

    const exclude =
      location.exclude
      ?? [ ];

    const filters =
      location.filters
      ?? [ ];

    this.logger.trace(
      'LocationResolver.resolve(%s, %s)',
      basePath,
      JSON.stringify(location));

    const normalisedBasePath =
      path.normalize(
        path.resolve(basePath));

    assertFilePatterns(
      [ ...patterns,
        ...exclude ]);

    const matches =
      new Set(
        await this.expand(
          patterns,
          normalisedBasePath));

    for (
      const excluded of await this.expand(
        exclude,
        normalisedBasePath)
    ) {
      matches.delete(excluded);
    }

    const result =
      this.applyFilters(
        [ ...matches ],
        filters);

    result.sort(
      (a, b) => a.localeCompare(b));

    this.logger.trace(
      'LocationResolver.resolve() => %d matches',
      result.length);

    return result;
  }

  private async checkOne(
    targetPath: string,
    basePath: string,
    location: Location
  ): Promise<boolean>
  {
    const patterns =
      toPatterns(location);

    const exclude =
      location.exclude
      ?? [ ];

    const filters =
      location.filters
      ?? [ ];

    assertFilePatterns(
      [ ...patterns,
        ...exclude ]);

    const normalisedTargetPath =
      path.normalize(
        path.resolve(targetPath));

    const normalisedBasePath =
      path.normalize(
        path.resolve(basePath));

    const matchesPattern =
      (
          pattern: string
        ): boolean =>
      {
      const anchored =
        pattern.startsWith('/');

      const relativePath =
        path.relative(
          anchored
          ? this.rootPath
          : normalisedBasePath,
          normalisedTargetPath);

      return minimatch(
        relativePath,
        anchored
          ? pattern.slice(1)
          : pattern,
        { dot: true });
    };

    if (
      !patterns.some(
        matchesPattern)
    ) {
      return false;
    }

    if (
      exclude.some(
        matchesPattern)
    ) {
      return false;
    }

    const result =
      this.applyFilters(
        [ normalisedTargetPath ],
        filters);

    return result.length > 0;
  }

  /**
   * The absolute paths the patterns match.
   *
   * A pattern beginning with `/` is expanded from the root, the rest from the
   * base path, so one call can carry both kinds.
   *
   * Dotfiles are matched, because `check` matches them and the two have to
   * agree: without it a path such as `.remarkrc.mjs` would be reported as
   * belonging to a location that never finds it.
   */
  private async expand(
    patterns: readonly string[],
    basePath: string
  ): Promise<string[]>
  {
    const matches: string[] = [ ];

    const rootPatterns =
      patterns
      .filter(
        pattern => pattern.startsWith('/'))
      .map(
        pattern => pattern.slice(1));

    if (rootPatterns.length > 0) {
      matches.push(
        ...await glob(
          rootPatterns,
          { cwd: this.rootPath,
            absolute: true,
            dot: true,
            nodir: true }));
    }

    const basePatterns =
      patterns.filter(
        pattern => !pattern.startsWith('/'));

    if (basePatterns.length > 0) {
      matches.push(
        ...await glob(
          basePatterns,
          { cwd: basePath,
            absolute: true,
            dot: true,
            nodir: true }));
    }

    return matches;
  }

  private applyFilters(
    paths: string[],
    filters: readonly LocationFilter[]
  ): string[]
  {
    let result = paths;

    for (const filter of filters) {
      switch (filter.name) {
        case 'GitIgnore':
          result =
            this.gitIgnore.filter(
              result);
          break;

        default:
          throw new Error(
            `Unknown filter: ${filter.name}`);
      }
    }

    return result;
  }
}
