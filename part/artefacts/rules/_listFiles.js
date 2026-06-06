import path from 'node:path';

import { glob } from 'glob';

import { GitIgnore } from '../../src/gitIgnore.js';

export async function listFiles(rootPath, options)
{
  const resolvedRootPath = path.resolve(rootPath);
  const matchedPaths = await glob(options.pattern, {
    absolute: true,
    cwd: resolvedRootPath,
    dot: true,
    nodir: true,
    ignore: options.exclude ?? [],
  });

  if (!options.gitIgnore) {
    return matchedPaths;
  }

  return new GitIgnore(resolvedRootPath).filter(matchedPaths);
}