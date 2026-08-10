import path
  from 'node:path';
import { readPackageJSON }
  from 'pkg-types';

/**
 * @type { import('asljs-part').ArtefactDataProvidingFunction }
 */
export async function getData(
    artefact
  )
{
  const packageJsonPath =
    path.join(
      artefact.path,
      'package.json');

  const packageJson =
    await readPackageJSON(
      packageJsonPath);

  const dependencies =
    packageJson.dependencies
    ?? [];

  const repositoryRoot =
    path.resolve(
      artefact.path,
      '..',
      '..');

  const localDeps =
    Object.keys(dependencies)
      .filter(
        item =>
          item.startsWith('asljs-'))
      .map(
        item =>
          item.replace(
            /^asljs-/,
            ''))
      .map(
        item =>
          path.resolve(
            repositoryRoot,
            item));
      

  return {
    LocalDeps: localDeps
  };
}