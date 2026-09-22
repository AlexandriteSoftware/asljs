import path
  from 'node:path';
import { stringify as stringifyYaml }
  from 'yaml';
import { ExtractedTask,
         extractHeadings,
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
import { MarkdownDocument,
         parseMarkdown }
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
    noteTitle(
      options.title,
      notePath);

  const created =
    (options.now ?? new Date()).toISOString();

  const frontMatter: Record<string, unknown> =
    { title,
      created,
      ...tagsOf(options.tags) };

  const content =
    `---\n${
      stringifyYaml(frontMatter).trimEnd()
    }\n---\n\n# ${title}\n${
      bodyOf(options.body)}`;

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
    return await summarizeMarkdown(
      root,
      entry);
  }

  return await summarizeOther(
    root,
    readers,
    entry);
}

async function summarizeMarkdown(
    root: string,
    entry: LibraryEntry
  ): Promise<DocumentSummary>
{
  const text =
    await readTextFile(
      root,
      entry.path);

  const document =
    parseMarkdown(
      text,
      entry.path);

  const tasks =
    extractTasks(document);

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
           headings:
             extractHeadings(document).length,
           links:
             extractLinks(document).length,
           tasks:
             { total: tasks.length,
               done:
                 countDone(tasks) },
           title:
             documentTitle(
               document,
               entry.path) };
}

async function summarizeOther(
    root: string,
    readers: ReaderRegistry,
    entry: LibraryEntry
  ): Promise<DocumentSummary>
{
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

function countDone(
    tasks: ExtractedTask[]
  ): number
{
  let done = 0;

  for (const task of tasks) {
    if (task.checked) {
      done += 1;
    }
  }

  return done;
}

/**
 * Title of a new note: the one that was asked for, else the file name.
 */
function noteTitle(
    requested: string | undefined,
    notePath: string
  ): string
{
  const title =
    (requested ?? '').trim();

  if (title !== '') {
    return title;
  }

  return path.basename(
    notePath,
    path.extname(notePath));
}

/**
 * Front matter carries tags only when there are some.
 */
function tagsOf(
    tags: string[] | undefined
  ): Record<string, unknown>
{
  if (
    !tags
    || tags.length === 0
  ) {
    return {};
  }

  return { tags };
}

/**
 * Body text, placed one blank line under the heading. Empty when there is
 * none, so the note ends after its heading.
 */
function bodyOf(
    body: string | undefined
  ): string
{
  const text =
    (body ?? '').trim();

  if (text === '') {
    return '';
  }

  return `\n${text}\n`;
}

/**
 * Title of a markdown document: the `title` front matter value, else the first
 * level 1 heading, else the file name without its extension.
 */
export function documentTitle(
    document: MarkdownDocument,
    documentPath: string
  ): string
{
  const frontMatterTitle =
    document.frontMatter.data?.title;

  if (
    typeof frontMatterTitle
    === 'string'
  ) {
    return frontMatterTitle;
  }

  return extractHeadings(document)
    .find(
      heading => heading.level === 1)?.text
    ?? path.basename(
      documentPath,
      path.extname(documentPath));
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
