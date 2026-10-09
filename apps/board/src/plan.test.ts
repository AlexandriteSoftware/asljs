import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { OVERRIDE }
  from './ask.js';
import { execPlan }
  from './plan.js';
import { writeAgent,
         writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'execPlan writes the plan of an idea from the agent',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(
        dir.resolve('board'),
        { [OVERRIDE]:
            await writeAgent(
              dir,
              { 'Write the plan':
                  '```markdown\n# P20 Restrict kids internet access\n\n## Goal\n\nThe tablets are offline at night.\n\n## Steps\n\n1. Set a schedule.\n\n## Open questions\n\n- Which router?\n```\n{"result":"OK"}\n' }) });

    assert.equal(
      await execPlan(
        io,
        { target: 'I20',
          guidance: 'keep it simple' }),
      0);

    assert.equal(
      io.out(),
      'Created Plans/P20 Restrict kids internet access.md - 1 open questions\nNote: I20 still has 1 open questions.\n');

    assert.equal(
      await dir.readText(
        'board/Plans/P20 Restrict kids internet access.md'),
      '# P20 Restrict kids internet access\n\n## Goal\n\nThe tablets are offline at night.\n\n## Steps\n\n1. Set a schedule.\n\n## Open questions\n\n- Which router?\n');

    const prompt =
      await dir.readText(
        'agent/prompts/1.txt');

    for (
      const text of [ 'The idea: Ideas/I20 Restrict kids internet access.md',
                      'The user asks: keep it simple',
                      '`# P20 Restrict kids internet access`',
                      '`## Goal` - what is true when the plan is done',
                      '`## Approach` - how it gets there, and why this way',
                      '`## Steps` - a numbered list of concrete actions',
                      '`## Open questions` - what the idea leaves open and the plan needs',
                      'Nobody answers while you work: do not ask the user anything.' ]
    ) {
      assert.ok(
        prompt.includes(text),
        text);
    }
  });

test(
  'execPlan refuses an idea with a plan, and anything but an idea',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(
        dir.resolve('board'),
        { [OVERRIDE]: 'unused' });

    await assert.rejects(
      execPlan(
        io,
        { target: 'I19' }),
      /I19 already has a plan, Plans\/P19 Track how fresh articles are\.md; develop it with board develop P19\./);

    await assert.rejects(
      execPlan(
        io,
        { target: 'T19-1' }),
      /T19-1 is a task; a plan is made from an idea\./);
  });
