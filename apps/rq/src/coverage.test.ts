import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { checkCoverage,
         execCoverage }
  from './coverage.js';
import { loadGraph }
  from './graph.js';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

/**
 * A fake agent that saves the prompt to `prompt.txt` and prints `answer`.
 */
async function writeAgent(
    dir: TmpDir,
    answer: string,
    code = 0
  ): Promise<string>
{
  await dir.writeText(
    'agent.cjs',
    `let prompt = '';
process.stdin.on('data', chunk => prompt += chunk);
process.stdin.on('end', () => {
  require('node:fs').writeFileSync(${
      JSON.stringify(
        dir.resolve('prompt.txt'))
    }, prompt);
  console.log(${JSON.stringify(answer)});
  process.exitCode = ${code};
});
`);

  return `node "${dir.resolve('agent.cjs')}"`;
}

test(
  'checkCoverage asks the agent about a requirement and its links',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    const root =
      graph.nodes.get(graph.roots[0])!;

    assert.deepEqual(
      await checkCoverage(
        graph,
        root,
        await writeAgent(
          dir,
          'Every statement is covered:\n\n- tools: R2 Part.\n{"result":"OK","message":""}')),
      { covered: true,
        message: '',
        analysis:
          'Every statement is covered:\n\n- tools: R2 Part.' });

    assert.deepEqual(
      await checkCoverage(
        graph,
        root,
        await writeAgent(
          dir,
          '{"result":"Fail","message":"Nothing covers speed."}')),
      { covered: false,
        message:
          'Nothing covers speed.',
        analysis: '' });

    assert.deepEqual(
      await checkCoverage(
        graph,
        root,
        await writeAgent(
          dir,
          'I am not sure.')),
      { covered: false,
        message:
          'AI agent gave no verdict: I am not sure.',
        analysis: 'I am not sure.' });

    assert.match(
      (await checkCoverage(
        graph,
        root,
        await writeAgent(
          dir,
          '',
          4))).message,
      /^AI agent exited with code 4/);
  });

test(
  'checkCoverage prompt names the requirement and its links',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const graph =
      await loadGraph(
        dir.resolve('reqs'));

    await checkCoverage(
      graph,
      graph.nodes.get(graph.roots[0])!,
      await writeAgent(
        dir,
        '{"result":"OK"}'));

    const prompt =
      await dir.readText('prompt.txt');

    for (
      const text of [ `Requirement: ${dir.resolve('reqs/R1 Root.md')}`,
                      `- ${dir.resolve('reqs/R2 Part.md')} (requirement)`,
                      `- ${
          dir.resolve(
            'reqs/tests/T1 Passes.md')
        } (test)`,
                      'First write your analysis',
                      'without headings or links - name requirements and tests by their id',
                      'for each statement, the requirement or test',
                      'each statement nothing covers, and what to do to cover',
                      'a test to add and what it should check, a sub-requirement to add',
                      'Then end with the verdict.' ]
    ) {
      assert.ok(
        prompt.includes(text),
        text);
    }
  });

test(
  'execCoverage records the verdict of each selected requirement in its Status',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/R3 Lone.md',
      '# R3 Lone\n\nAlone.\n');

    const command =
      await writeAgent(
        dir,
        '{"result":"OK"}');

    await dir.writeText(
      'partial.cjs',
      `let prompt = '';
process.stdin.on('data', chunk => prompt += chunk);
process.stdin.on('end', () => {
  console.log(prompt.includes('R2 Part.md (requirement)')
    ? '{"result":"Fail","message":"Nothing covers speed."}'
    : '{"result":"OK"}');
});
`);

    const io =
      createTestIo(
        dir.path,
        { RQ_AI_COMMAND: command });

    assert.equal(
      await execCoverage(
        io,
        { targets:
            [ 'R1',
              'R2',
              'T1' ] }),
      0);

    assert.equal(
      io.out(),
      'COMPLETE    reqs/R1 Root.md\nCOMPLETE    reqs/R2 Part.md\n');

    await assert.rejects(
      dir.stat('.rq/E2 R1.md'));

    assert.ok(
      !(await dir.readText('reqs/R1 Root.md')).includes('- Result:'));

    assert.ok(
      (await dir.readText('reqs/R1 Root.md'))
        .endsWith(
          '\n\n## Status\n\n- Coverage: COMPLETE\n'));

    const recurse =
      createTestIo(
        dir.path,
        { RQ_AI_COMMAND:
            `node "${dir.resolve('partial.cjs')}"` });

    assert.equal(
      await execCoverage(
        recurse,
        { targets:
            [ 'R1' ],
          recurse: true }),
      1);

    assert.equal(
      recurse.out(),
      'INCOMPLETE  reqs/R1 Root.md - Nothing covers speed.\nCOMPLETE    reqs/R2 Part.md\n');

    assert.ok(
      (await dir.readText('reqs/R1 Root.md'))
        .endsWith(
          '\n\n## Status\n\n- Coverage: INCOMPLETE - Nothing covers speed.\n'));

    const lone =
      createTestIo(
        dir.path,
        { RQ_AI_COMMAND: command });

    assert.equal(
      await execCoverage(
        lone,
        { targets:
            [ 'R3' ] }),
      1);

    assert.equal(
      lone.out(),
      'INCOMPLETE  reqs/R3 Lone.md - links to no requirement or test\n');

    await assert.rejects(
      execCoverage(
        createTestIo(dir.path),
        { targets:
            [ 'R1' ] }),
      /No AI agent found/);
  });

test(
  'execCoverage writes the analysis to the Coverage section, before the Status',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    await dir.writeText(
      'reqs/R3 Lone.md',
      '# R3 Lone\n\nAlone.\n');

    await dir.writeText(
      'analyst.cjs',
      `process.stdin.resume();
process.stdin.on('end', () => {
  console.log('Nothing checks speed.\\n\\n# Add\\n\\n- a test that times the export.');
  console.log('{"result":"Fail","message":"Nothing covers speed."}');
});
`);

    const io =
      createTestIo(
        dir.path,
        { RQ_AI_COMMAND:
            `node "${dir.resolve('analyst.cjs')}"` });

    await execCoverage(
      io,
      { targets:
          [ 'R2',
            'R3' ] });

    assert.ok(
      (await dir.readText('reqs/R2 Part.md'))
        .endsWith(
          '\n\n## Coverage\n\nNothing checks speed.\n\n\\# Add\n\n- a test that times the export.\n\n## Status\n\n- Coverage: INCOMPLETE - Nothing covers speed.\n'));

    assert.match(
      await dir.readText('reqs/R3 Lone.md'),
      /\n## Coverage\n\nThe requirement links to no requirement or test, so nothing covers its statements\. .*\n\n## Status\n\n- Coverage: INCOMPLETE - links to no requirement or test\n$/);

    await execCoverage(
      io,
      { targets:
          [ 'R2' ] });

    assert.equal(
      (await dir.readText('reqs/R2 Part.md'))
        .split('## Coverage').length,
      2);
  });
