import { Environment }
  from '../environment.js';
import { resolveOutputFormat,
         writeJson,
         writeLines }
  from '../output.js';
import { searchLibrary }
  from '../search.js';

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
    environment: Environment,
    options: SearchCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const report =
    await searchLibrary(
      environment.library,
      environment.readers,
      { query: options.query,
        pattern: options.pattern,
        regex: options.regex === true,
        ignoreCase:
          options.caseSensitive !== true,
        hidden: options.hidden === true,
        maxResults: options.maxResults });

  if (format === 'json') {
    writeJson(
      environment,
      report);
  } else {
    writeLines(
      environment,
      report.matches.map(
        match =>
        `${match.path}:${match.line}:${match.column}: ${match.text}`));
  }

  for (const skipped of report.skippedFiles) {
    environment.stderr.write(
      `Skipped ${skipped.path}: ${skipped.reason}\n`);
  }

  if (report.matches.length === 0) {
    environment.exitCode = 1;
  }
}
