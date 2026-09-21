import { findBacklinks }
  from '../backlinks.js';
import { Environment }
  from '../environment.js';
import { resolveOutputFormat,
         writeJson,
         writeLines }
  from '../output.js';

export interface BacklinksCommandOptions
{
  path: string;
  pattern?: string;
  hidden?: boolean;
  includeSelf?: boolean;
  format?: string;
}

/**
 * Print the markdown links that point at one library entry. The exit code is
 * set to 1 when nothing links to it, so that the command composes with shell
 * conditionals.
 */
export async function execBacklinks(
    environment: Environment,
    options: BacklinksCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const backlinks =
    await findBacklinks(
      environment.library,
      options.path,
      { pattern: options.pattern,
        hidden: options.hidden === true,
        includeSelf: options.includeSelf === true });

  if (format === 'json') {
    writeJson(
      environment,
      backlinks);
  } else {
    writeLines(
      environment,
      backlinks.map(
        backlink =>
        `${backlink.path}:${backlink.line}:${backlink.column}: ${
          backlink.kind} ${backlink.target}`));
  }

  if (backlinks.length === 0) {
    environment.exitCode = 1;
  }
}
