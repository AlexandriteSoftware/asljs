import { resolveOutputFormat,
         writeJson }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface ReadCommandOptions
{
  path: string;
  format?: string;
}

interface Document
{
  path: string;
  reader: string;
  verbatim: boolean;
  text: string;
}

/**
 * Print the text of a document. Markdown and other text files are printed
 * verbatim; other file types are printed through their reader.
 */
export async function execRead(
    context: CommandContext,
    options: ReadCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const document =
    await context.client.call(
      'kb_read',
      { path: options.path }) as Document;

  if (format === 'json') {
    writeJson(
      context.environment,
      document);

    return;
  }

  context.environment.stdout.write(
    withFinalBreak(document.text));
}

function withFinalBreak(
    text: string
  ): string
{
  if (text.endsWith('\n')) {
    return text;
  }

  return `${text}\n`;
}
