import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { checkCoverage,
         getAgentCommand }
  from './coverage.js';
import { loadGraph }
  from './graph.js';
import { writeFixture }
  from './testing/fixture.js';

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
          '{"result":"OK","message":""}')),
      { covered: true,
        message: '' });

    assert.deepEqual(
      await checkCoverage(
        graph,
        root,
        await writeAgent(
          dir,
          '{"result":"Fail","message":"Nothing covers speed."}')),
      { covered: false,
        message:
          'Nothing covers speed.' });

    assert.deepEqual(
      await checkCoverage(
        graph,
        root,
        await writeAgent(
          dir,
          'I am not sure.')),
      { covered: false,
        message:
          'AI agent gave no verdict: I am not sure.' });

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
      const text of [ `Requirement: ${dir.resolve('reqs/RQ1 Root.md')}`,
                      `- ${dir.resolve('reqs/RQ2 Part.md')} (requirement)`,
                      `- ${
          dir.resolve(
            'reqs/evidence/EV1 Passes.md')
        } (evidence)` ]
    ) {
      assert.ok(
        prompt.includes(text),
        text);
    }
  });

test(
  'getAgentCommand prefers the override',
  () =>
  {
    assert.equal(
      getAgentCommand(
        'claude',
        undefined),
      'claude -p --allowedTools Read,Grep,Glob');

    assert.equal(
      getAgentCommand(
        'copilot',
        'my-agent'),
      'my-agent');
  });
