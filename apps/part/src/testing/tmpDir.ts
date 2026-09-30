import { LoggerProvider }
  from 'asljs-logging';
import { TmpDir }
  from 'asljs-tmpdir';

export function tmpDirFactory(
    loggerProvider: LoggerProvider
  ): () => TmpDir
{
  return () =>
  {
    const tmpDirLogger =
      loggerProvider.getLogger('TmpDir');

    return new TmpDir(
      tmpDirLogger);
  };
}
