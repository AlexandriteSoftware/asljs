import { glob }
  from 'glob';
import { minimatch }
  from 'minimatch';
import path
  from 'node:path';
import { Logger }
  from '../logging/logging.js';
import { Location }
  from '../model/location.js';
import { GitIgnore }
  from './git-ignore.js';

interface FilesystemLocationResolverFilter
{
  name: string;
}

export class FilesystemLocationResolver
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

    this.rootPath = path.normalize(
      path.resolve(rootPath)
    );

    this.gitIgnore = new GitIgnore(
      this.logger
    );
  }

  async resolve(
    basePath: string,
    locations: Location[]
  ): Promise<string[]>
  {
    const results: string[] = [];

    for (const location of locations) {
      const resolved =
        await this.resolveLocation(
          basePath,
          location);

      results.push(
        ...resolved
      );
    }

    const uniqueResults =
      [...new Set(results)];

    uniqueResults.sort(
      (a, b) => a.localeCompare(b)
    );

    return uniqueResults;
  }

  async resolveLocation(
    basePath: string,
    location: Location
  ): Promise<string[]>
  {
    const pattern =
      location.pattern;

    const exclude =
      location.exclude || [];

    const filters =
      location.filters || [];

    this.logger.trace(
      'FilesystemLocationResolver.resolve(%s, %s)',
      basePath,
      JSON.stringify(location)
    );

    const normalisedBasePath =
      path.normalize(
        path.resolve(basePath));

    const filesOnly =
      !pattern.endsWith('/');

    const directoriesOnly =
      pattern.endsWith('/');

    if (
      !filesOnly
      && !directoriesOnly
    ) {
      throw new Error(
        `Patterns must be either all files or all directories`
      );
    }

    const matches =
      new Set<string>();

    const rootPathPatterns =
      [pattern]
      .filter(
        (pattern) => pattern.startsWith('/')
      )
      .map(
        (pattern) => pattern.slice(1)
      );

    if (rootPathPatterns.length > 0) {
      const rootPathMatches =
        await glob(
          rootPathPatterns,
          {
          cwd: this.rootPath,
          absolute: true,
          nodir: filesOnly
        });

      for (const match of rootPathMatches) {
        matches.add(match);
      }
    }

    const basePathPatterns =
      [pattern]
      .filter(
        (pattern) => !pattern.startsWith('/')
      );

    if (basePathPatterns.length > 0) {
      const basePathMatches =
        await glob(
          basePathPatterns,
          {
          cwd: normalisedBasePath,
          absolute: true,
          nodir: filesOnly
        });

      this.logger.trace(
        'FilesystemLocationResolver.resolve() => %d in %s',
        basePathMatches.length,
        normalisedBasePath
      );

      for (const match of basePathMatches) {
        matches.add(match);
      }
    }

    const rootExcludePatterns =
      exclude
      .filter(
        (pattern) => pattern.startsWith('/')
      )
      .map(
        (pattern) => pattern.slice(1)
      );

    if (rootExcludePatterns.length > 0) {
      const rootExcludeMatches =
        await glob(
          rootExcludePatterns,
          { cwd: this.rootPath, absolute: true, nodir: filesOnly });

      for (const match of rootExcludeMatches) {
        matches.delete(match);
      }
    }

    const basePathExcludePatterns =
      exclude
      .filter(
        (pattern) => !pattern.startsWith('/')
      );

    if (basePathExcludePatterns.length > 0) {
      const basePathExcludeMatches =
        await glob(
          basePathExcludePatterns,
          { cwd: normalisedBasePath, absolute: true, nodir: filesOnly });

      for (const match of basePathExcludeMatches) {
        matches.delete(match);
      }
    }

    let result =
      [...matches];

    for (const filter of filters) {
      switch (filter.name) {
        case 'GitIgnore':
          result = this.gitIgnore
            .filter(
              result
            );
          break;
        default:
          throw new Error(
            `Unknown filter: ${filter.name}`
          );
      }
    }

    result.sort(
      (a, b) => a.localeCompare(b)
    );

    this.logger.trace(
      'FilesystemLocationResolver.resolve() => %d matches',
      result.length
    );

    return result;
  }

  async check(
    targetPath: string,
    basePath: string,
    locations: Location[]
  ): Promise<boolean>
  {
    for (const location of locations) {
      const match =
        await this.checkLocation(
          targetPath,
          basePath,
          location);

      if (match) {
        return true;
      }
    }

    return false;
  }

  async checkLocation(
    targetPath: string,
    basePath: string,
    location: Location
  ): Promise<boolean>
  {
    const patterns =
      location.pattern;

    const exclude =
      location.exclude || [];

    const filters =
      location.filters || [];

    const normalisedTargetPath =
      path.normalize(
        path.resolve(targetPath));

    const normalisedBasePath =
      path.normalize(
        path.resolve(basePath));

    const relativeToRoot =
      path.relative(
        this.rootPath,
        normalisedTargetPath);

    const relativeToBase =
      path.relative(
        normalisedBasePath,
        normalisedTargetPath);

    const included =
      [patterns].some(
        (pattern) =>
      {
        if (pattern.startsWith('/')) {
          return minimatch(
            relativeToRoot,
            pattern.slice(1),
            { dot: true }
          );
        }

        return minimatch(
          relativeToBase,
          pattern,
          { dot: true }
        );
      });

    if (!included) {
      return false;
    }

    const excluded =
      exclude.some(
        (pattern) =>
      {
        if (pattern.startsWith('/')) {
          return minimatch(
            relativeToRoot,
            pattern.slice(1),
            { dot: true }
          );
        }

        return minimatch(
          relativeToBase,
          pattern,
          { dot: true }
        );
      });

    if (excluded) {
      return false;
    }

    let result =
      [normalisedTargetPath];

    for (const filter of filters) {
      switch (filter.name) {
        case 'GitIgnore':
          result = this.gitIgnore
            .filter(result);
          break;

        default:
          throw new Error(
            `Unknown filter: ${filter.name}`
          );
      }
    }

    return result.length > 0;
  }
}
