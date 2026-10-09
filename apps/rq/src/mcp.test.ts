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
import { createTools,
         main,
         runMcpServer,
         serverInfo }
  from './mcp.js';
import { writeFixture }
  from './testing/fixture.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'createTools makes a tool of every rq command',
  () =>
  {
    const tools =
      createTools(
        createTestIo('/r'));

    assert.deepEqual(
      tools.map(
        tool => tool.name),
      [ 'test',
        'coverage',
        'view',
        'check',
        'list',
        'links',
        'backlinks',
        'tojson',
        'add_requirement',
        'add_test',
        'link',
        'unlink',
        'remove',
        'move',
        'log' ]);

    const testTool = tools[0];

    assert.deepEqual(
      Object.keys(
        testTool.inputSchema.properties as object),
      [ 'targets',
        'recurse',
        'name',
        'ai',
        'workingDir' ]);

    assert.deepEqual(
      testTool.inputSchema.required,
      [ 'targets' ]);
  });

test(
  'rq-mcp runs the commands in their working folder, and reports failures as errors',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const io =
      createTestIo(dir.path);

    const lines: string[] = [ ];

    await runMcpServer(
      io,
      Readable.from(
        [ `${
            JSON.stringify(
              { jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params:
                  { name: 'check',
                    arguments:
                      { path: '.',
                        workingDir: 'reqs' } } })
          }\n`,
          `${
            JSON.stringify(
              { jsonrpc: '2.0',
                id: 2,
                method: 'tools/call',
                params:
                  { name: 'test',
                    arguments:
                      { targets:
                          [ 'T2' ],
                        workingDir: 'reqs' } } })
          }\n`,
          'not json\n' ]),
      line => lines.push(line));

    const [check, run] =
      lines.map(
        line => JSON.parse(line).result);

    assert.deepEqual(
      check,
      { content:
          [ { type: 'text',
              text:
                'OK  2 requirements, 2 tests' } ] });

    assert.equal(
      run.isError,
      true);

    assert.match(
      run.content[0].text,
      /^FAIL {5}tests\/T2 Fails\.md/m);

    assert.match(
      run.content[0].text,
      /\nExit code: 1$/);

    assert.equal(
      io.out(),
      '');

    assert.equal(
      io.err(),
      '');
  });

test(
  'runMcpServer closes the server of a view call once the input ends',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const lines: string[] = [ ];

    await runMcpServer(
      createTestIo(dir.path),
      Readable.from(
        [ `${
          JSON.stringify(
            { jsonrpc: '2.0',
              id: 1,
              method: 'tools/call',
              params:
                { name: 'view',
                  arguments:
                    { path: 'reqs',
                      port: '0' } } })
        }\n` ]),
      line => lines.push(line));

    const url =
      /at (http:\S+)/.exec(
        JSON.parse(lines[0]).result.content[0].text)![1];

    await assert.rejects(
      fetch(url));
  });

test(
  'main refuses a log level that would log to stdout, and logs the requests to a log file',
  async () =>
  {
    await using dir =
      new TmpDir();

    await writeFixture(dir);

    const lines: string[] = [ ];

    await assert.rejects(
      main(
        [ '--loglevel',
          'debug' ],
        createTestIo(dir.path),
        Readable.from([ ]),
        line => lines.push(line)),
      /--logfile stderr/);

    await main(
      [ '--loglevel=trace',
        `--logfile=${dir.resolve('mcp.log')}` ],
      createTestIo(dir.path),
      Readable.from(
        [ `${
            JSON.stringify(
              { jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params:
                  { name: 'check',
                    arguments:
                      { path: 'reqs' } } })
          }\n`,
          'not json\n' ]),
      line => lines.push(line));

    assert.equal(
      lines.length,
      1);

    const entries =
      (await dir.readText('mcp.log'))
      .trim()
      .split('\n')
      .map(
        line => JSON.parse(line) as { context: string; msg: string; });

    assert.deepEqual(
      entries
        .filter(
          entry => entry.context === 'rq.mcp')
        .map(
          entry => entry.msg),
      [ 'request',
        'tool call',
        'ignored a line that is not valid JSON' ]);

    assert.ok(
      entries.some(
        entry =>
          entry.context === 'rq'
          && entry.msg === 'command finished'));
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
      { name: 'asljs-rq',
        version });
  });
