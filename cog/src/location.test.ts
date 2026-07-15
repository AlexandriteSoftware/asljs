import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { LocationResolver }
  from './location.js';
import { createLogger }
  from './logger.js';

test(
  'RQ205: FilesystemLocationResolver resolvers files: relative, base = root',
  async () =>
  {
    await using workspace =
      await getTestTmpFolder();

    const resolver =
      new LocationResolver(
      createLogger(),
      workspace.path
    );

    checkResolvedFiles(
      workspace,
      await resolver.resolve(
        workspace.path,
        { patterns: ['**/*.txt'] }
      ),
      ['f1.txt', 'd1/f2.txt', 'd1/d11/f3.txt', 'd2/f4.txt', 'd2/d21/f5.txt']
    );
  }
);

test(
  'RQ205: FilesystemLocationResolver resolvers files: relative, base = d1',
  async () =>
  {
    await using workspace =
      await getTestTmpFolder();

    const resolver =
      new LocationResolver(
      createLogger(),
      workspace.path
    );

    checkResolvedFiles(
      workspace,
      await resolver.resolve(
        path.join(
          workspace.path,
          'd1'
        ),
        { patterns: ['**/*.txt'] }
      ),
      ['d1/f2.txt', 'd1/d11/f3.txt']
    );
  }
);

test(
  'RQ205: FilesystemLocationResolver resolvers files: absolute',
  async () =>
  {
    await using workspace =
      await getTestTmpFolder();

    const resolver =
      new LocationResolver(
      createLogger(),
      workspace.path
    );

    checkResolvedFiles(
      workspace,
      await resolver.resolve(
        workspace.path,
        { patterns: ['/**/*.txt'] }
      ),
      ['f1.txt', 'd1/f2.txt', 'd1/d11/f3.txt', 'd2/f4.txt', 'd2/d21/f5.txt']
    );
  }
);

async function getTestTmpFolder(): Promise<TmpDir>
{
  const tmpDir =
    new TmpDir(
    createLogger()
  );

  const files =
    [
    'f1.txt',
    'd1/f2.txt',
    'd1/d11/f3.txt',
    'd2/f4.txt',
    'd2/d21/f5.txt'
  ];

  for (const file of files) {
    await tmpDir.writeText(
      file,
      file
    );
  }

  return tmpDir;
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
          filePath
        )
    )
    .map(
      filePath =>
        filePath.replace(
          /\\/g,
          '/'
        )
    )
    .sort();

  const normalisedExpectedFiles =
    expectedFiles.sort();

  assert.deepEqual(
    normalisedResolvedFiles,
    normalisedExpectedFiles
  );
}
