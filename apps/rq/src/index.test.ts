import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import * as rq
  from './index.js';

test(
  'index exports the CLI and the model readers',
  () =>
  {
    assert.deepEqual(
      Object.keys(rq).sort(),
      [ 'loadGraph',
        'parseDocument',
        'runCli' ]);
  });
