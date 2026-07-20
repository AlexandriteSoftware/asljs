import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test,
       { after }
  from 'node:test';
import { createPinoLoggerProvider }
  from '../logging/pino.js';
import { tmpDirFactory }
  from '../testing/tmpDir.js';
import { providersFactory }
  from './providers.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () =>
  {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  'RQ205: FilesystemLocationResolver resolvers files: relative, base = root',
  async () =>
  {
    await using workspace =
      await getTestTmpFolder();

    const { filesystemLocationResolver } =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.path);

    checkResolvedFiles(
      workspace,
      await filesystemLocationResolver.resolve(
        workspace.path,
        [{ pattern: '**/*.txt' }]),
      ['f1.txt', 'd1/f2.txt', 'd1/d11/f3.txt', 'd2/f4.txt', 'd2/d21/f5.txt']);
  });

test(
  'RQ205: FilesystemLocationResolver resolvers files: relative, base = d1',
  async () =>
  {
    await using workspace =
      await getTestTmpFolder();

    const { filesystemLocationResolver } =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.path);

    checkResolvedFiles(
      workspace,
      await filesystemLocationResolver.resolve(
        path.join(
          workspace.path,
          'd1'),
        [{ pattern: '**/*.txt' }]),
      ['d1/f2.txt', 'd1/d11/f3.txt']);
  });

test(
  'RQ205: FilesystemLocationResolver resolvers files: absolute',
  async () =>
  {
    await using workspace =
      await getTestTmpFolder();

    const { filesystemLocationResolver } =
      providersFactory(
        loggerProvider,
        workspace.path,
        workspace.path);

    checkResolvedFiles(
      workspace,
      await filesystemLocationResolver.resolve(
        workspace.path,
        [{ pattern: '/**/*.txt' }]),
      ['f1.txt', 'd1/f2.txt', 'd1/d11/f3.txt', 'd2/f4.txt', 'd2/d21/f5.txt']);
  });

async function getTestTmpFolder(
  ): Promise<TmpDir>
{
  const workspace =
    tmpDir();

  const files =
    [
    'f1.txt',
    'd1/f2.txt',
    'd1/d11/f3.txt',
    'd2/f4.txt',
    'd2/d21/f5.txt'
  ];

  for (const file of files) {
    await workspace.writeText(
      file,
      file);
  }

  return workspace;
}

function checkResolvedFiles(
    tmpDir: TmpDir,
    resolvedFiles: string[],
    expectedFiles: string[]
  ): void
{
  const normalisedResolvedFiles =
    resolvedFiles
    .map(
      filePath =>
        path.relative(
          tmpDir.path,
          filePath))
    .map(
      filePath =>
        filePath.replace(
          /\\/g,
          '/'))
    .sort();

  const normalisedExpectedFiles =
    expectedFiles.sort();

  assert.deepEqual(
    normalisedResolvedFiles,
    normalisedExpectedFiles);
}
