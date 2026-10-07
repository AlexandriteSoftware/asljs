import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createEnvironment }
  from '../environment.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { execDefinitions }
  from './definitions.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async (): Promise<void> =>
  {
    await loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'RQ122: definitions lists definitions',
  async () =>
  {
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

    await workspace.writeText(
      'plugin.js',
      `export default () => ({
  name: 'test',
  definitions: async () => [ { name: 'Release', description: 'A release.' } ]
});
`);

    const environment =
      createEnvironment(
        { loggerProvider,
          cwd: workspace.path,
          definitions:
            [ workspace.resolve('definitions'),
              workspace.resolve('plugin.js') ],
          project: workspace.path });

    await execDefinitions(
      environment);

    assert.equal(
      environment.stderr.toString(),
      '');

    assert.match(
      environment.stdout.toString(),
      /\| Name\s+\| Source\s+\| Location\s+\|/);

    assert.match(
      environment.stdout.toString(),
      /\| Todo Item \| markdown \| definitions\/Todo Item\.md \|/);

    assert.match(
      environment.stdout.toString(),
      /\| Release\s+\| test\s+\|\s+\|/);

    assert.doesNotMatch(
      environment.stdout.toString(),
      /Wrong Items/);
  });
