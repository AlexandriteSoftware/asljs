import { DocumentSummary }
  from '../notes.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface InfoCommandOptions
{
  path: string;
  format?: string;
}

export async function execInfo(
    context: CommandContext,
    options: InfoCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const summary =
    await context.client.call(
      'kb_info',
      { path: options.path }) as DocumentSummary;

  writeResult(
    context.environment,
    format,
    summary,
    describe(summary));
}

function describe(
    summary: DocumentSummary
  ): string[]
{
  const lines =
    [ `path: ${summary.path}`,
      `kind: ${summary.kind}`,
      `size: ${summary.size}`,
      `modified: ${summary.modified}`,
      `lines: ${summary.lines}`,
      `words: ${summary.words}` ];

  if (summary.kind !== 'markdown') {
    return lines;
  }

  lines.push(
    `title: ${summary.title ?? ''}`,
    `headings: ${summary.headings ?? 0}`,
    `links: ${summary.links ?? 0}`,
    `tasks: ${summary.tasks?.done ?? 0}/${summary.tasks?.total ?? 0}`);

  return lines;
}
