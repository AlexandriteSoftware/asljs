import { Environment }
  from '../environment.js';
import { resolveOutputFormat,
         writeJson,
         writeLines }
  from '../output.js';
import { packageVersion }
  from './version.js';

export interface ConfigCommandOptions
{
  format?: string;
}

/**
 * Print the effective configuration: the library root, the working directory,
 * and the file types that can be read.
 */
export function execConfig(
    environment: Environment,
    options: ConfigCommandOptions = {}
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const config =
    { version:
        packageVersion(),
      cwd: environment.cwd,
      library: environment.library,
      readable:
        environment.readers.extensions() };

  if (format === 'json') {
    writeJson(
      environment,
      config);

    return Promise.resolve();
  }

  writeLines(
    environment,
    [ `version: ${config.version}`,
      `cwd: ${config.cwd}`,
      `library: ${config.library}`,
      `readable: ${config.readable.join(' ')}` ]);

  return Promise.resolve();
}
