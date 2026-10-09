import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { PdfResult }
  from '../pdf.js';
import { CommandContext }
  from './context.js';

export interface PdfCommandOptions
{
  path: string;
  output?: string;
  overwrite?: boolean;
  format?: string;
}

/**
 * Print a markdown document to a PDF file of the library, and print the path
 * of that file.
 */
export async function execPdf(
    context: CommandContext,
    options: PdfCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const result =
    await context.client.call(
      'kb_pdf',
      { path: options.path,
        output: options.output,
        overwrite: options.overwrite }) as PdfResult;

  writeResult(
    context.environment,
    format,
    result,
    [ result.output ]);
}
