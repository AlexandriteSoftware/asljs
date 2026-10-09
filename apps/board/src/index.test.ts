import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import * as board
  from './index.js';

test(
  'index exports the CLI and the board readers',
  () =>
  {
    assert.deepEqual(
      Object.keys(board).sort(),
      [ 'CONFIG_FILE',
        'countOpen',
        'findItem',
        'loadBoard',
        'parseId',
        'readQuestions',
        'runCli',
        'toCards' ]);
  });
