import { NullLogger }
  from 'asljs-logging';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { GitIgnore }
  from './git-ignore.js';

const TEST_SUITE = 'git-ignore';

const logger =
  new NullLogger();

test(
  `${TEST_SUITE}: paths are filtered by the root and nested .gitignore files`,
  async () =>
  {
    await using workspace =
      new TmpDir(
        logger);

    await workspace.mkdir(
      'docs/drafts');

    await workspace.writeText(
      '.gitignore',
      'ignored.md\n');

    await workspace.writeText(
      'docs/.gitignore',
      'drafts/\n');

    const gitIgnore =
      new GitIgnore(logger);

    const files =
      [ 'keep.md',
        'ignored.md',
        'docs/guide.md',
        'docs/drafts/draft.md' ];

    const filePaths: Record<string, string> = {};

    for (const file of files) {
      filePaths[file] =
        workspace.resolve(file);
    }

    assert.equal(
      gitIgnore.isIgnored(
        filePaths['ignored.md']),
      true);

    assert.equal(
      gitIgnore.isIgnored(
        filePaths['docs/drafts/draft.md']),
      true);

    assert.equal(
      gitIgnore.isIgnored(
        filePaths['docs/guide.md']),
      false);

    assert.deepEqual(
      gitIgnore.filter(
        Object.values(filePaths)),
      [ filePaths['keep.md'],
        filePaths['docs/guide.md'] ]);
  });

test(
  `${TEST_SUITE}: a relative path is refused`,
  (): void =>
  {
    assert.throws(
      () =>
        new GitIgnore(logger)
          .isIgnored('docs/guide.md'),
      /must be absolute/);
  });
