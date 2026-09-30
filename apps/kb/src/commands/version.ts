import { createRequire }
  from 'node:module';
import { Environment }
  from '../environment.js';
import { writeLine }
  from '../output.js';

/**
 * Read the version of the installed `asljs-kb` package.
 */
export function packageVersion(
  ): string
{
  const require =
    createRequire(
      import.meta.url);

  const { version } =
    require(
      '../../package.json');

  return version;
}

export function execVersion(
    environment: Environment
  ): Promise<void>
{
  writeLine(
    environment,
    packageVersion());

  return Promise.resolve();
}
