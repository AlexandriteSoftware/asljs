import { createRequire }
  from 'node:module';

/**
 * @typedef
 *   { import('./../environment.js')
 *       .Environment }
 *   Environment
 */

/**
 * @param {Environment} environment
 */
export function execVersion(
  environment)
{
  const packageVersion =
    (() => {
      const require =
        createRequire(
          import.meta.url);

      const { version } =
        require(
          '../../package.json');

      return version;
    })();


  environment.stdout.write(
    `${packageVersion}\n`);

  return Promise.resolve(0);
}
