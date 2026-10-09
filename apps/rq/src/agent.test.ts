import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { askAgent,
         detectAgent,
         getAgentCommand,
         parseAgentSpec }
  from './agent.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'parseAgentSpec reads an optional agent and model',
  () =>
  {
    assert.deepEqual(
      parseAgentSpec(true),
      {});

    assert.deepEqual(
      parseAgentSpec('claude:fable'),
      { agent: 'claude',
        model: 'fable' });

    assert.deepEqual(
      parseAgentSpec('copilot'),
      { agent: 'copilot' });

    assert.deepEqual(
      parseAgentSpec(':gpt-5:mini'),
      { model: 'gpt-5:mini' });

    assert.throws(
      () => parseAgentSpec('gpt'),
      /Unknown AI agent: gpt\. Use claude or copilot\./);
  });

test(
  'getAgentCommand prefers the override, then the named agent, then the detected one',
  async () =>
  {
    const io =
      createTestIo('/work');

    assert.equal(
      await getAgentCommand(
        io,
        {},
        'read'),
      null);

    assert.equal(
      await getAgentCommand(
        io,
        { agent: 'claude',
          model: 'fable' },
        'read'),
      'claude -p --allowedTools Read,Grep,Glob --model fable');

    assert.equal(
      await getAgentCommand(
        { ...io,
          detectAgent:
            async () => 'copilot' },
        { model: 'gpt 5' },
        'run'),
      'copilot -s --no-ask-user --allow-all-tools --deny-tool=write --model "gpt 5"');

    assert.equal(
      await getAgentCommand(
        createTestIo(
          '/work',
          { RQ_AI_COMMAND: 'my-agent' }),
        { agent: 'claude' },
        'run'),
      'my-agent');
  });

test(
  'askAgent reads the verdict from the last JSON line',
  async () =>
  {
    await using dir =
      new TmpDir();

    const agent =
      async (
          script: string
        ): Promise<string> =>
      {
      await dir.writeText(
        'agent.cjs',
        script);

      return `node "${dir.resolve('agent.cjs')}"`;
    };

    assert.deepEqual(
      await askAgent(
        await agent(
          "process.stdin.on('data', d => console.log(String(d).trim())); process.stdin.on('end', () => console.log('{\"result\":\"OK\"}'));"),
        dir.path,
        'hello'),
      { ok: true,
        message: '',
        output:
          'hello\n{"result":"OK"}\n',
        answer: 'hello' });

    assert.deepEqual(
      await askAgent(
        await agent(
          'console.log(\'{"result":"Fail","message":"No PDF."}\')'),
        dir.path,
        ''),
      { ok: false,
        message: 'No PDF.',
        output:
          '{"result":"Fail","message":"No PDF."}\n',
        answer: '' });

    assert.equal(
      (await askAgent(
        await agent(
          "console.log('unsure')"),
        dir.path,
        '')).message,
      'AI agent gave no verdict: unsure');

    assert.match(
      (await askAgent(
        await agent(
          'process.exitCode = 4'),
        dir.path,
        '')).message,
      /^AI agent exited with code 4/);
  });

test(
  'detectAgent picks the first agent whose command runs, claude before copilot',
  async () =>
  {
    const runs: string[] = [ ];

    const fake =
      (
      installed: string[]
    ) =>
    async (
        command: string
      ) =>
    {
      runs.push(command);

      if (
        installed.some(
          agent => command.startsWith(agent))
      ) {
        return { code: 0,
                 stdout: '1.0',
                 stderr: '' };
      }

      throw new Error('not found');
    };

    assert.equal(
      await detectAgent(
        fake(
          [ 'claude',
            'copilot' ])),
      'claude');

    assert.equal(
      await detectAgent(
        fake(
          [ 'copilot' ])),
      'copilot');

    assert.equal(
      await detectAgent(
        fake([ ])),
      null);

    assert.deepEqual(
      runs,
      [ 'claude --version',
        'claude --version',
        'copilot --version',
        'claude --version',
        'copilot --version' ]);
  });

test(
  'getAgentCommand lets an agent read and run commands, but not edit files, in run mode',
  async () =>
  {
    const io =
      createTestIo('/work');

    assert.equal(
      await getAgentCommand(
        io,
        { agent: 'claude' },
        'run'),
      'claude -p --allowedTools Read,Grep,Glob,Bash --disallowedTools Edit,Write,NotebookEdit');

    assert.equal(
      await getAgentCommand(
        io,
        { agent: 'copilot' },
        'read'),
      'copilot -s --no-ask-user --allow-all-tools --deny-tool=write --deny-tool=shell');
  });
