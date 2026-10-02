import { NullLogger }
  from 'asljs-logging';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { groupByExtension,
         locateFiles,
         toPatterns }
  from './files.js';

const TEST_SUITE = 'files';

const logger =
  new NullLogger();

test(
  `${TEST_SUITE}: nothing to include falls back to everything`,
  (): void =>
  {
    assert.deepEqual(
      toPatterns(
        [ ],
        '**/*'),
      [ '**/*' ]);
  });

test(
  `${TEST_SUITE}: a pattern also matches the subtree it names`,
  (): void =>
  {
    // `--exclude apps` has to mean the directory, not a file called `apps`.
    assert.deepEqual(
      toPatterns(
        [ 'apps' ],
        '**/*'),
      [ 'apps',
        'apps/**' ]);

    assert.deepEqual(
      toPatterns(
        [ 'docs/' ],
        '**/*'),
      [ 'docs',
        'docs/**' ]);

    assert.deepEqual(
      toPatterns(
        [ 'docs\\nested' ],
        '**/*'),
      [ 'docs/nested',
        'docs/nested/**' ]);
  });

test(
  `${TEST_SUITE}: files group by extension, case insensitively`,
  (): void =>
  {
    const files =
      [ 'README.md',
        'package.json',
        'src/index.ts',
        'docs/API.MD',
        'tsconfig.JSON',
        'notes.txt' ];

    assert.deepEqual(
      groupByExtension(
        files,
        [ '.md' ]),
      [ 'README.md',
        'docs/API.MD' ]);

    assert.deepEqual(
      groupByExtension(
        files,
        [ '.json' ]),
      [ 'package.json',
        'tsconfig.JSON' ]);

    assert.deepEqual(
      groupByExtension(
        files,
        [ '.rs' ]),
      [ ]);
  });

test(
  `${TEST_SUITE}: located files skip what .gitignore excludes`,
  async (): Promise<void> =>
  {
    await using workspace =
      new TmpDir(logger);

    await workspace.writeText(
      '.gitignore',
      'build\n');

    await workspace.writeText(
      'README.md',
      '# readme');

    await workspace.writeText(
      'docs/guide.md',
      '# guide');

    await workspace.writeText(
      'build/generated.md',
      '# generated');

    assert.deepEqual(
      await locateFiles(
        logger,
        workspace.path,
        { includes: [ ],
          excludes: [ ] }),
      [ '.gitignore',
        'README.md',
        'docs/guide.md' ]);
  });

test(
  `${TEST_SUITE}: an excluded directory takes everything beneath it`,
  async (): Promise<void> =>
  {
    await using workspace =
      new TmpDir(logger);

    await workspace.writeText(
      'README.md',
      '# readme');

    await workspace.writeText(
      'docs/guide.md',
      '# guide');

    await workspace.writeText(
      'docs/nested/deep.md',
      '# deep');

    assert.deepEqual(
      await locateFiles(
        logger,
        workspace.path,
        { includes: [ ],
          excludes:
            [ 'docs' ] }),
      [ 'README.md' ]);
  });

test(
  `${TEST_SUITE}: an include narrows the result`,
  async (): Promise<void> =>
  {
    await using workspace =
      new TmpDir(logger);

    await workspace.writeText(
      'README.md',
      '# readme');

    await workspace.writeText(
      'docs/guide.md',
      '# guide');

    assert.deepEqual(
      await locateFiles(
        logger,
        workspace.path,
        { includes:
            [ 'docs' ],
          excludes: [ ] }),
      [ 'docs/guide.md' ]);
  });
