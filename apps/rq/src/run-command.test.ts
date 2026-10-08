import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { runCommand }
  from './run-command.js';

test(
  'runCommand passes the input and collects the output and the exit code',
  async () =>
  {
    const run =
      await runCommand(
        "node -e \"process.stdin.pipe(process.stdout); process.stdin.on('end', () => { console.error('e'); process.exitCode = 2; })\"",
        process.cwd(),
        'hello');

    assert.deepEqual(
      { ...run,
        stderr:
          run.stderr.trim() },
      { code: 2,
        stdout: 'hello',
        stderr: 'e' });
  });
