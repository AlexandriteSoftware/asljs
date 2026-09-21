import { listEntries }
  from './files.js';
import { resolveLibraryPath }
  from './library.js';
import { ReaderRegistry }
  from './readers/reader.js';

export interface SearchMatch
{
  /**
   * Library-relative POSIX path of the file containing the match.
   */
  path: string;

  /**
   * One-based line number. For file types that are not read verbatim, such as
   * PDF, the line refers to the extracted text rather than to the file.
   */
  line: number;

  /**
   * One-based column of the first character of the match.
   */
  column: number;

  /**
   * Text of the matching line, trimmed of surrounding whitespace.
   */
  text: string;
}

export interface SearchOptions
{
  query: string;

  /**
   * Treat `query` as a regular expression. Defaults to `false`.
   */
  regex?: boolean;

  /**
   * Match case-insensitively. Defaults to `true`.
   */
  ignoreCase?: boolean;

  /**
   * Glob pattern limiting the files to search. Defaults to every file with a
   * registered reader.
   */
  pattern?: string;

  /**
   * Include dot files and dot folders. Defaults to `false`.
   */
  hidden?: boolean;

  /**
   * Maximum number of matches to return. Defaults to 200.
   */
  maxResults?: number;

  /**
   * Maximum number of matches to report per file. Defaults to 20.
   */
  maxMatchesPerFile?: number;
}

export interface SearchReport
{
  matches: SearchMatch[];

  /**
   * Number of files whose text was searched.
   */
  searchedFiles: number;

  /**
   * Files that could not be read, with the reason.
   */
  skippedFiles: { path: string; reason: string; }[];

  /**
   * True when the result was cut short by `maxResults`.
   */
  truncated: boolean;
}

const DEFAULT_MAX_RESULTS = 200;

const DEFAULT_MAX_MATCHES_PER_FILE = 20;

/**
 * Search the text of every readable file in the library.
 *
 * Markdown and other text files are searched verbatim. Files of other types,
 * such as PDF, are searched through the text produced by their reader.
 */
export async function searchLibrary(
    root: string,
    readers: ReaderRegistry,
    options: SearchOptions
  ): Promise<SearchReport>
{
  if (
    typeof options.query
    !== 'string'
    || options.query === ''
  ) {
    throw new Error(
      'Search query must be a non-empty string.');
  }

  const expression =
    createExpression(options);

  const maxResults =
    options.maxResults ?? DEFAULT_MAX_RESULTS;

  const maxMatchesPerFile =
    options.maxMatchesPerFile ?? DEFAULT_MAX_MATCHES_PER_FILE;

  const entries =
    await listEntries(
      root,
      { pattern: options.pattern,
        kind: 'file',
        hidden: options.hidden });

  const matches: SearchMatch[] = [ ];

  const skippedFiles: { path: string; reason: string; }[] = [ ];

  let searchedFiles = 0;

  let truncated = false;

  for (const entry of entries) {
    if (!readers.supports(entry.path)) {
      continue;
    }

    if (matches.length >= maxResults) {
      truncated = true;

      break;
    }

    let text: string;

    try {
      text =
        await readers.readText(
          resolveLibraryPath(
            root,
            entry.path));
    } catch (error) {
      skippedFiles.push(
        { path: entry.path,
          reason:
            error instanceof Error
              ? error.message
              : String(error) });

      continue;
    }

    searchedFiles += 1;

    const fileMatches =
      findMatches(
        entry.path,
        text,
        expression,
        maxMatchesPerFile);

    for (const match of fileMatches) {
      if (matches.length >= maxResults) {
        truncated = true;

        break;
      }

      matches.push(match);
    }
  }

  return { matches,
           searchedFiles,
           skippedFiles,
           truncated };
}

function findMatches(
    filePath: string,
    text: string,
    expression: RegExp,
    maxMatchesPerFile: number
  ): SearchMatch[]
{
  const matches: SearchMatch[] = [ ];

  const lines =
    text.split('\n');

  for (
    let index = 0;
    index < lines.length;
    index += 1
  ) {
    if (matches.length >= maxMatchesPerFile) {
      break;
    }

    const line =
      (lines[index] ?? '').replace(
        /\r$/,
        '');

    expression.lastIndex = 0;

    const match =
      expression.exec(line);

    if (!match) {
      continue;
    }

    matches.push(
      { path: filePath,
        line: index + 1,
        column: match.index + 1,
        text:
          line.trim() });
  }

  return matches;
}

function createExpression(
    options: SearchOptions
  ): RegExp
{
  const flags =
    options.ignoreCase === false
      ? 'g'
      : 'gi';

  if (options.regex !== true) {
    return new RegExp(
      escapeRegExp(options.query),
      flags);
  }

  try {
    return new RegExp(
      options.query,
      flags);
  } catch (error) {
    throw new Error(
      `Invalid regular expression: ${
        error instanceof Error
          ? error.message
          : String(error)}`);
  }
}

function escapeRegExp(
    value: string
  ): string
{
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&');
}
