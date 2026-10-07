import path
  from 'node:path';
import { readPackageJSON }
  from 'pkg-types';

/**
 * @type { import('asljs-part').ArtefactDataProvidingFunction }
 */
export async function getData(
    artefact,
    context
  )
{
  const packageJsonPath =
    path.join(
      context.files.path(artefact),
      'package.json');

  const packageJson =
    await readPackageJSON(
      packageJsonPath);

  const dependencies =
    packageJson.dependencies
    ?? [];

  const repositoryRoot =
    path.resolve(
      context.files.path(artefact),
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