import { type ArtefactDataProvidingFunction }
  from 'asljs-part';
import path
  from 'node:path';
import { readPackageJSON }
  from 'pkg-types';

/**
 * Data of an `ASLJS Package`, whose artefact is its `package.json`:
 * `LocalDeps`, the `package.json` of each `asljs-*` package it depends on,
 * assumed to be in a sibling of the package folder.
 */
export const getData: ArtefactDataProvidingFunction =
  async (
      artefact,
      context
    ) =>
  {
  const packageJsonPath =
    context.files.path(artefact);

  const packageJson =
    await readPackageJSON(
      packageJsonPath);

  const packagePath =
    path.dirname(packageJsonPath);

  const parentPath =
    path.resolve(
      packagePath,
      '..');

  const localDeps =
    Object.keys(
      packageJson.dependencies
      ?? {})
    .filter(
      item => item.startsWith('asljs-'))
    .map(
      item =>
        path.resolve(
          parentPath,
          item.replace(
            /^asljs-/,
            ''),
          'package.json'));

  return { LocalDeps: localDeps };
};
