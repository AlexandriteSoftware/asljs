import { TmpDir,
         TmpDirOptions }
  from 'asljs-tmpdir';
import { LoggerProvider }
  from '../logging/logging.js';

export function tmpDirFactory(
    loggerProvider: LoggerProvider
  ): () => TmpDir
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

    const tmpDirOptions: Partial<TmpDirOptions> =
      { error,
        trace };

    return new TmpDir(
      tmpDirOptions);
  };
}
