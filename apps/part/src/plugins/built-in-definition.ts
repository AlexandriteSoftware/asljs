import path
  from 'node:path';
import { fileURLToPath }
  from 'node:url';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { PluginContext }
  from '../plugin.js';

/**
 * Folder of the built-in definition documents. Compiled plugins live two
 * levels below the package root, in `dist/plugins` or `build/plugins`.
 */
const ARTEFACTS_FOLDER =
  path.resolve(
    path.dirname(
      fileURLToPath(import.meta.url)),
    '..',
    '..',
    'artefacts');

/**
 * All definitions documented in the package's `artefacts` folder.
 */
export function readBuiltInDefinitions(
    context: PluginContext
  ): Promise<ArtefactDefinition[]>
{
  return context.readDefinitions(
    ARTEFACTS_FOLDER);
}

/**
 * Reads the definition of a built-in plugin from its document in the
 * package's `artefacts` folder.
 */
export async function readBuiltInDefinition(
    context: PluginContext,
    name: string
  ): Promise<ArtefactDefinition>
{
  const definitions =
    await readBuiltInDefinitions(
      context);

  const definition =
    definitions.find(
      item => item.name === name);

  if (!definition) {
    throw new Error(
      `Definition document "${name}" not found in ${ARTEFACTS_FOLDER}.`);
  }

  return definition;
}
