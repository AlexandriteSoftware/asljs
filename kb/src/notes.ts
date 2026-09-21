import path
  from 'node:path';
import { stringify as stringifyYaml }
  from 'yaml';
import { extractHeadings,
         extractLinks,
         extractTasks }
  from './extract.js';
import { LibraryEntry,
         readTextFile,
         statEntry,
         writeTextFile }
  from './files.js';
import { resolveLibraryPath }
  from './library.js';
import { parseMarkdown }
  from './markdown.js';
import { ReaderRegistry }
  from './readers/reader.js';

export interface CreateNoteOptions
{
  /**
   * Level 1 heading and `title` front matter value. Defaults to the file name
   * without its extension.
   */
  title?: string;

  tags?: string[];

  /**
   * Additional front matter values, merged over the generated ones.
   */
  frontMatter?: Record<string, unknown>;

  /**
   * Body text placed under the heading.
   */
  body?: string;

  overwrite?: boolean;

  /**
   * Creation timestamp. Defaults to the current time. Provided explicitly by
   * tests, so that generated notes are deterministic.
   */
  now?: Date;
}

export interface DocumentSummary
{
  path: string;

  kind: 'markdown' | 'other';

  size: number;

  modified: string;

  /**
   * Number of whitespace-separated words in the document text.
   */
  words: number;

  lines: number;

  /**
   * Markdown-only values. Absent for other file types.
   */
  frontMatter?: Record<string, unknown> | null;

  headings?: number;

  links?: number;

  tasks?: { total: number; done: number; };

  title?: string;
}

const MARKDOWN_EXTENSIONS =
  [ '.md',
    '.markdown' ];

/**
 * Create a markdown note with YAML front matter.
 *
 * A path without an extension gets `.md`.
 */
export async function createNote(
    root: string,
    value: string,
    options: CreateNoteOptions = {}
  ): Promise<LibraryEntry>
{
  const notePath =
    withMarkdownExtension(value);

  const title =
    options.title
    && options.title.trim() !== ''
      ? options.title.trim()
      : path.basename(
        notePath,
        path.extname(notePath));

  const created =
    (options.now ?? new Date()).toISOString();

  const frontMatter: Record<string, unknown> =
    { title,
      created,
      ...(options.tags
        && options.tags.length > 0
        ? { tags: options.tags }
        : {}),
      ...(options.frontMatter ?? {}) };

  const body =
    options.body
    && options.body.trim() !== ''
      ? `${options.body.trim()}\n`
      : '';

  const content =
    `---\n${
      stringifyYaml(frontMatter).trimEnd()
    }\n---\n\n# ${title}\n${
      body === ''
        ? ''
        : `\n${body}`}`;

  return await writeTextFile(
    root,
    notePath,
    content,
    { overwrite: options.overwrite === true,
      createFolders: true });
}

/**
 * Summarise a library document: size, word count, and, for markdown, front
 * matter and structure counts.
 */
export async function summarizeDocument(
    root: string,
    readers: ReaderRegistry,
    value: string
  ): Promise<DocumentSummary>
{
  const entry =
    await statEntry(
      root,
      value);

  if (entry.kind !== 'file') {
    throw new Error(
      `Not a file: ${entry.path}`);
  }

  if (isMarkdown(entry.path)) {
    const text =
      await readTextFile(
        root,
        entry.path);

    const document =
      parseMarkdown(
        text,
        entry.path);

    const headings =
      extractHeadings(document);

    const tasks =
      extractTasks(document);

    const frontMatterTitle =
      document.frontMatter.data?.title;

    return { path: entry.path,
             kind: 'markdown',
             size: entry.size,
             modified: entry.modified,
             words:
               countWords(document.body),
             lines:
               countLines(text),
             frontMatter:
               document.frontMatter.data,
             headings: headings.length,
             links:
               extractLinks(document).length,
             tasks:
               { total: tasks.length,
                 done:
                   tasks.filter(
                     task => task.checked).length },
             title:
               typeof frontMatterTitle === 'string'
                 ? frontMatterTitle
                 : headings.find(
                   heading => heading.level === 1)?.text
                   ?? path.basename(
                     entry.path,
                     path.extname(entry.path)) };
  }

  const text =
    await readers.readText(
      resolveLibraryPath(
        root,
        entry.path));

  return { path: entry.path,
           kind: 'other',
           size: entry.size,
           modified: entry.modified,
           words:
             countWords(text),
           lines:
             countLines(text) };
}

/**
 * True when the path has a markdown extension.
 */
export function isMarkdown(
    value: string
  ): boolean
{
  return MARKDOWN_EXTENSIONS.includes(
    path.extname(value).toLowerCase());
}

function withMarkdownExtension(
    value: string
  ): string
{
  if (path.extname(value) === '') {
    return `${value}.md`;
  }

  return value;
}

function countWords(
    text: string
  ): number
{
  const words =
    text
      .split(/\s+/)
      .filter(word => word !== '');

  return words.length;
}

function countLines(
    text: string
  ): number
{
  if (text === '') {
    return 0;
  }

  return text
    .replace(
      /\n$/,
      '')
    .split('\n')
    .length;
}
