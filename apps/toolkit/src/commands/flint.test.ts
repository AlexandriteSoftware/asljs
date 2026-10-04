import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { parseFlintArgs }
  from './flint.js';

const TEST_SUITE = 'flint';

test(
  `${TEST_SUITE}: args split into includes and excludes`,
  (): void =>
  {
    assert.deepEqual(
      parseFlintArgs(
        [ 'docs',
          '*.md',
          '--exclude',
          'apps',
          '--exclude',
          'libs' ]),
      { includes:
          [ 'docs',
            '*.md' ],
        excludes:
          [ 'apps',
            'libs' ],
        fix: false });
  });

test(
  `${TEST_SUITE}: no args selects everything`,
  (): void =>
  {
    assert.deepEqual(
      parseFlintArgs(),
      { includes: [ ],
        excludes: [ ],
        fix: false });
  });

test(
  `${TEST_SUITE}: --fix lets eslint fix, wherever it appears`,
  (): void =>
  {
    assert.deepEqual(
      parseFlintArgs(
        [ 'src',
          '--fix',
          '--exclude',
          'build' ]),
      { includes:
          [ 'src' ],
        excludes:
          [ 'build' ],
        fix: true });
  });

test(
  `${TEST_SUITE}: --exclude without a glob is refused`,
  (): void =>
  {
    assert.throws(
      () =>
        parseFlintArgs(
          [ '--exclude' ]),
      /--exclude needs a glob/);

    assert.throws(
      () =>
        parseFlintArgs(
          [ '--exclude',
            '--exclude',
            'apps' ]),
      /--exclude needs a glob/);
  });

test(
  `${TEST_SUITE}: an unknown option is refused`,
  (): void =>
  {
    assert.throws(
      () =>
        parseFlintArgs(
          [ '--include',
            'docs' ]),
      /Unknown option: --include/);
  });
