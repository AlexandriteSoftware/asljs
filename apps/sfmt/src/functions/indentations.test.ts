import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { getIndentationFromLine }
  from './indentations.js';

test(
  'getIndentationFromLine: returns the indentation of a line',
  (): void =>
  {
    assert.deepEqual(
      getIndentationFromLine(
        '    indented line'),
      '    ');
  });
