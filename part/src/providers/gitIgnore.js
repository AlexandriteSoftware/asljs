import path
  from 'node:path';
import { readFileSync,
         statSync }
  from 'node:fs';
import ignore
  from 'ignore';

export class GitIgnore
{
  constructor(
    logger)
  {
    this.logger = logger;
    this.matchers = [];
    this.visitedPaths = new Set();
  }

  isIgnored(
    targetPath)
  {
    const isDirectory =
      targetPath.endsWith(
        path.sep);

    const normalisedPath =
      path.normalize(
        path.resolve(
          this.rootPath,
          targetPath));

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

      if (relativePath === ''
          || relativePath.startsWith('../'))
      {
        continue;
      }

    const testRelativePath =
      isDirectory
        ? relativePath + '/'
        : relativePath;


      if (
        matcher.matcher.ignores(
          testRelativePath))
      {
        return true;
      }
    }

    return false;
  }

  filter(
    paths)
  {
    return paths.filter(
      filePath =>
        !this.isIgnored(filePath));
  }

  loadMatchers(
    normalisedPath)
  {
    if (this.visitedPaths.has(normalisedPath)) {
      return;
    }
    
    this.visitedPaths
      .add(
        normalisedPath);

    const gitIgnorePath =
      path.join(
        normalisedPath,
        '.gitignore');

    let gitIgnoreExists = false;

    try {
      statSync(gitIgnorePath);
      gitIgnoreExists = true;
    } catch (err) {
      if (err.code !== 'ENOENT') {
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
        { path: normalisedPath,
          matcher });
    }

    const parentPath =
      path.dirname(
        normalisedPath);

    if (parentPath !== normalisedPath) {
      this.loadMatchers(
        parentPath);
    }
  }
}

function toPosixPath(
  value)
{
  return value.replaceAll(
    '\\',
    '/');
}