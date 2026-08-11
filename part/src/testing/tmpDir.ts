import { TmpDir }
  from 'asljs-tmpdir';
import { LoggerProvider }
  from 'asljs-logging';

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
