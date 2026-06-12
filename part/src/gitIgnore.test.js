import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import os
  from 'node:os';
import path
  from 'node:path';
import { mkdtemp,
         mkdir,
         writeFile }
  from 'node:fs/promises';
import { GitIgnore }
  from './gitIgnore.js';
import { createLogger }
  from './logging.js';

test(
  'RQ203: GitIgnore filters paths using root and nested .gitignore files',
  async () =>
  {
    const workspacePath =
      await mkdtemp(
        path.join(os.tmpdir(),
        'part-gitignore-'));

    await mkdir(
      path.join(workspacePath, 'docs', 'drafts'),
      { recursive: true });

    await writeFile(
      path.join(workspacePath, '.gitignore'),
      'ignored.md\n');

    await writeFile(
      path.join(workspacePath, 'docs', '.gitignore'),
      'drafts/\n');

    const gitIgnore =
      new GitIgnore(
        createLogger(),
        workspacePath);

    const filePaths =
      [ path.join(workspacePath, 'keep.md'),
        path.join(workspacePath, 'ignored.md'),
        path.join(workspacePath, 'docs', 'guide.md'),
        path.join(workspacePath, 'docs', 'drafts', 'draft.md') ];

    assert.equal(
      gitIgnore.isIgnored(
        path.join(workspacePath, 'ignored.md')),
      true);

    assert.equal(
      gitIgnore.isIgnored(
        path.join(workspacePath, 'docs', 'drafts', 'draft.md')),
      true);

    assert.equal(
      gitIgnore.isIgnored(
        path.join(workspacePath, 'docs', 'guide.md')),
      false);

    assert.deepEqual(
      gitIgnore.filter(filePaths),
      [ path.join(workspacePath, 'keep.md'),
        path.join(workspacePath, 'docs', 'guide.md') ]);
  });