import { type ArtefactDataProvidingFunction }
  from 'asljs-part';
import path
  from 'node:path';
import { readPackageJSON }
  from 'pkg-types';

/**
 * Data of an `ASLJS Package`: `LocalDeps`, the folders of the `asljs-*`
 * packages it depends on, assumed to be siblings of the package folder.
 */
export const getData: ArtefactDataProvidingFunction =
  async (
      artefact,
      context
    ) =>
  {
  const packagePath =
    context.files.path(artefact);

  const packageJson =
    await readPackageJSON(
      path.join(
        packagePath,
        'package.json'));

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
            '')));

  return { LocalDeps: localDeps };
};
