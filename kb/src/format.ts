import fs
  from 'node:fs/promises';
import { listEntries }
  from './files.js';
import { resolveLibraryPath }
  from './library.js';
import { formatMarkdown }
  from './markdown.js';

export interface FormatOptions
{
  /**
   * Glob pattern limiting the files to format. Defaults to `**\/*.md`.
   */
  pattern?: string;

  /**
   * Write the formatted text back to disk. When `false`, files are only
   * reported as changed or unchanged. Defaults to `true`.
   */
  write?: boolean;

  /**
   * Include dot files and dot folders. Defaults to `false`.
   */
  hidden?: boolean;
}

export interface FormatFileResult
{
  path: string;

  /**
   * True when formatting produced text different from the file on disk.
   */
  changed: boolean;
}

export interface FormatReport
{
  files: FormatFileResult[];

  changed: number;

  /**
   * True when the changed files were written back.
   */
  written: boolean;
}

const DEFAULT_PATTERN = '**/*.md';

/**
 * Format every markdown file matching the pattern.
 */
export async function formatLibrary(
    root: string,
    options: FormatOptions = {}
  ): Promise<FormatReport>
{
  const write =
    options.write !== false;

  const entries =
    await listEntries(
      root,
      { pattern:
          options.pattern
          && options.pattern.trim() !== ''
            ? options.pattern
            : DEFAULT_PATTERN,
        kind: 'file',
        hidden: options.hidden });

  const files: FormatFileResult[] = [ ];

  for (const entry of entries) {
    const absolute =
      resolveLibraryPath(
        root,
        entry.path);

    const text =
      await fs.readFile(
        absolute,
        'utf8');

    const formatted =
      formatMarkdown(text);

    const changed =
      formatted !== text;

    if (
      changed
      && write
    ) {
      await fs.writeFile(
        absolute,
        formatted,
        'utf8');
    }

    files.push(
      { path: entry.path,
        changed });
  }

  return { files,
           changed:
             files.filter(
               file => file.changed).length,
           written: write };
}
