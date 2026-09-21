import assert
  from 'node:assert/strict';
import { Readable }
  from 'node:stream';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { handleMessage,
         PROTOCOL_VERSION,
         runMcpServer,
         SERVER_NAME }
  from './server.js';
import { createTools }
  from './tools.js';

test(
  'initialize reports the protocol version and the server name',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const response =
          await handleMessage(
            { jsonrpc: '2.0',
              id: 1,
              method: 'initialize' },
            createTools(
              createTestEnvironment(library)));

        const result =
          response?.result as Record<string, any>;

        assert.equal(
          result.protocolVersion,
          PROTOCOL_VERSION);

        assert.equal(
          result.serverInfo.name,
          SERVER_NAME);
      });
  });

test(
  'tools/list returns the tool definitions',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const response =
          await handleMessage(
            { jsonrpc: '2.0',
              id: 2,
              method: 'tools/list' },
            createTools(
              createTestEnvironment(library)));

        const result =
          response?.result as { tools: { name: string; }[]; };

        assert.equal(
          result.tools.length,
          12);

        assert.equal(
          result.tools[0]?.name,
          'kb_list');
      });
  });

test(
  'tools/call returns the result as json text',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n' },
      async (
          library
        ) =>
      {
        const response =
          await handleMessage(
            { jsonrpc: '2.0',
              id: 3,
              method: 'tools/call',
              params:
                { name: 'kb_read',
                  arguments:
                    { path: 'one.md' } } },
            createTools(
              createTestEnvironment(library)));

        const result =
          response?.result as
            { content: { text: string; }[]; isError?: boolean; };

        assert.equal(
          result.isError,
          undefined);

        assert.equal(
          JSON.parse(
            result.content[0]?.text ?? '{}').text,
          '# One\n');
      });
  });

test(
  'tools/call reports a failure as an error result',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const tools =
          createTools(
            createTestEnvironment(library));

        const missing =
          await handleMessage(
            { jsonrpc: '2.0',
              id: 4,
              method: 'tools/call',
              params:
                { name: 'kb_unknown' } },
            tools);

        assert.equal(
          (missing?.result as { isError: boolean; }).isError,
          true);

        const failing =
          await handleMessage(
            { jsonrpc: '2.0',
              id: 5,
              method: 'tools/call',
              params:
                { name: 'kb_read',
                  arguments:
                    { path: 'missing.md' } } },
            tools);

        assert.match(
          (failing?.result as { content: { text: string; }[]; })
            .content[0]?.text ?? '',
          /does not exist/);
      });
  });

test(
  'unknown methods produce a json-rpc error and notifications are ignored',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const tools =
          createTools(
            createTestEnvironment(library));

        const response =
          await handleMessage(
            { jsonrpc: '2.0',
              id: 6,
              method: 'resources/list' },
            tools);

        assert.equal(
          response?.error?.code,
          -32601);

        assert.equal(
          await handleMessage(
            { jsonrpc: '2.0',
              method:
                'notifications/initialized' },
            tools),
          null);
      });
  });

test(
  'runMcpServer answers line-delimited requests and ignores invalid json',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n' },
      async (
          library
        ) =>
      {
        const lines: string[] = [ ];

        const input =
          Readable.from(
            [ '{"jsonrpc":"2.0","id":1,"method":"tools/list"}\n',
              'not json\n',
              '{"jsonrpc":"2.0","id":2,"method":"initialize"}\n' ]);

        await runMcpServer(
          createTestEnvironment(library),
          input,
          line => lines.push(line));

        assert.equal(
          lines.length,
          2);

        assert.equal(
          JSON.parse(lines[1] ?? '{}').id,
          2);
      });
  });
