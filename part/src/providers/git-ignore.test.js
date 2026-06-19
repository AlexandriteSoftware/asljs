import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir }
  from '../tmp-dir.js';
import { createLogger }
  from '../logging.js';
import { GitIgnore }
  from './git-ignore.js';

const logger =
  createLogger(
    { enabled: false,
      level: 'trace' });

test(
  'RQ203: GitIgnore filters paths using root and nested .gitignore files',
  async () =>
  {
    const workspace =
      new TmpDir(
        logger);

    workspace.mkdir(
      'docs/drafts');

    workspace.writeText(
      '.gitignore',
      'ignored.md\n');

    workspace.writeText(
      'docs/.gitignore',
      'drafts/\n');

    const gitIgnore =
      new GitIgnore(
        createLogger());

    const files =
      [ 'keep.md',
        'ignored.md',
        'docs/guide.md',
        'docs/drafts/draft.md' ];

    /** @type { Record<string, string> } */
    const filePaths = { };

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