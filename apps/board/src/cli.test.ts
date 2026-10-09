import { TmpEnv }
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
import { runCli }
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
