import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { OVERRIDE }
  from './ask.js';
import { execTasks,
         readTasks }
  from './tasks.js';
import { writeAgent,
         writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'readTasks reads a task per level 2 heading, with its headings a level up',
  () =>
  {
    assert.deepEqual(
      readTasks(
        'Here they are.\n\n## Set a schedule\n\nOn the router.\n\n### Open questions\n\n- Which router?\n\n## Check it\n\n## \n\n# Done\n'),
      [ { subject: 'Set a schedule',
          body:
            'On the router.\n\n## Open questions\n\n- Which router?' },
        { subject: 'Check it',
          body: '' } ]);
  });

test(
  'execTasks writes the tasks of a plan from the agent, in order',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'board/Plans/P20 Restrict kids internet access.md',
      '# P20 Restrict kids internet access\n\n## Steps\n\n1. Set a schedule.\n2. Check it.\n');

    const io =
      createTestIo(
        dir.resolve('board'),
        { [OVERRIDE]:
            await writeAgent(
              dir,
              { 'Break the plan':
                  '## Set a schedule: tablets\n\nOn the router.\n\n## Check it\n\nAt 21:00.\n{"result":"OK"}\n' }) });

    assert.equal(
      await execTasks(
        io,
        { target: 'P20' }),
      0);

    assert.equal(
      io.out(),
      'Created Tasks/T20-1 Set a schedule tablets.md\nCreated Tasks/T20-2 Check it.md\n');

    assert.equal(
      await dir.readText(
        'board/Tasks/T20-1 Set a schedule tablets.md'),
      '# T20-1 Set a schedule: tablets\n\nOn the router.\n');

    assert.ok(
      (await dir.readText(
        'agent/prompts/1.txt'))
        .includes(
          'Its idea: Ideas/I20 Restrict kids internet access.md'));

    assert.ok(
      (await dir.readText(
        'agent/prompts/1.txt'))
        .includes(
          'Nobody answers while you work: do not ask the user anything.'));
  });

test(
  'execTasks refuses a plan with tasks, anything but a plan, and an answer without tasks',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'board/Plans/P20 Restrict kids internet access.md',
      '# P20 Restrict kids internet access\n');

    const io =
      createTestIo(
        dir.resolve('board'),
        { [OVERRIDE]:
            await writeAgent(
              dir,
              { 'Break the plan':
                  'Nothing to do.\n{"result":"OK"}\n' }) });

    await assert.rejects(
      execTasks(
        io,
        { target: 'P19' }),
      /P19 already has 2 tasks/);

    await assert.rejects(
      execTasks(
        io,
        { target: 'I20' }),
      /I20 is an idea; tasks are made from a plan\./);

    await assert.rejects(
      execTasks(
        io,
        { target: 'P20' }),
      /The agent wrote no task/);
  });
