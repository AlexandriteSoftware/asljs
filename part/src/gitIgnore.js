import path from 'node:path';
import { readFileSync } from 'node:fs';

import { globSync } from 'glob';
import ignore from 'ignore';

export class GitIgnore
{
  constructor(rootPath)
  {
    this.rootPath = path.resolve(rootPath);
    this.matchers = loadMatchers(this.rootPath);
  }

  isIgnored(targetPath)
  {
    const absolutePath = toAbsolutePath(this.rootPath, targetPath);

    if (!isInsideRoot(this.rootPath, absolutePath)) {
      return false;
    }

    for (const matcher of this.matchers) {
      const relativePath = toPosixPath(path.relative(matcher.basePath, absolutePath));

      if (relativePath === '' || relativePath.startsWith('../')) {
        continue;
      }

      if (matcher.matcher.ignores(relativePath) || matcher.matcher.ignores(`${relativePath}/`)) {
        return true;
      }
    }

    return false;
  }

  filter(paths)
  {
    return paths.filter((filePath) => !this.isIgnored(filePath));
  }
}

function loadMatchers(rootPath)
{
  const gitIgnorePaths = globSync('**/.gitignore', {
    absolute: true,
    cwd: rootPath,
    dot: true,
    nodir: true,
  });

  return gitIgnorePaths.map((gitIgnorePath) => ({
    basePath: path.dirname(gitIgnorePath),
    matcher: ignore().add(readFileSync(gitIgnorePath, 'utf8')),
  }));
}

function toAbsolutePath(rootPath, targetPath)
{
  return path.isAbsolute(targetPath)
    ? path.resolve(targetPath)
    : path.resolve(rootPath, targetPath);
}

function isInsideRoot(rootPath, targetPath)
{
  const relativePath = path.relative(rootPath, targetPath);
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function toPosixPath(value)
{
  return value.replaceAll('\\', '/');
}