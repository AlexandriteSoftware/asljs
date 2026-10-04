import { createTestLoggerProvider }
  from 'asljs-logging';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { LocationResolver,
         toPatterns }
  from './location.js';

const TEST_SUITE = 'location';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

const logger =
  loggerProvider.getLogger('location');

const FILES =
  [ 'f1.txt',
    'd1/f2.txt',
    'd1/d11/f3.txt',
    'd2/f4.txt',
    'd2/d21/f5.txt' ];

async function workspaceWithFiles(
  ): Promise<TmpDir>
{
  const tmpDir =
    new TmpDir(logger);

  for (const file of FILES) {
    await tmpDir.writeText(
      file,
      file);
  }

  return tmpDir;
}

function resolverFor(
    rootPath: string
  ): LocationResolver
{
  return new LocationResolver(
    logger,
    rootPath);
}

function checkResolved(
    tmpDir: TmpDir,
    resolved: string[],
    expected: string[]
  ): void
{
  const relative =
    resolved
    .map(
      filePath =>
        path.relative(
          tmpDir.path,
          filePath))
    .map(
      filePath =>
        filePath.replaceAll(
          '\\',
          '/'))
    .sort();

  assert.deepEqual(
    relative,
    [ ...expected ].sort());
}

test(
  `${TEST_SUITE}: a pattern and patterns are read as one list`,
  (): void =>
  {
    assert.deepEqual(
      toPatterns(
        { pattern: 'a' }),
      [ 'a' ]);

    assert.deepEqual(
      toPatterns(
        { patterns:
            [ 'a',
              'b' ] }),
      [ 'a',
        'b' ]);

    // Both forms exist because `part` declares one pattern and `cog` a list.
    assert.deepEqual(
      toPatterns(
        { pattern: 'a',
          patterns:
            [ 'b' ] }),
      [ 'a',
        'b' ]);
  });

test(
  `${TEST_SUITE}: a location without a pattern is refused`,
  (): void =>
  {
    assert.throws(
      () => toPatterns({}),
      /needs a pattern or patterns/);
  });

test(
  `${TEST_SUITE}: a relative pattern resolves against the base path`,
  async (): Promise<void> =>
  {
    await using workspace =
      await workspaceWithFiles();

    checkResolved(
      workspace,
      await resolverFor(workspace.path)
        .resolve(
          workspace.path,
          { patterns:
              [ '**/*.txt' ] }),
      FILES);
  });

test(
  `${TEST_SUITE}: a relative pattern follows the base path down`,
  async (): Promise<void> =>
  {
    await using workspace =
      await workspaceWithFiles();

    checkResolved(
      workspace,
      await resolverFor(workspace.path)
        .resolve(
          path.join(
            workspace.path,
            'd1'),
          { patterns:
              [ '**/*.txt' ] }),
      [ 'd1/f2.txt',
        'd1/d11/f3.txt' ]);
  });

test(
  `${TEST_SUITE}: an anchored pattern resolves against the root`,
  async (): Promise<void> =>
  {
    await using workspace =
      await workspaceWithFiles();

    // The base path is a subdirectory, yet the result is rooted, which is the
    // point of the leading slash.
    checkResolved(
      workspace,
      await resolverFor(workspace.path)
        .resolve(
          path.join(
            workspace.path,
            'd1'),
          { patterns:
              [ '/**/*.txt' ] }),
      FILES);
  });

test(
  `${TEST_SUITE}: a single pattern works as well as a list`,
  async (): Promise<void> =>
  {
    await using workspace =
      await workspaceWithFiles();

    checkResolved(
      workspace,
      await resolverFor(workspace.path)
        .resolve(
          workspace.path,
          { pattern: 'd2/**/*.txt' }),
      [ 'd2/f4.txt',
        'd2/d21/f5.txt' ]);
  });

test(
  `${TEST_SUITE}: exclude removes matches`,
  async (): Promise<void> =>
  {
    await using workspace =
      await workspaceWithFiles();

    checkResolved(
      workspace,
      await resolverFor(workspace.path)
        .resolve(
          workspace.path,
          { patterns:
              [ '**/*.txt' ],
            exclude:
              [ 'd1/**',
                'f1.txt' ] }),
      [ 'd2/f4.txt',
        'd2/d21/f5.txt' ]);
  });

test(
  `${TEST_SUITE}: several locations are merged, deduplicated and sorted`,
  async (): Promise<void> =>
  {
    await using workspace =
      await workspaceWithFiles();

    const resolved =
      await resolverFor(workspace.path)
      .resolve(
        workspace.path,
        [ { patterns:
              [ 'd1/**/*.txt' ] },
          { patterns:
              [ 'd1/f2.txt',
                'f1.txt' ] } ]);

    checkResolved(
      workspace,
      resolved,
      [ 'f1.txt',
        'd1/f2.txt',
        'd1/d11/f3.txt' ]);

    assert.deepEqual(
      resolved,
      [ ...resolved ].sort(
        (a, b) => a.localeCompare(b)));
  });

test(
  `${TEST_SUITE}: mixing file and directory patterns is refused`,
  async (): Promise<void> =>
  {
    await using workspace =
      await workspaceWithFiles();

    await assert.rejects(
      () =>
        resolverFor(workspace.path)
          .resolve(
            workspace.path,
            { patterns:
                [ '**/*.txt',
                  'd1/' ] }),
      /all files or all directories/);
  });

test(
  `${TEST_SUITE}: an unknown filter is refused`,
  async (): Promise<void> =>
  {
    await using workspace =
      await workspaceWithFiles();

    await assert.rejects(
      () =>
        resolverFor(workspace.path)
          .resolve(
            workspace.path,
            { patterns:
                [ '**/*.txt' ],
              filters:
                [ { name: 'Nonsense' } ] }),
      /Unknown filter: Nonsense/);
  });

test(
  `${TEST_SUITE}: check answers for a path without walking the tree`,
  async (): Promise<void> =>
  {
    await using workspace =
      await workspaceWithFiles();

    const resolver =
      resolverFor(workspace.path);

    const target =
      path.join(
        workspace.path,
        'd1',
        'f2.txt');

    assert.equal(
      await resolver.check(
        target,
        workspace.path,
        { patterns:
            [ '**/*.txt' ] }),
      true);

    assert.equal(
      await resolver.check(
        target,
        workspace.path,
        { patterns:
            [ '**/*.md' ] }),
      false);

    assert.equal(
      await resolver.check(
        target,
        workspace.path,
        { patterns:
            [ '**/*.txt' ],
          exclude:
            [ 'd1/**' ] }),
      false);

    // Anchored against the root, with the base path pointing elsewhere.
    assert.equal(
      await resolver.check(
        target,
        path.join(
          workspace.path,
          'd2'),
        { patterns:
            [ '/d1/*.txt' ] }),
      true);
  });

test(
  `${TEST_SUITE}: check accepts several locations`,
  async (): Promise<void> =>
  {
    await using workspace =
      await workspaceWithFiles();

    assert.equal(
      await resolverFor(workspace.path)
        .check(
          path.join(
            workspace.path,
            'f1.txt'),
          workspace.path,
          [ { patterns:
                [ 'd1/**' ] },
            { patterns:
                [ '*.txt' ] } ]),
      true);
  });
