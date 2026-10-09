import {
  TmpDir
} from 'asljs-tmpdir';
import assert from 'node:assert/strict';
import {
  spawnSync
} from 'node:child_process';
import test from 'node:test';

// The agent is PowerShell; without pwsh there is nothing to run it with.
const PWSH = spawnSync('pwsh', ['-NoProfile', '-Command', 'exit 0']).status === 0;

const ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: 'Test',
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'Test',
  GIT_COMMITTER_EMAIL: 'test@example.com'
};

const git = (cwd, ...args) =>
{
  const result = spawnSync('git', args, { cwd, env: ENV, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
};

/** Runs the agent in `cwd`, as the runner does: the value is what it prints. */
const agent = cwd =>
  spawnSync(
    'pwsh',
    ['-NoProfile', '-File', `${import.meta.dirname}/git.ps1`],
    { cwd, encoding: 'utf8' }
  );

const valueIn = cwd =>
{
  const result = agent(cwd);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
};

/** A clone of a bare origin, with one commit pushed to main. */
const cloned = async dir =>
{
  git(dir.path, 'init', '--bare', '--initial-branch=main', 'origin.git');
  git(dir.path, 'clone', 'origin.git', 'work');
  const work = dir.resolve('work');
  await dir.writeText('work/a.txt', 'a\n');
  git(work, 'add', 'a.txt');
  git(work, 'commit', '-m', 'first');
  git(work, 'push', '-u', 'origin', 'main');
  return work;
};

test('git reports a clean, pushed working folder as ok', { skip: !PWSH }, async () =>
{
  await using dir = new TmpDir();
  const work = await cloned(dir);
  const commit = git(work, 'rev-parse', '--short=7', 'HEAD');

  assert.deepEqual(valueIn(work), {
    status: 'ok',
    branch: 'main',
    commit,
    upstream: 'origin/main',
    ahead: 0,
    behind: 0,
    pushed: true,
    dirty: false,
    staged: 0,
    changed: 0,
    untracked: 0,
    conflicted: 0,
    message: `main ${commit} clean`
  });
});

test('git counts staged, changed and untracked entries and commits to push, as warn', { skip: !PWSH }, async () =>
{
  await using dir = new TmpDir();
  const work = await cloned(dir);

  await dir.writeText('work/b.txt', 'b\n');
  git(work, 'add', 'b.txt');
  git(work, 'commit', '-m', 'second');
  await dir.writeText('work/a.txt', 'changed\n');
  await dir.writeText('work/c.txt', 'c\n');
  git(work, 'add', 'c.txt');
  await dir.writeText('work/c.txt', 'changed again\n');
  await dir.writeText('work/new/one.txt', '1\n');
  await dir.writeText('work/new/two.txt', '2\n');

  const value = valueIn(work);
  const commit = git(work, 'rev-parse', '--short=7', 'HEAD');

  assert.deepEqual(
    {
      status: value.status,
      ahead: value.ahead,
      pushed: value.pushed,
      dirty: value.dirty,
      staged: value.staged,
      changed: value.changed,
      untracked: value.untracked
    },
    {
      status: 'warn',
      ahead: 1,
      pushed: false,
      dirty: true,
      staged: 1,
      changed: 2,
      untracked: 1
    }
  );
  assert.equal(
    value.message,
    `main ${commit} 1 staged, 2 changed, 1 untracked, ahead 1`
  );
});

test('git says no upstream, and has no commit before the first one', { skip: !PWSH }, async () =>
{
  await using dir = new TmpDir();
  git(dir.path, 'init', '--initial-branch=main', 'fresh');

  const value = valueIn(dir.resolve('fresh'));

  assert.equal(value.status, 'warn');
  assert.equal(value.commit, '');
  assert.equal(value.upstream, '');
  assert.equal(value.pushed, false);
  assert.equal(value.message, 'main  no upstream');
});

test('git exits non-zero outside a repository, so the runner records nothing', { skip: !PWSH }, async () =>
{
  await using dir = new TmpDir();

  const result = agent(dir.path);

  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, '');
});
