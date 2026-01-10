import path from 'node:path';
import {
    safePath
  } from './receive.js';

export type VerifySafeRelativePathOptions =
  { allowEmpty?: boolean };

export type VirtualFolderMount =
  { virtual: string;
    rootDir: string };

function isPathInside(
    child: string,
    parent: string
  ) : boolean
{
  const childPath =
    path.resolve(
      path.normalize(child));

  const parentPath =
    path.resolve(
      path.normalize(parent));

  return childPath === parentPath
    || childPath.startsWith(parentPath + path.sep);
}

export class VirtualFolders {
  readonly baseDir: string;

  readonly mounts: ReadonlyArray<VirtualFolderMount>;

  constructor(
      baseDir: string,
      mounts: Record<string, string> = { }
    )
  {
    if (!baseDir
      || typeof baseDir !== 'string')
    {
      throw new TypeError(
        'VirtualFolders: baseDir must be a string');
    }

    this.baseDir =
      path.resolve(
        path.normalize(baseDir));

    this.mounts =
      Object.entries(mounts)
        .map(
          ([virtual, dir]) => {
            const safeVirtualPath =
              safePath(virtual);

            if (safeVirtualPath === null
              || safeVirtualPath === '')
            {
              throw new TypeError(
                'Invalid mount virtual path');
            }

            if (typeof dir !== 'string') {
              throw new TypeError(
                'Invalid mount dir');
            }

            return {
              virtual: safeVirtualPath,
              rootDir:
                path.resolve(
                  path.normalize(dir))
            };
          })
        // Prefer longer (more specific) virtual paths.
        .sort(
          (a, b) =>
            b.virtual.length
            - a.virtual.length);
  }

  resolve(
      value: string
    ): { rootDir: string; relativePath: string, path: string }
  {
    const safeRelativePath =
      safePath(value);

    if (safeRelativePath === null) {
      throw new TypeError(
        'Value must be a safe relative path.');
    }

    if (safeRelativePath === '') {
      return { rootDir: this.baseDir,
               relativePath: '',
               path: this.baseDir };
    }

    for (const mount of this.mounts) {
      if (safeRelativePath === mount.virtual) {
        return { rootDir: mount.rootDir,
                 relativePath: '',
                 path: mount.rootDir };
      }

      const prefix =
        mount.virtual + '/';

      if (safeRelativePath.startsWith(prefix)) {
        const resolvedRelativePath =
          safeRelativePath.slice(prefix.length);

        const fullPath =
          path.join(
            mount.rootDir,
            resolvedRelativePath);

        if (!isPathInside(fullPath, mount.rootDir)) {
          throw new Error(
            'Resolved path is outside of virtual folder root.');          
        }

        return resolveResult(
          mount.rootDir,
          resolvedRelativePath);
      }
    }

    return resolveResult(
      this.baseDir,
      safeRelativePath);

    function resolveResult(
        baseDir: string,
        relativePath: string
      ) : { rootDir: string; relativePath: string, path: string }
    {
      const fullPath =
          path.join(
            baseDir,
            relativePath);

        if (!isPathInside(fullPath, baseDir)) {
          throw new Error(
            'Resolved path is outside of virtual folder root.');          
        }

        return { rootDir: baseDir,
                 relativePath: relativePath,
                 path: fullPath };
    }
  }
}
