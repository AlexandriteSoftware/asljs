import { listEntries }
  from './files.js';
import { messageOf }
  from './formatting.js';
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
  requireQuery(options.query);

  const expression =
    createExpression(options);

  const maxResults =
    options.maxResults ?? DEFAULT_MAX_RESULTS;

  const entries =
    await listEntries(
      root,
      { pattern: options.pattern,
        kind: 'file',
        hidden: options.hidden });

  const report: SearchReport =
    { matches: [ ],
      searchedFiles: 0,
      skippedFiles: [ ],
      truncated: false };

  for (const entry of entries) {
    if (!readers.supports(entry.path)) {
      continue;
    }

    if (
      report.matches.length
      >= maxResults
    ) {
      report.truncated = true;

      break;
    }

    await searchFile(
      root,
      readers,
      entry.path,
      expression,
      maxResults,
      report);
  }

  return report;
}

/**
 * Search one file, adding what it holds to the report.
 */
async function searchFile(
    root: string,
    readers: ReaderRegistry,
    documentPath: string,
    expression: RegExp,
    maxResults: number,
    report: SearchReport
  ): Promise<void>
{
  const text =
    await readText(
      root,
      readers,
      documentPath,
      report);

  if (text === null) {
    return;
  }

  report.searchedFiles += 1;

  const found =
    findMatches(
      documentPath,
      text,
      expression,
      DEFAULT_MAX_MATCHES_PER_FILE);

  for (const match of found) {
    if (
      report.matches.length
      >= maxResults
    ) {
      report.truncated = true;

      return;
    }

    report.matches.push(match);
  }
}

/**
 * Text of one file, or `null` when its reader could not produce any, which
 * the report records as a skipped file.
 */
async function readText(
    root: string,
    readers: ReaderRegistry,
    documentPath: string,
    report: SearchReport
  ): Promise<string | null>
{
  const absolute =
    resolveLibraryPath(
      root,
      documentPath);

  try {
    return await readers.readText(absolute);
  } catch (error) {
    report.skippedFiles.push(
      { path: documentPath,
        reason:
          messageOf(error) });

    return null;
  }
}

function requireQuery(
    query: unknown
  ): void
{
  if (
    typeof query
    !== 'string'
    || query === ''
  ) {
    throw new Error(
      'Search query must be a non-empty string.');
  }
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
    searchFlags(options.ignoreCase);

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
        messageOf(error)}`);
  }
}

/**
 * Matching ignores case unless that was switched off.
 */
function searchFlags(
    ignoreCase: boolean | undefined
  ): string
{
  if (ignoreCase === false) {
    return 'g';
  }

  return 'gi';
}

function escapeRegExp(
    value: string
  ): string
{
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&');
}
