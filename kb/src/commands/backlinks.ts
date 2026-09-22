import { Backlink }
  from '../backlinks.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

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
    context: CommandContext,
    options: BacklinksCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const backlinks =
    await context.client.call(
      'kb_backlinks',
      { path: options.path,
        pattern: options.pattern,
        hidden: options.hidden,
        includeSelf: options.includeSelf }) as Backlink[];

  writeResult(
    context.environment,
    format,
    backlinks,
    backlinks.map(describe));

  if (backlinks.length === 0) {
    context.environment.exitCode = 1;
  }
}

function describe(
    backlink: Backlink
  ): string
{
  return `${backlink.path}:${backlink.line}:${backlink.column}: ${
    backlink.kind} ${backlink.target}`;
}
