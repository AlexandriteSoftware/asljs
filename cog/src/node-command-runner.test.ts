import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { NodeCommandRunner }
  from './node-command-runner.js';

test(
  'node command runner captures process output and exit code',
  async () =>
  {
    const result =
      await new NodeCommandRunner()
      .run(
        process.execPath,
        [ '-e',
          'process.stdout.write("ok")' ],
        process.cwd());

    assert.equal(
      result.exitCode,
      0);

    assert.equal(
      result.stdout,
      'ok');

    assert.equal(
      result.stderr,
      '');
  });
