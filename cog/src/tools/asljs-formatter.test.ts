import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { AsljsFormatterTool }
  from './asljs-formatter.js';
import { type CommandResult,
         type CommandRunner }
  from './tool.js';

test(
  'ASLJS formatter runs dprint once and sfmt per TypeScript file',
  async () =>
  {
    const calls: readonly string[][] = [ ];

    const runner: CommandRunner =
      { run(
        _command,
        arguments_
      ): Promise<CommandResult>
      {
        (calls as string[][]).push(
          [ ...arguments_ ]);

        return Promise.resolve(
          { exitCode: 0,
            stdout: '',
            stderr: '' });
      } };

    await new AsljsFormatterTool(
      runner)
      .format(
        'repo',
        'dprint.json',
        [ 'one.ts',
          'two.ts' ]);

    assert.deepEqual(
      calls,
      [ [ 'dprint',
          'fmt',
          '--config',
          'dprint.json',
          'one.ts',
          'two.ts' ],
        [ 'sfmt',
          'format',
          'one.ts' ],
        [ 'sfmt',
          'format',
          'two.ts' ] ]);
  });
