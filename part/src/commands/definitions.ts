import path
  from 'path';
import { toPosixPath }
  from '../formatting.js';
import { renderObjectsToMarkdownTable }
  from '../markdown-table.js';
import { Environment }
  from './../environment.js';

export async function execDefinitions(
    environment: Environment
  ): Promise<void>
{
  const rootDirectory =
    environment.project;

  const { artefactDefinitionProvider } =
    environment.getProviders();

  const definitions =
    await artefactDefinitionProvider.getDefinitions();

  const objects =
    definitions.map(
      definition => ({
        name: definition.name,
        path: toPosixPath(
          path.relative(
            rootDirectory,
            definition.path))
      }));

  const markdown =
    renderObjectsToMarkdownTable(
      [ { name: 'Name', property: 'name' },
        { name: 'Location', property: 'path' } ],
      objects);

  environment.stdout.write(
    `${markdown}\n`);
}
