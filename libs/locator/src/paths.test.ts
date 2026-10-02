import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { toPosixPath }
  from './paths.js';

const TEST_SUITE = 'paths';

test(
  `${TEST_SUITE}: backslashes become forward slashes`,
  (): void =>
  {
    assert.equal(
      toPosixPath('d1\\d11\\f3.txt'),
      'd1/d11/f3.txt');

    assert.equal(
      toPosixPath('already/posix.txt'),
      'already/posix.txt');
  });
