import assert
  from 'node:assert/strict';
import { mkdtemp,
         writeFile }
  from 'node:fs/promises';
import { tmpdir }
  from 'node:os';
import { join }
  from 'node:path';
import test
  from 'node:test';
import { TaskRegistry }
  from '../task.js';
import { readTaskDirectories,
         registerTaskDirectories }
  from './task-directories.js';
import { argv }
  from './test-helpers.js';

test(
  'reads multiple task directories from command arguments',
  () =>
  {
    assert.deepEqual(
      readTaskDirectories(
        argv(
          '--tasks-dir=az',
          '--tasks-dir',
          'git')),
      [ 'az',
        'git' ]);
  });

test(
  'registers task modules in supplied directories',
  async () =>
  {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          'cog-tasks-'));

    await writeFile(
      join(
        directory,
        'run-sql.js'),
      `export function registerTasks(registry) {
         registry.register('run-sql', () => ({ run: async () => undefined }));
       }`);

    const registry =
      new TaskRegistry();

    await registerTaskDirectories(
      registry,
      [ directory ]);

    assert.equal(
      registry.definitions()[0].name,
      'run-sql');
  });
