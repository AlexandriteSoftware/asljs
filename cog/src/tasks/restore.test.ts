import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { RestoreTask }
  from './restore.js';

test(
  'restore task retains its parameters',
  () =>
  {
    const parameters =
      { backupPath: 'backup.json' };

    const task =
      new RestoreTask(
        parameters);

    assert.equal(
      task.parameters,
      parameters);
  });
