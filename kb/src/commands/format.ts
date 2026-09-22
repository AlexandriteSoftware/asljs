import { FormatReport }
  from '../format.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface FormatCommandOptions
{
  pattern?: string;

  /**
   * Report the files that would change without writing them. The exit code is
   * set to 1 when at least one file would change.
   */
  check?: boolean;

  hidden?: boolean;
  format?: string;
}

export async function execFormat(
    context: CommandContext,
    options: FormatCommandOptions = {}
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const check =
    options.check === true;

  const report =
    await context.client.call(
      'kb_format',
      { pattern: options.pattern,
        write: !check,
        hidden: options.hidden }) as FormatReport;

  writeResult(
    context.environment,
    format,
    report,
    describe(
      report,
      check));

  if (
    check
    && report.changed > 0
  ) {
    context.environment.exitCode = 1;
  }
}

function describe(
    report: FormatReport,
    check: boolean
  ): string[]
{
  const lines: string[] = [ ];

  for (const file of report.files) {
    if (!file.changed) {
      continue;
    }

    lines.push(
      `${verb(check)} ${file.path}`);
  }

  lines.push(
    `${report.changed} of ${report.files.length} file(s) ${summary(check)}`);

  return lines;
}

function verb(
    check: boolean
  ): string
{
  if (check) {
    return 'would reformat';
  }

  return 'formatted';
}

function summary(
    check: boolean
  ): string
{
  if (check) {
    return 'need formatting';
  }

  return 'formatted';
}
