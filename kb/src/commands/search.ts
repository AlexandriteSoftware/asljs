import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { SearchMatch,
         SearchReport }
  from '../search.js';
import { CommandContext }
  from './context.js';

export interface SearchCommandOptions
{
  query: string;
  pattern?: string;
  regex?: boolean;
  caseSensitive?: boolean;
  hidden?: boolean;
  maxResults?: number;
  format?: string;
}

/**
 * Search the library and print the matches. The exit code is set to 1 when
 * nothing matches, so that the command composes with shell conditionals.
 */
export async function execSearch(
    context: CommandContext,
    options: SearchCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const report =
    await context.client.call(
      'kb_search',
      { query: options.query,
        pattern: options.pattern,
        regex: options.regex,
        ignoreCase:
          options.caseSensitive !== true,
        hidden: options.hidden,
        maxResults: options.maxResults }) as SearchReport;

  writeResult(
    context.environment,
    format,
    report,
    report.matches.map(describe));

  for (const skipped of report.skippedFiles) {
    context.environment.stderr.write(
      `Skipped ${skipped.path}: ${skipped.reason}\n`);
  }

  if (report.matches.length === 0) {
    context.environment.exitCode = 1;
  }
}

function describe(
    match: SearchMatch
  ): string
{
  return `${match.path}:${match.line}:${match.column}: ${match.text}`;
}
