import assert from 'node:assert/strict';
import test from 'node:test';
import {
  useDom
} from '../testing/dom.js';
import git from './git.js';

const CLEAN = {
  status: 'ok',
  branch: 'main',
  commit: '1a2b3c4',
  upstream: 'origin/main',
  ahead: 0,
  behind: 0,
  pushed: true,
  dirty: false,
  staged: 0,
  changed: 0,
  untracked: 0,
  conflicted: 0
};

const linesOf = body =>
  [...body.children].map(child => child.textContent);

test('git draws the branch, the commit, the remote position and clean', () =>
{
  using dom = useDom();

  const body = dom.body();
  git(body, CLEAN);

  assert.deepEqual(linesOf(body), [
    'main1a2b3c4',
    'origin/main · pushed',
    'clean'
  ]);
  assert.equal(body.children[1].className, 'note status-ok');
});

test('git marks a dirty commit with +, and draws a row per kind of pending change', () =>
{
  using dom = useDom();

  const body = dom.body();
  git(body, {
    ...CLEAN,
    ahead: 1,
    behind: 2,
    pushed: false,
    dirty: true,
    staged: 1,
    changed: 2,
    untracked: 3,
    conflicted: 4
  });

  assert.equal(body.querySelector('.git-sha').textContent, '1a2b3c4+');
  assert.equal(body.children[1].textContent, 'origin/main · ahead 1, behind 2');
  assert.equal(body.children[1].className, 'note status-warn');
  assert.deepEqual(
    [...body.querySelectorAll('li')].map(row => row.textContent),
    ['staged1', 'not staged2', 'untracked3', 'conflicted4']
  );
});

test('git says when there is no upstream, and draws a missing or bare value as a message', () =>
{
  using dom = useDom();

  const body = dom.body();
  git(body, { ...CLEAN, upstream: '' });
  assert.equal(body.children[1].textContent, 'no upstream');
  assert.equal(body.children[1].className, 'note status-warn');

  git(body, null);
  assert.equal(body.textContent, 'no status');

  git(body, 'not a repository', { empty: 'unused' });
  assert.equal(body.textContent, 'not a repository');
});
