import path from 'node:path';
import {
  copyFile,
  mkdir,
} from 'node:fs/promises';
import {
  fileURLToPath,
} from 'node:url';

const MODULE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const ARTEFACTS_DIRECTORY = path.resolve(MODULE_DIRECTORY, '../artefacts');

export async function initializeDefinitionsDirectory(rootDirectory, definitionsPath)
{
  const targetDirectory = definitionsPath
    ? path.resolve(rootDirectory, definitionsPath)
    : path.resolve(rootDirectory);

  await mkdir(targetDirectory, {
    recursive: true,
  });
  await mkdir(path.join(targetDirectory, 'rules'), {
    recursive: true,
  });
  await copyFile(
    path.join(ARTEFACTS_DIRECTORY, 'Artefact Definition.md'),
    path.join(targetDirectory, 'Artefact Definition.md'),
  );
  await copyFile(
    path.join(ARTEFACTS_DIRECTORY, 'Rule File.md'),
    path.join(targetDirectory, 'Rule File.md'),
  );

  return targetDirectory;
}