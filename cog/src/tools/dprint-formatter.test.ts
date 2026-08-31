import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { DprintFormatterTool }
  from './dprint-formatter.js';
import { type CommandResult,
         type CommandRunner }
  from './tool.js';

test(
  'dprint formatter passes explicit files and config',
  async () =>
  {
    let call: readonly string[] | undefined;

    const runner: CommandRunner =
      { run(
        _command,
        arguments_
      ): Promise<CommandResult>
      {
        call = arguments_;

        return Promise.resolve(
          { exitCode: 0,
            stdout: '',
            stderr: '' });
      } };

    await new DprintFormatterTool(
      runner)
      .format(
        'repo',
        'dprint.md.json',
        [ 'README.md' ]);

    assert.deepEqual(
      call,
      [ 'dprint',
        'fmt',
        '--config',
        'dprint.md.json',
        'README.md' ]);
  });
