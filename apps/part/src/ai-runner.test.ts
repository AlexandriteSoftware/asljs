import { createTestLoggerProvider }
  from 'asljs-testing';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { AiRunner }
  from './ai-runner.js';
import { ArtefactDefinition }
  from './model/artefact-definition.js';
import { tmpDirFactory }
  from './testing/tmpDir.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

const DEFINITION: ArtefactDefinition =
  { name: 'Article',
    description:
      'A markdown article.',
    source: 'markdown',
    locations: [ ],
    properties: [ ],
    rules:
      [ { id: 'RL1',
          name: 'Article_RL1',
          definition: 'Article',
          heading: 'RL1',
          content:
            'The article has a summary.' } ] };

/**
 * Writes a stub agent that saves its prompt and prints `output`, and returns
 * the command that runs it.
 */
async function writeAgent(
    workspace: {
    writeText(path: string, content: string): Promise<unknown>;
    resolve(path: string): string;
  },
    output: string,
    exitCode: number = 0
  ): Promise<string>
{
  await workspace.writeText(
    'agent.mjs',
    `import { writeFileSync } from 'node:fs';

let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) input += chunk;
writeFileSync('prompt.txt', input);
process.stdout.write(${JSON.stringify(output)});
process.stderr.write('agent stderr');
process.exitCode = ${exitCode};
`);

  return `node "${workspace.resolve('agent.mjs')}"`;
}

test(
  'RQ137: AiRunner sends the rule and the artefact and reads the JSON verdict',
  async () =>
  {
    await using workspace =
      tmpDir();

    const command =
      await writeAgent(
        workspace,
        'Thinking...\n{"result":"OK","message":""}\n');

    const runner =
      new AiRunner(
        loggerProvider.getLogger('AiRunner'),
        'claude',
        workspace.path,
        command);

    assert.deepEqual(
      await runner.check(
        DEFINITION,
        DEFINITION.rules[0],
        { location: 'file:docs/A.md',
          name: 'A',
          definitions:
            [ 'Article' ] }),
      { result: 'Ok',
        message: '' });

    const prompt =
      await workspace.readText(
        'prompt.txt');

    assert.match(
      prompt,
      /Do not modify any file\./);

    assert.match(
      prompt,
      /Artefact definition: Article/);

    assert.match(
      prompt,
      /The article has a summary\./);

    assert.ok(
      prompt.includes(
        `Artefact path: ${workspace.resolve('docs/A.md')}`));
  });

test(
  'RQ137: AiRunner turns a Fail verdict, no verdict and a failed run into failures',
  async () =>
  {
    await using workspace =
      tmpDir();

    const artefact =
      { location: 'git:tag/v1',
        name: 'v1',
        definitions:
          [ 'Article' ] };

    const check =
      async (
      command: string
    ): Promise<unknown> =>
      new AiRunner(
        loggerProvider.getLogger('AiRunner'),
        'copilot',
        workspace.path,
        command)
        .check(
          DEFINITION,
          DEFINITION.rules[0],
          artefact);

    assert.deepEqual(
      await check(
        await writeAgent(
          workspace,
          '{"result":"Fail","message":"No summary."}')),
      { result: 'Fail',
        message: 'No summary.' });

    assert.deepEqual(
      await check(
        await writeAgent(
          workspace,
          'I cannot decide.')),
      { result: 'Fail',
        message:
          'AI agent gave no verdict: I cannot decide.' });

    assert.deepEqual(
      await check(
        await writeAgent(
          workspace,
          '',
          3)),
      { result: 'Fail',
        message:
          'AI agent exited with code 3: agent stderr' });
  });

test(
  'RQ137: AiRunner uses the agent command unless one is given',
  () =>
  {
    const logger =
      loggerProvider.getLogger('AiRunner');

    assert.equal(
      new AiRunner(
        logger,
        'claude',
        '.').command,
      'claude -p --allowedTools Read,Grep,Glob');

    assert.match(
      new AiRunner(
        logger,
        'copilot',
        '.').command,
      /^copilot -s .*--deny-tool=write --deny-tool=shell$/);

    assert.equal(
      new AiRunner(
        logger,
        'claude',
        '.',
        'my-agent').command,
      'my-agent');
  });
