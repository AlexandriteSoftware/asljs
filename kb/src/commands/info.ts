import { Environment }
  from '../environment.js';
import { summarizeDocument }
  from '../notes.js';
import { resolveOutputFormat,
         writeJson,
         writeLines }
  from '../output.js';

export interface InfoCommandOptions
{
  path: string;
  format?: string;
}

export async function execInfo(
    environment: Environment,
    options: InfoCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const summary =
    await summarizeDocument(
      environment.library,
      environment.readers,
      options.path);

  if (format === 'json') {
    writeJson(
      environment,
      summary);

    return;
  }

  const lines =
    [ `path: ${summary.path}`,
      `kind: ${summary.kind}`,
      `size: ${summary.size}`,
      `modified: ${summary.modified}`,
      `lines: ${summary.lines}`,
      `words: ${summary.words}` ];

  if (summary.kind === 'markdown') {
    lines.push(
      `title: ${summary.title ?? ''}`,
      `headings: ${summary.headings ?? 0}`,
      `links: ${summary.links ?? 0}`,
      `tasks: ${summary.tasks?.done ?? 0}/${summary.tasks?.total ?? 0}`);
  }

  writeLines(
    environment,
    lines);
}
