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
import { execExec,
         readStatus }
  from './exec.js';
import { installAgent,
         writeAgent,
         writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'execExec carries out the tasks in order, skipping done ones, and writes their results',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'board/Tasks/T19-3 Report the articles.md',
      '# T19-3 Report the articles\n\nList those past their date.\n');

    const io =
      createTestIo(
        dir.resolve('board'),
        { [OVERRIDE]:
            await writeAgent(
              dir,
              { 'The task: Tasks/T19-2':
                  'Added `Reviewed:` to 3 articles:\n\n- `a.md`\n{"result":"OK","message":""}\n',
                'The task: Tasks/T19-3':
                  'Wrote the report.\n{"result":"OK"}\n' }) });

    assert.equal(
      await execExec(
        io,
        { target: 'P19' }),
      0);

    assert.equal(
      io.out(),
      `DONE     Tasks/T19-1 Choose the articles.md - earlier
DONE     Tasks/T19-2 Add a review date.md
Result   Results/R19-2 Add a review date.md
DONE     Tasks/T19-3 Report the articles.md
Result   Results/R19-3 Report the articles.md
`);

    assert.equal(
      await dir.readText(
        'board/Results/R19-2 Add a review date.md'),
      '# R19-2 Add a review date\n\n- Status: DONE\n- Task: [T19-2 Add a review date][T19-2]\n- Date: 2026-01-02T03:04:05.000Z\n\nAdded `Reviewed:` to 3 articles:\n\n- `a.md`\n\n[T19-2]: <../Tasks/T19-2 Add a review date.md>\n');

    const prompt =
      await dir.readText(
        'agent/prompts/2.txt');

    for (
      const text of [ 'The task: Tasks/T19-3 Report the articles.md',
                      'Its plan: Plans/P19 Track how fresh articles are.md',
                      'Its idea: Ideas/I19 Track how fresh articles are.md',
                      'Done earlier: Results/R19-1 Choose the articles.md',
                      'Done earlier: Results/R19-2 Add a review date.md',
                      'You may read and edit files and run commands',
                      'Nobody answers while you work: do not ask the user anything.',
                      '{"result":"Blocked"' ]
    ) {
      assert.ok(
        prompt.includes(text),
        text);
    }
  });

test(
  'execExec stops at a blocked task, asks its questions, and runs it again later',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const blocked =
      createTestIo(
        dir.resolve('board'),
        { [OVERRIDE]:
            await writeAgent(
              dir,
              { 'The task: Tasks/T19-2':
                  'I need to know where the articles are.\n{"result":"Blocked","message":"Which folder?","questions":["Which folder holds the articles?"]}\n' }) });

    assert.equal(
      await execExec(
        blocked,
        { target: 'P19' }),
      1);

    assert.match(
      blocked.out(),
      /\nBLOCKED  Tasks\/T19-2 Add a review date\.md - Which folder\?\nResult   Results\/R19-2 Add a review date\.md\nUpdated  Tasks\/T19-2 Add a review date\.md - answer its open questions, then run board exec P19 again\n$/);

    assert.equal(
      await dir.readText(
        'board/Tasks/T19-2 Add a review date.md'),
      '# T19-2 Add a review date\n\nAdd `Reviewed:` to each chosen article.\n\n## Open questions\n\n- Which folder holds the articles?\n');

    assert.equal(
      readStatus(
        await dir.readText(
          'board/Results/R19-2 Add a review date.md')),
      'BLOCKED');

    const again =
      createTestIo(
        dir.resolve('board'),
        { [OVERRIDE]:
            await writeAgent(
              dir,
              { 'The result of the last attempt: Results/R19-2':
                  'Done now.\n{"result":"OK"}\n' }) });

    assert.equal(
      await execExec(
        again,
        { target: 'P19' }),
      0);

    assert.equal(
      readStatus(
        await dir.readText(
          'board/Results/R19-2 Add a review date.md')),
      'DONE');
  });

test(
  'execExec stops at a failed task, and refuses a plan without tasks',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'board/Tasks/T19-3 Report the articles.md',
      '# T19-3 Report the articles\n');

    await dir.writeText(
      'board/Plans/P20 Restrict kids internet access.md',
      '# P20 Restrict kids internet access\n');

    const io =
      createTestIo(
        dir.resolve('board'),
        { [OVERRIDE]:
            await writeAgent(
              dir,
              { 'The task: Tasks/T19-2':
                  '{"result":"Fail","message":"The articles are read-only."}\n' }) });

    assert.equal(
      await execExec(
        io,
        { target: 'P19' }),
      1);

    assert.match(
      io.out(),
      /\nFAILED   Tasks\/T19-2 Add a review date\.md - The articles are read-only\.\nResult   Results\/R19-2 Add a review date\.md\n$/);

    assert.equal(
      await dir.readText(
        'board/Results/R19-2 Add a review date.md'),
      '# R19-2 Add a review date\n\n- Status: FAILED - The articles are read-only.\n- Task: [T19-2 Add a review date][T19-2]\n- Date: 2026-01-02T03:04:05.000Z\n\n[T19-2]: <../Tasks/T19-2 Add a review date.md>\n');

    await assert.rejects(
      dir.stat(
        'board/Results/R19-3 Report the articles.md'));

    await assert.rejects(
      execExec(
        io,
        { target: 'P20' }),
      /P20 has no tasks; make them with board tasks P20\./);

    await assert.rejects(
      execExec(
        io,
        { target: 'I19' }),
      /I19 is an idea; board exec carries out the tasks of a plan\./);
  });

test(
  'execExec runs the detected agent with its model, allowed to edit files and run commands',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const bin =
      await installAgent(
        dir,
        {});

    using _env =
      new TmpEnv(
        { PATH:
            `${bin}${path.delimiter}${process.env.PATH ?? ''}`,
          [OVERRIDE]: undefined });

    const io =
      { ...createTestIo(
        dir.resolve('board')),
        detectAgent:
          async () => 'claude' as const };

    assert.equal(
      await execExec(
        io,
        { target: 'P19',
          ai:
            { model: 'fable' } }),
      0,
      io.err());

    assert.deepEqual(
      JSON.parse(
        await dir.readText(
          'agent/prompts/1.args.json')),
      [ '-p',
        '--allowedTools',
        'Read,Grep,Glob,Bash,Edit,Write',
        '--model',
        'fable' ]);
  });
