import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { runCommand,
         runProgram }
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

test(
  'runProgram passes the arguments without a shell',
  async () =>
  {
    const run =
      await runProgram(
        process.execPath,
        [ '-e',
          'console.log(process.argv[1])',
          'a "b" $c %d%' ],
        process.cwd());

    assert.deepEqual(
      { ...run,
        stdout:
          run.stdout.trim() },
      { code: 0,
        stdout: 'a "b" $c %d%',
        stderr: '' });
  });
