import path
  from 'node:path';
import { cp,
         mkdir,
         readdir }
  from 'node:fs/promises';
import { fileURLToPath }
  from 'node:url';
import { Environment }
  from './../environment.js';
import { Logger }
  from '../logging/logging.js';

const MODULE_DIRECTORY =
  path.dirname(
    fileURLToPath(
      import.meta.url));

const ARTEFACTS_DIRECTORY =
  path.resolve(
    MODULE_DIRECTORY,
    '../../artefacts');

export async function execInit(
    environment: Environment
  ): Promise<void>
{
  const definitionsPath =
    environment.definitions;

  await mkdir(
    definitionsPath,
    { recursive: true });

  const artefactEntries =
    await readdir(
      ARTEFACTS_DIRECTORY);

  for (const entryName of artefactEntries) {
    environment.stdout.write(
      `Copying ${entryName}\n`);

    await cp(
      path.join(
        ARTEFACTS_DIRECTORY,
        entryName),
      path.join(
        definitionsPath,
        entryName),
      { recursive: true,
        force: true });
  }

  environment.stdout.write(
    `Initialised definitions directory: ${definitionsPath}\n`);
}