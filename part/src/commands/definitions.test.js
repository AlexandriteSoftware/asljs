import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from 'asljs-tmpdir';
import { createLogger }
  from '../logging.js';
import { createEnvironment }
  from '../environment.js';
import { execDefinitions }
  from './definitions.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

test(
  'RQ122: definitions lists definitions',
  async () => {
    await using workspace =
      new TmpDir(
        logger);

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
        { logger,
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
