import path
  from 'node:path';
import { readFileSync }
  from 'node:fs';
import { globSync }
  from 'glob';
import ignore
  from 'ignore';

export class GitIgnore
{
  constructor(
    logger,
    rootPath)
  {
    this.logger = logger;
    this.rootPath = path.resolve(rootPath);

    this.matchers =
      loadMatchers(
        this.logger,
        this.rootPath);
  }

  isIgnored(
    targetPath)
  {
    const absolutePath =
      path.resolve(
        this.rootPath,
        targetPath);

    if (!isInsideRoot(
      this.rootPath,
      absolutePath)) {
      return false;
    }

    for (const matcher of this.matchers) {
      const relativePath =
        toPosixPath(
          path.relative(
            matcher.basePath,
            absolutePath));

      if (relativePath === ''
          || relativePath.startsWith('../'))
      {
        continue;
      }

      if (
        matcher.matcher.ignores(relativePath)
        || matcher.matcher.ignores(
            `${relativePath}/`))
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
}

function loadMatchers(
  logger,
  rootPath)
{
  const gitIgnorePaths =
    globSync(
      '**/.gitignore',
      { absolute: true,
        cwd: rootPath,
        dot: true,
        nodir: true });

  const matchers =
    gitIgnorePaths.map(
      gitIgnorePath => {
        const basePath =
          path.dirname(gitIgnorePath);

        const gitIgnoreContent =
          readFileSync(
            gitIgnorePath,
            'utf8');

        const matcher =
          ignore().add(
            gitIgnoreContent);

        return {
          basePath,
          matcher
        };
      });

  logger.debug(
    `Loaded ${matchers.length} .gitignore file(s) from ${rootPath}`);

  return matchers;
}

/**
 * Checks if the target path is inside the root path.
 *
 * @param {string} rootPath - The root path. Should be an absolute path.
 * @param {string} targetPath - The target path to check.
 * @returns {boolean} - True if the target path is inside the root path, false
 *                      otherwise.
 */
function isInsideRoot(
  rootPath,
  targetPath)
{
  if (!path.isAbsolute(rootPath)) {
    throw new Error(
      `'rootPath' must be absolute.`);
  }

  const absoluteTargetPath =
    path.resolve(
      rootPath,
      targetPath);

  const relativePath =
    path.relative(
      rootPath,
      absoluteTargetPath);

  return relativePath === ''
         || (!relativePath.startsWith('..')
             && !path.isAbsolute(relativePath));
}

function toPosixPath(
  value)
{
  return value.replaceAll(
    '\\',
    '/');
}