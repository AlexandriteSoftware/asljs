import ignore
  from 'ignore';
import { readFileSync,
         statSync }
  from 'node:fs';
import path
  from 'node:path';
import { toPosixPath }
  from '../formatting.js';
import { Logger }
  from '../logging/logging.js';

export class GitIgnore
{
  private logger: Logger;
  private matchers: Array<{ path: string; matcher: ignore.Ignore; }>;
  private visitedPaths: Set<string>;

  constructor(
    logger: Logger
  )
  {
    this.logger = logger;
    this.matchers = [];
    this.visitedPaths = new Set();
  }

  isIgnored(
    targetPath: string
  ): boolean
  {
    if (!path.isAbsolute(targetPath)) {
      throw new Error(
        `Path must be absolute: ${targetPath}`
      );
    }

    const isDirectory =
      targetPath.endsWith(
        path.sep);

    const normalisedPath =
      path.normalize(
        targetPath);

    if (isDirectory) {
      this.loadMatchers(
        normalisedPath);
    } else {
      this.loadMatchers(
        path.dirname(
          normalisedPath));
    }

    for (const matcher of this.matchers) {
      const relativePath =
        toPosixPath(
          path.relative(
            matcher.path,
            normalisedPath));

      if (
        relativePath === ''
        || relativePath.startsWith('../')
      ) {
        continue;
      }

      const testRelativePath =
        isDirectory
        ? relativePath + '/'
        : relativePath;

      if (
        matcher.matcher.ignores(
          testRelativePath)
      ) {
        return true;
      }
    }

    return false;
  }

  filter(
    paths: string[]
  ): string[]
  {
    return paths.filter(
      filePath => !this.isIgnored(filePath));
  }

  loadMatchers(
    directoryPath: string
  ): void
  {
    if (this.visitedPaths.has(directoryPath)) {
      return;
    }

    this.visitedPaths
      .add(
        directoryPath);

    const gitIgnorePath =
      path.join(
        directoryPath,
        '.gitignore');

    let gitIgnoreExists = false;

    try {
      statSync(gitIgnorePath);
      gitIgnoreExists = true;
    } catch (err) {
      const code =
        (err as NodeJS.ErrnoException).code;

      if (code !== 'ENOENT') {
        throw err;
      }
    }

    if (gitIgnoreExists) {
      const gitIgnoreContent =
        readFileSync(
          gitIgnorePath,
          'utf8');

      const matcher =
        ignore()
        .add(
          gitIgnoreContent);

      this.matchers.push(
        { path: directoryPath, matcher });
    }

    const parentPath =
      path.dirname(
        directoryPath);

    if (parentPath !== directoryPath) {
      this.loadMatchers(
        parentPath);
    }
  }
}
