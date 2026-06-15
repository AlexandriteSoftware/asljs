import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from '../tmpDir.js';
import { createTestEnvironment }
  from '../testEnvironment.js';
import { execDefinitions }
  from './definitions.js';

test(
  'RQ122: definitions lists definitions',
  async t => {
    const workspace =
      new TmpDir();

    t.after(
      () => workspace.cleanup());

    workspace.mkdir(
      'definitions');

    workspace.writeText(
      'definitions/Todo Item.md',
      `# Todo Item

A todo item is a task that needs to be done.

## Location

- Folders: Todo Items
`);

    workspace.writeText(
      'Todo Item.md',
      `# Todo Item

This top-level definition should be ignored by the Definitions parameter.

## Location

- Folders: Wrong Items
`);

    const environment =
      createTestEnvironment(
        { cwd: workspace.path,
          definition: workspace.resolve('definitions') });

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
