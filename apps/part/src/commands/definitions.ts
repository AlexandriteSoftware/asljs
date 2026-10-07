import path
  from 'path';
import { Environment }
  from './../environment.js';
import { toPosixPath }
  from '../formatting.js';
import { renderObjectsToMarkdownTable }
  from '../markdown-table.js';

export async function execDefinitions(
    environment: Environment
  ): Promise<void>
{
  const rootDirectory = environment.project;

  const { artefactDefinitionProvider } =
    environment.getProviders();

  const definitions =
    await artefactDefinitionProvider.getDefinitions();

  const objects =
    definitions.map(
      definition => ({ name: definition.name,
                       source: definition.source,
                       path:
                         definition.path === undefined
        ? ''
        : toPosixPath(
          path.relative(
            rootDirectory,
            definition.path)) }));

  const markdown =
    renderObjectsToMarkdownTable(
      [ { name: 'Name',
          property: 'name' },
        { name: 'Source',
          property: 'source' },
        { name: 'Location',
          property: 'path' } ],
      objects);

  environment.stdout.write(
    `${markdown}\n`);
}
