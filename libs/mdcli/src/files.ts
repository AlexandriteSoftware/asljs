import { readdir }
  from 'node:fs/promises';
import path
  from 'node:path';

export interface FindOptions
{
  /**
   * Names of folders to skip besides those starting with `.` and
   * `node_modules`, e.g. `Archive`.
   */
  skip?: readonly string[];
}

/**
 * Every markdown file of a folder and its subfolders, sorted, skipping
 * folders whose name starts with `.`, `node_modules`, and the `skip` names.
 */
export async function findMarkdownFiles(
    folder: string,
    options: FindOptions = {}
  ): Promise<string[]>
{
  const files: string[] = [ ];

  for (
    const entry of await readdir(
      folder,
      { withFileTypes: true })
  ) {
    const entryPath =
      path.join(
        folder,
        entry.name);

    if (entry.isDirectory()) {
      if (
        !entry.name.startsWith('.')
        && entry.name !== 'node_modules'
        && !options.skip?.includes(entry.name)
      ) {
        files.push(
          ...await findMarkdownFiles(
            entryPath,
            options));
      }
    } else if (entry.name.toLowerCase().endsWith('.md')) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

/**
 * A path relative to `folder`, with `/` separators.
 */
export function toDisplayPath(
    folder: string,
    file: string
  ): string
{
  return path.relative(
    folder,
    file)
    .split(path.sep)
    .join('/');
}
