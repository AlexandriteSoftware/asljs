import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { OVERRIDE }
  from './ask.js';
import { execDevelop }
  from './develop.js';
import { writeAgent,
         writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'execDevelop rewrites an idea from the agent, with the guidance and the related documents',
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
              { 'Develop an idea':
                  '# I20 Restrict kids internet access\n\nLimit the hours on the tablets.\n\n## Open questions\n\n- Which hours?\n- Which router?\n{"result":"OK"}\n',
                'Develop a task':
                  '# T19-2 Add a review date\n\nAdd `Reviewed: <date>`.\n{"result":"OK"}\n' }) });

    assert.equal(
      await execDevelop(
        io,
        { target: 'I20',
          guidance:
            'add user specific goals' }),
      0);

    assert.equal(
      io.out(),
      'Developed Ideas/I20 Restrict kids internet access.md - 2 open questions\n');

    assert.equal(
      await dir.readText(
        'board/Ideas/I20 Restrict kids internet access.md'),
      '# I20 Restrict kids internet access\n\nLimit the hours on the tablets.\n\n## Open questions\n\n- Which hours?\n- Which router?\n');

    const prompt =
      await dir.readText(
        'agent/prompts/1.txt');

    for (
      const text of [ 'Develop an idea of a planning board into an idea that can be planned',
                      'The document: Ideas/I20 Restrict kids internet access.md',
                      'The user asks: add user specific goals',
                      '`# I20 Restrict kids internet access`',
                      'fold every answered question into the text',
                      'keep the questions\n  that are still open, and add the questions you cannot settle',
                      'Nobody answers while you work: do not ask the user anything.' ]
    ) {
      assert.ok(
        prompt.includes(text),
        text);
    }

    await execDevelop(
      io,
      { target: 'T19-2' });

    const taskPrompt =
      await dir.readText(
        'agent/prompts/2.txt');

    for (
      const text of [ 'Its idea: Ideas/I19 Track how fresh articles are.md',
                      'Its plan: Plans/P19 Track how fresh articles are.md' ]
    ) {
      assert.ok(
        taskPrompt.includes(text),
        text);
    }

    assert.ok(
      !taskPrompt.includes('The user asks'));
  });

test(
  'execDevelop refuses a result, a document with another heading, and a failed agent',
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
              { I20:
                  '# I21 Something else\n{"result":"OK"}\n',
                P19:
                  '{"result":"Fail","message":"The plan is unclear."}\n' }) });

    await assert.rejects(
      execDevelop(
        io,
        { target: 'R19-1' }),
      /R19-1 is a result; develop its task instead/);

    const before =
      await dir.readText(
        'board/Ideas/I20 Restrict kids internet access.md');

    await assert.rejects(
      execDevelop(
        io,
        { target: 'I20' }),
      /does not start with "# I20"/);

    assert.equal(
      await dir.readText(
        'board/Ideas/I20 Restrict kids internet access.md'),
      before);

    await assert.rejects(
      execDevelop(
        io,
        { target: 'P19' }),
      /The plan is unclear\./);
  });

test(
  'execDevelop rewrites a plan with its idea for context',
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
              { 'Develop a plan':
                  '# P19 Track how fresh articles are\n\n## Goal\n\nEvery article has a review date.\n{"result":"OK"}\n' }) });

    assert.equal(
      await execDevelop(
        io,
        { target:
            'P19 Track how fresh articles are.md' }),
      0);

    assert.equal(
      io.out(),
      'Developed Plans/P19 Track how fresh articles are.md - 0 open questions\n');

    assert.equal(
      await dir.readText(
        'board/Plans/P19 Track how fresh articles are.md'),
      '# P19 Track how fresh articles are\n\n## Goal\n\nEvery article has a review date.\n');

    const prompt =
      await dir.readText(
        'agent/prompts/1.txt');

    assert.ok(
      prompt.includes(
        'Its idea: Ideas/I19 Track how fresh articles are.md'));

    assert.ok(
      !prompt.includes('Its plan:'));
  });
