import path
  from 'node:path';
import {
    cp,
    mkdir,
    readdir,
  } from 'node:fs/promises';
import {
    fileURLToPath,
  } from 'node:url';

const MODULE_DIRECTORY =
  path.dirname(
    fileURLToPath(
      import.meta.url));

const ARTEFACTS_DIRECTORY =
  path.resolve(
    MODULE_DIRECTORY,
    '../artefacts');

export async function initializeDefinitionsDirectory(
    rootDirectory,
    definitionsPath)
{
  const targetDirectory =
    definitionsPath
      ? path.resolve(rootDirectory, definitionsPath)
      : path.resolve(rootDirectory);

  await mkdir(
    targetDirectory,
    { recursive: true });

  const artefactEntries =
    await readdir(ARTEFACTS_DIRECTORY);

  for (const entryName of artefactEntries) {
    await cp(
      path.join(ARTEFACTS_DIRECTORY, entryName),
      path.join(targetDirectory, entryName),
      { recursive: true,
        force: true });
  }

  return targetDirectory;
}