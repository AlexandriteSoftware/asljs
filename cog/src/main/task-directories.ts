import { readdir }
  from 'node:fs/promises';
import { resolve }
  from 'node:path';
import { pathToFileURL }
  from 'node:url';
import { type TaskModule,
         TaskRegistry }
  from '../task.js';

export function readTaskDirectories(
    argv: readonly string[]
  ): string[]
{
  const directories: string[] = [ ];

  for (
    let index = 2;
    index < argv.length;
    index++
  ) {
    const argument = argv[index];

    if (argument === '--tasks-dir') {
      const directory = argv[++index];

      if (directory === undefined) {
        throw new Error(
          '--tasks-dir requires a path');
      }

      directories.push(
        directory);
    } else if (argument.startsWith('--tasks-dir=')) {
      directories.push(
        argument.slice(
          '--tasks-dir='.length));
    }
  }

  return directories;
}

export async function registerTaskDirectories(
    registry: TaskRegistry,
    directories: readonly string[]
  ): Promise<void>
{
  for (const directory of directories) {
    for (const path of await findTaskModules(directory)) {
      const module =
        await import(
        pathToFileURL(
          path).href
      ) as Partial<TaskModule>;

      if (
        module.registerTasks
        === undefined
      ) {
        continue;
      }

      await module.registerTasks(
        registry);
    }
  }
}

async function findTaskModules(
    directory: string
  ): Promise<string[]>
{
  const modules: string[] = [ ];

  for (
    const entry of await readdir(
      directory,
      { withFileTypes: true })
  ) {
    const path =
      resolve(
        directory,
        entry.name);

    if (entry.isDirectory()) {
      modules.push(
        ...await findTaskModules(path));
    } else if (
      entry.isFile()
      && (entry.name.endsWith('.js')
          || entry.name.endsWith('.mjs'))
    ) {
      modules.push(path);
    }
  }

  return modules;
}
