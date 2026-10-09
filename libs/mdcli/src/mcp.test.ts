import { Command }
  from 'commander';
import assert
  from 'node:assert/strict';
import { Readable }
  from 'node:stream';
import test
  from 'node:test';
import { commandTools,
         handleMessage,
         type McpTool,
         PROTOCOL_VERSION,
         serveLines,
         textResult }
  from './mcp.js';

const INFO =
  { name: 'asljs-sample',
    version: '1.2.3' };

const TOOLS: McpTool[] =
  [ { name: 'echo',
      description:
        'Echoes its arguments.',
      inputSchema:
        { type: 'object',
          properties: {} },
      invoke: async args => args },
    { name: 'quiet',
      description: 'Answers nothing.',
      inputSchema:
        { type: 'object',
          properties: {} },
      invoke:
        async () => undefined },
    { name: 'say',
      description: 'Answers text.',
      inputSchema:
        { type: 'object',
          properties: {} },
      invoke:
        async () =>
    textResult(
      'Hello.\n',
      true) },
    { name: 'fail',
      description: 'Throws.',
      inputSchema:
        { type: 'object',
          properties: {} },
      invoke:
        async () =>
        {
    throw new Error('It failed.');
  } } ];

async function call(
    tools: McpTool[],
    name: string,
    args?: unknown
  ): Promise<{ content: { text: string; }[]; isError?: boolean; }>
{
  const response =
    await handleMessage(
      { jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params:
          { name,
            arguments: args } },
      tools,
      INFO);

  return response?.result as {
    content: { text: string; }[];
    isError?: boolean;
  };
}

test(
  'handleMessage answers initialize, tools/list, unknown methods and notifications',
  async () =>
  {
    const initialize =
      await handleMessage(
        { jsonrpc: '2.0',
          id: 1,
          method: 'initialize' },
        TOOLS,
        INFO);

    assert.deepEqual(
      initialize?.result,
      { protocolVersion: PROTOCOL_VERSION,
        capabilities:
          { tools: {} },
        serverInfo: INFO });

    const list =
      await handleMessage(
        { jsonrpc: '2.0',
          id: 2,
          method: 'tools/list' },
        TOOLS,
        INFO);

    assert.deepEqual(
      (list?.result as { tools: { name: string; }[]; }).tools.map(
        tool => tool.name),
      [ 'echo',
        'quiet',
        'say',
        'fail' ]);

    assert.equal(
      (await handleMessage(
        { jsonrpc: '2.0',
          id: 3,
          method: 'resources/list' },
        TOOLS,
        INFO))?.error?.code,
      -32601);

    assert.equal(
      await handleMessage(
        { jsonrpc: '2.0',
          method:
            'notifications/initialized' },
        TOOLS,
        INFO),
      null);
  });

test(
  'tools/call sends a result as JSON, text as it is, and a failure as an error result',
  async () =>
  {
    assert.deepEqual(
      JSON.parse(
        (await call(
          TOOLS,
          'echo',
          { a: 1 })).content[0].text),
      { a: 1 });

    assert.equal(
      (await call(
        TOOLS,
        'quiet')).content[0].text,
      'quiet completed');

    assert.deepEqual(
      await call(
        TOOLS,
        'say'),
      { content:
          [ { type: 'text',
              text: 'Hello.\n' } ],
        isError: true });

    assert.deepEqual(
      await call(
        TOOLS,
        'fail'),
      { content:
          [ { type: 'text',
              text: 'It failed.' } ],
        isError: true });

    assert.equal(
      (await call(
        TOOLS,
        'missing')).content[0].text,
      'Tool is not registered: missing');

    assert.equal(
      (await call(
        TOOLS,
        'echo',
        [ 1 ])).content[0].text,
      'tools/call arguments must be an object');
  });

test(
  'serveLines answers line-delimited requests and reports invalid lines',
  async () =>
  {
    const lines: string[] = [ ];

    const invalid: string[] = [ ];

    await serveLines(
      Readable.from(
        [ '{"jsonrpc":"2.0","id":1,"method":"tools/list"}\nnot json\n\n',
          '{"jsonrpc":"2.0","id":2,',
          '"method":"initialize"}\n' ]),
      line => lines.push(line),
      TOOLS,
      INFO,
      { onInvalidLine:
          line => invalid.push(line) });

    assert.deepEqual(
      lines.map(
        line => JSON.parse(line).id),
      [ 1,
        2 ]);

    assert.deepEqual(
      invalid,
      [ 'not json' ]);
  });

function sampleProgram(
  ): Command
{
  const program =
    new Command('sample');

  program.command('test')
    .description('Run tests')
    .argument(
      '<targets...>',
      'The targets')
    .option(
      '--recurse',
      'Recurse')
    .option(
      '--name <slug>',
      'The slug')
    .option(
      '--ai [agent]',
      'The agent');

  const add =
    program.command('add');

  add.command('test')
    .description('Add a test')
    .argument(
      '<file>',
      'The file')
    .argument(
      '[title]',
      'The title');

  program.command('view')
    .description('Serve');

  return program;
}

test(
  'commandTools makes a tool per command, with its arguments and options',
  () =>
  {
    const tools =
      commandTools(
        sampleProgram(),
        async () => ({ exitCode: 0,
                       stdout: '',
                       stderr: '' }),
        { skip:
            [ 'view' ] });

    assert.deepEqual(
      tools.map(
        tool => [ tool.name,
                  tool.description,
                  tool.inputSchema ]),
      [ [ 'test',
          'Run tests (`test`)',
          { type: 'object',
            properties:
              { targets:
                  { type: 'array',
                    items:
                      { type: 'string' },
                    description: 'The targets' },
                recurse:
                  { type: 'boolean',
                    description: 'Recurse' },
                name:
                  { type: 'string',
                    description: 'The slug' },
                ai:
                  { type: 'string',
                    description:
                      'The agent. An empty string gives the option without a value' } },
            required:
              [ 'targets' ] } ],
        [ 'add_test',
          'Add a test (`add test`)',
          { type: 'object',
            properties:
              { file:
                  { type: 'string',
                    description: 'The file' },
                title:
                  { type: 'string',
                    description: 'The title' } },
            required:
              [ 'file' ] } ] ]);
  });

test(
  'commandTools runs the command line of a call, one at a time, and answers its output',
  async () =>
  {
    const runs: string[][] = [ ];

    let running = 0;

    const tools =
      commandTools(
        sampleProgram(),
        async (
            args
          ) =>
        {
        running++;

        assert.equal(
          running,
          1);

        runs.push(args);

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              10));

        running--;

        return args[0] === 'add'
          ? { exitCode: 2,
              stdout: '',
              stderr:
                'Error  no such file\n' }
          : { exitCode: 0,
              stdout: 'PASS  R1\n',
              stderr: '' };
      });

    const [testTool, addTool] = tools;

    const [passed, failed] =
      await Promise.all(
        [ testTool.invoke(
          { targets:
              [ 'R1',
                '-odd' ],
            recurse: true,
            name: 'my run',
            ai: '' }),
          addTool.invoke(
            { file: 'T1.md' }) ]);

    assert.deepEqual(
      runs,
      [ [ 'test',
          '--recurse',
          '--name=my run',
          '--ai',
          '--',
          'R1',
          '-odd' ],
        [ 'add',
          'test',
          '--',
          'T1.md' ] ]);

    assert.deepEqual(
      [ passed,
        failed ],
      [ textResult('PASS  R1'),
        textResult(
          'Error  no such file\nExit code: 2',
          true) ]);

    await assert.rejects(
      testTool.invoke(
        { targets: [ ] }),
      /Missing argument: targets/);

    await assert.rejects(
      addTool.invoke(
        { file: 'T1.md',
          force: true }),
      /Unknown argument: force/);
  });
