import { TmpEnv,
         waitFor }
  from 'asljs-testing';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { OVERRIDE }
  from './ask.js';
import { main,
         runCli }
  from './cli.js';
import { installAgent,
         writeAgent,
         writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'board without arguments prints help with every command',
  async () =>
  {
    const io =
      createTestIo(
        process.cwd());

    assert.equal(
      await runCli(
        [ ],
        io),
      0);

    for (
      const command of [ 'develop',
                         'plan',
                         'tasks',
                         'exec',
                         'archive',
                         'list',
                         'view' ]
    ) {
      assert.match(
        io.out(),
        new RegExp(`\\n  ${command} `),
        command);
    }
  });

test(
  'board works in --working-dir, passes the guidance and --ai, and post-processes what it wrote',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'board.json',
      JSON.stringify(
        { markdownPostProcessing:
            `node -e "require('fs').appendFileSync('processed.txt', process.argv.slice(1).join('|') + '\\n')"` }));

    const io =
      createTestIo(
        dir.path,
        { [OVERRIDE]:
            await writeAgent(
              dir,
              { 'Write the plan':
                  '# P20 Restrict kids internet access\n\n## Goal\n\nOffline at night.\n{"result":"OK"}\n' }) });

    assert.equal(
      await runCli(
        [ 'plan',
          'I20',
          'keep it simple',
          '--working-dir',
          'board',
          '--ai=claude:fable' ],
        io),
      0,
      io.err());

    assert.equal(
      io.out(),
      'Created Plans/P20 Restrict kids internet access.md - 0 open questions\nNote: I20 still has 1 open questions.\n');

    assert.ok(
      (await dir.readText(
        'agent/prompts/1.txt'))
        .includes(
          'The user asks: keep it simple'));

    assert.equal(
      await dir.readText('processed.txt'),
      'board/Plans/P20 Restrict kids internet access.md\n');

    const list =
      createTestIo(dir.path);

    assert.equal(
      await runCli(
        [ 'list',
          '--working-dir',
          'board',
          '--json' ],
        list),
      0);

    assert.equal(
      JSON.parse(
        list.out()).plan.length,
      2);
  });

test(
  'board returns 1 and says why when a command fails',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    for (
      const args of [ [ 'develop',
                        'I99' ],
                      [ 'plan',
                        'I20',
                        '--ai=gpt' ],
                      [ 'tasks',
                        'P19' ],
                      [ 'exec',
                        'I19' ],
                      [ 'archive',
                        'I99' ],
                      [ 'view',
                        '--port',
                        'x' ] ]
    ) {
      const io =
        createTestIo(
          dir.resolve('board'));

      assert.equal(
        await runCli(
          args,
          io),
        1,
        args.join(' '));

      assert.notEqual(
        io.err(),
        '',
        args.join(' '));
    }
  });

test(
  'board develop takes the item and the guidance',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(
        dir.path,
        { [OVERRIDE]:
            await writeAgent(
              dir,
              { 'Develop a task':
                  '# T19-2 Add a review date\n\nAdd `Reviewed: <date>` under the heading.\n{"result":"OK"}\n' }) });

    assert.equal(
      await runCli(
        [ 'develop',
          'T19-2',
          'say where the date goes',
          '--working-dir',
          'board' ],
        io),
      0,
      io.err());

    assert.equal(
      io.out(),
      'Developed Tasks/T19-2 Add a review date.md - 0 open questions\n');

    assert.ok(
      (await dir.readText(
        'agent/prompts/1.txt'))
        .includes(
          'The user asks: say where the date goes'));
  });

test(
  'board --ai runs the named agent with the model',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const bin =
      await installAgent(
        dir,
        { 'Write the plan':
            '# P20 Restrict kids internet access\n{"result":"OK"}\n' });

    using _env =
      new TmpEnv(
        { PATH:
            `${bin}${path.delimiter}${process.env.PATH ?? ''}`,
          [OVERRIDE]: undefined });

    const io =
      createTestIo(
        dir.resolve('board'));

    assert.equal(
      await runCli(
        [ 'plan',
          'I20',
          '--ai=claude:fable' ],
        io),
      0,
      io.err());

    assert.deepEqual(
      JSON.parse(
        await dir.readText(
          'agent/prompts/1.args.json')),
      [ '-p',
        '--allowedTools',
        'Read,Grep,Glob',
        '--model',
        'fable' ]);
  });

test(
  'board --loglevel and --logfile log the command and the agent',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(
        dir.path,
        { [OVERRIDE]:
            await writeAgent(
              dir,
              { 'Write the plan':
                  '# P20 Restrict kids internet access\n\n## Goal\n\nOffline at night.\n{"result":"OK"}\n' }) });

    assert.equal(
      await main(
        [ '--loglevel',
          'debug',
          '--logfile',
          dir.resolve('board.log'),
          'plan',
          'I20',
          '--working-dir',
          'board' ],
        io),
      0,
      io.err());

    const entries =
      (await dir.readText('board.log'))
      .trim()
      .split('\n')
      .map(
        line => JSON.parse(line) as { context: string; msg: string; });

    assert.deepEqual(
      entries.map(
        entry => `${entry.context} ${entry.msg}`),
      [ 'board command started',
        'board.agent agent command from the environment',
        'board.agent agent started',
        'board.agent agent exited',
        'board command finished' ]);
  });

test(
  'board reads BOARD_LOG_LEVEL, BOARD_LOG_FILE and BOARD_LOG_FORMAT, and an option overrides its variable',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    using _env =
      new TmpEnv(
        { BOARD_LOG_LEVEL: 'debug',
          BOARD_LOG_FILE:
            dir.resolve('env.log'),
          BOARD_LOG_FORMAT: 'text' });

    const io =
      createTestIo(dir.path);

    for (
      const args of [ [ ],
                      [ '--logfile',
                        dir.resolve('option.log'),
                        '--logformat',
                        'json' ] ]
    ) {
      assert.equal(
        await main(
          [ ...args,
            'list',
            '--working-dir',
            'board' ],
          io),
        0);
    }

    const text =
      await dir.readText('env.log');

    assert.deepEqual(
      text.match(/DEBUG: board: .*/g),
      [ 'DEBUG: board: command started',
        'DEBUG: board: command finished' ]);

    assert.match(
      await dir.readText('option.log'),
      /^\{.*"msg":"command started"/);
  });

test(
  'board view serves until SIGINT or SIGTERM, and logs until it stops',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    for (
      const signal of [ 'SIGINT',
                        'SIGTERM' ] as const
    ) {
      const io =
        createTestIo(dir.path);

      const running =
        main(
          [ '--loglevel',
            'trace',
            '--logfile',
            dir.resolve(`${signal}.log`),
            'view',
            '--port',
            '0',
            '--working-dir',
            'board' ],
          io);

      await waitFor(
        () => io.out().includes('Serving'),
        5000);

      const url =
        /at (http:\S+)/.exec(
          io.out())![1];

      assert.equal(
        (await fetch(url)).status,
        200);

      process.emit(signal);

      assert.equal(
        await running,
        0);

      await assert.rejects(
        fetch(url));

      assert.deepEqual(
        (await dir.readText(`${signal}.log`))
          .trim()
          .split('\n')
          .map(
            (
                line
              ) =>
            {
              const entry =
                JSON.parse(line) as {
                context: string;
                msg: string;
              };

              return `${entry.context} ${entry.msg}`;
            }),
        [ 'board command started',
          'board.view listening',
          'board command finished',
          'board.view request' ]);
    }
  });
