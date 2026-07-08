import test,
       { after }
  from 'node:test';
import assert
  from 'node:assert/strict';
import { createPinoLoggerProvider }
  from '../logging/pino.js';
import { createEnvironment }
  from '../environment.js';
import { execDefinitions }
  from './definitions.js';
import { tmpDirFactory }
  from '../tmpDir.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () => {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'RQ122: definitions lists definitions',
  async () => {
    await using workspace =
      tmpDir();

    await workspace.writeText(
      'definitions/Todo Item.md',
      `# Todo Item

A todo item is a task that needs to be done.

## Location

- Folders: Todo Items
`);

    await workspace.writeText(
      'Todo Item.md',
      `# Todo Item

This top-level definition should be ignored by the Definitions parameter.

## Location

- Folders: Wrong Items
`);

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions: workspace.resolve('definitions'),
          project: workspace.path });

    await execDefinitions(
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| Name\s+\| Location\s+\|/);

    assert.match(
      environment.stdout.toString(),
      /\| Todo Item \| definitions\/Todo Item\.md \|/);

    assert.doesNotMatch(
      environment.stdout.toString(),
      /Wrong Items/);
  });
