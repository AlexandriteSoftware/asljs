import { Environment }
  from '../environment.js';
import { formatLibrary }
  from '../format.js';
import { resolveOutputFormat,
         writeJson,
         writeLine,
         writeLines }
  from '../output.js';

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
    environment: Environment,
    options: FormatCommandOptions = {}
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const check =
    options.check === true;

  const report =
    await formatLibrary(
      environment.library,
      { pattern: options.pattern,
        write: !check,
        hidden: options.hidden === true });

  if (format === 'json') {
    writeJson(
      environment,
      report);
  } else {
    writeLines(
      environment,
      report.files
        .filter(
          file => file.changed)
        .map(
          file =>
          check
            ? `would reformat ${file.path}`
            : `formatted ${file.path}`));

    writeLine(
      environment,
      `${report.changed} of ${report.files.length} file(s) ${
        check
          ? 'need formatting'
          : 'formatted'}`);
  }

  if (
    check
    && report.changed > 0
  ) {
    environment.exitCode = 1;
  }
}
