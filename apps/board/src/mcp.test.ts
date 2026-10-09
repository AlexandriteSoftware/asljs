import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import { readFile }
  from 'node:fs/promises';
import { Readable }
  from 'node:stream';
import test
  from 'node:test';
import { OVERRIDE }
  from './ask.js';
import { createTools,
         runMcpServer,
         serverInfo }
  from './mcp.js';
import { writeAgent,
         writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'createTools makes a tool of every board command',
  () =>
  {
    const tools =
      createTools(
        createTestIo('/b'));

    assert.deepEqual(
      tools.map(
        tool => tool.name),
      [ 'develop',
        'plan',
        'tasks',
        'exec',
        'archive',
        'list',
        'view' ]);

    assert.deepEqual(
      tools[0].inputSchema,
      { type: 'object',
        properties:
          { item:
              { type: 'string',
                description:
                  (tools[0].inputSchema.properties as Record<
              string,
              { description: string; }
            >).item.description },
            guidance:
              { type: 'string',
                description:
                  (tools[0].inputSchema.properties as Record<
              string,
              { description: string; }
            >).guidance.description },
            ai:
              { type: 'string',
                description:
                  (tools[0].inputSchema.properties as Record<
              string,
              { description: string; }
            >).ai.description },
            workingDir:
              { type: 'string',
                description:
                  (tools[0].inputSchema.properties as Record<
              string,
              { description: string; }
            >).workingDir.description } },
        required:
          [ 'item' ] });
  });

test(
  'board-mcp runs the commands with the agent in their working folder, and reports failures as errors',
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
              { 'Write the plan':
                  '# P20 Restrict kids internet access\n\n## Goal\n\nOffline at night.\n{"result":"OK"}\n' }) });

    const lines: string[] = [ ];

    const request =
      (
      id: number,
      name: string,
      args: Record<string, unknown>
    ): string =>
      `${
        JSON.stringify(
          { jsonrpc: '2.0',
            id,
            method: 'tools/call',
            params:
              { name,
                arguments: args } })
      }\n`;

    await runMcpServer(
      io,
      Readable.from(
        [ request(
          1,
          'plan',
          { idea: 'I20',
            guidance: 'keep it simple',
            workingDir: 'board' }),
          request(
            2,
            'archive',
            { idea: 'I99',
              workingDir: 'board' }) ]),
      line => lines.push(line));

    const [plan, archive] =
      lines.map(
        line => JSON.parse(line).result);

    assert.deepEqual(
      plan,
      { content:
          [ { type: 'text',
              text:
                'Created Plans/P20 Restrict kids internet access.md - 0 open questions\nNote: I20 still has 1 open questions.' } ] });

    assert.ok(
      (await dir.readText(
        'agent/prompts/1.txt'))
        .includes(
          'The user asks: keep it simple'));

    assert.deepEqual(
      archive,
      { content:
          [ { type: 'text',
              text:
                'I99: no idea, plan, task or result of the board has this id.\nExit code: 1' } ],
        isError: true });

    assert.equal(
      io.out(),
      '');
  });

test(
  'serverInfo names the server and the package version',
  async () =>
  {
    const { version } =
      JSON.parse(
        await readFile(
          new URL(
            '../package.json',
            import.meta.url),
          'utf8')) as { version: string; };

    assert.deepEqual(
      serverInfo(),
      { name: 'asljs-board',
        version });
  });
