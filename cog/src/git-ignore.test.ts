import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { GitIgnore }
  from './git-ignore.js';
import { createLoggerProvider }
  from './logger.js';

const loggerProvider =
  createLoggerProvider();

const logger =
  loggerProvider.getLogger(
    'git-ignore.test');

test.after(
  async () =>
    await loggerProvider.dispose());

test(
  'RQ203: GitIgnore filters paths using root and nested .gitignore files',
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
      new GitIgnore(
        loggerProvider.getLogger(
          'GitIgnore'));

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
