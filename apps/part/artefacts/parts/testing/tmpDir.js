import { TmpDir }
  from 'asljs-tmpdir';

/**
 * @typedef
 *   { import('./logging.js').LoggerProvider }
 *   LoggerProvider
 * @typedef
 *   { import('asljs-tmpdir').TmpDirOptions }
 *   TmpDirOptions
 */

/**
 * @param {LoggerProvider} loggerProvider 
 * @returns {() => TmpDir}
 */
export function tmpDirFactory(
    loggerProvider
  )
{
  return () => {
    const tmpDirLogger =
      loggerProvider.getLogger('TmpDir');

    const error =
      tmpDirLogger.error
        .bind(
          tmpDirLogger);

    const trace =
      tmpDirLogger.trace
        .bind(
          tmpDirLogger);

    /** @type {Partial<TmpDirOptions>} */
    const tmpDirOptions =
      { error,
        trace };

    return new TmpDir(
      tmpDirOptions);
  };
}

