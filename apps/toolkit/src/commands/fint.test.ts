import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { parseFintArgs }
  from './fint.js';

const TEST_SUITE = 'fint';

test(
  `${TEST_SUITE}: args split into includes and excludes`,
  (): void =>
  {
    assert.deepEqual(
      parseFintArgs(
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
            'libs' ] });
  });

test(
  `${TEST_SUITE}: no args selects everything`,
  (): void =>
  {
    assert.deepEqual(
      parseFintArgs(),
      { includes: [ ],
        excludes: [ ] });
  });

test(
  `${TEST_SUITE}: --exclude without a glob is refused`,
  (): void =>
  {
    assert.throws(
      () =>
        parseFintArgs(
          [ '--exclude' ]),
      /--exclude needs a glob/);

    assert.throws(
      () =>
        parseFintArgs(
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
        parseFintArgs(
          [ '--include',
            'docs' ]),
      /Unknown option: --include/);
  });
