import { createLoggerProvider,
         readLoggerOptions }
  from 'asljs-logging';
import { commandTools,
         type McpServerInfo,
         type McpTool,
         serveLines }
  from 'asljs-mdcli';
import { Server }
  from 'node:http';
import { createRequire }
  from 'node:module';
import { Readable }
  from 'node:stream';
import { createCli,
         runCli }
  from './cli.js';
import { getLogger,
         Io }
  from './io.js';

export const SERVER_NAME = 'asljs-rq';

/**
 * The tools of the MCP server: a tool per `rq` command, run as that command
 * line in `io.cwd`, or in its `workingDir`, with its output as the result.
 */
export function createTools(
    io: Io,
    servers: Server[] = [ ]
  ): McpTool[]
{
  return commandTools(
    createCli(
      [ ],
      io).cli,
    async (
        args
      ) =>
    {
      let stdout = '';

      let stderr = '';

      const exitCode =
        await runCli(
          args,
          { ...io,
            stdout:
              { write:
                  (
                      text
                    ) =>
                  {
              stdout += text;
            } },
            stderr:
              { write:
                  (
                      text
                    ) =>
                  {
              stderr += text;
            } } },
          servers);

      return { exitCode,
               stdout,
               stderr };
    });
}

/**
 * Serves the `rq` commands as MCP tools over a line-delimited JSON-RPC
 * stream, e.g. standard input and output. Resolves when the input ends,
 * and closes the servers `view` started.
 */
export async function runMcpServer(
    io: Io,
    input: Readable,
    write: (line: string) => void
  ): Promise<void>
{
  const servers: Server[] = [ ];

  try {
    await serveLines(
      input,
      write,
      createTools(
        io,
        servers),
      serverInfo(),
      { logger:
          getLogger(
            io,
            'rq.mcp') });
  } finally {
    for (const server of servers) {
      await new Promise(
        (
            resolve
          ) =>
        {
          server.close(resolve);
          server.closeAllConnections();
        });
    }
  }
}

/**
 * The `rq-mcp` executable: serves the tools with a logger provider made
 * from `--loglevel`, `--logfile`, `--logformat` and the `RQ_LOG_`
 * variables, and disposes it once the input ends. Standard output carries the
 * protocol, so a log level without a log file other than stdout throws here,
 * before the first request is read.
 */
export async function main(
    args: string[],
    io: Io,
    input: Readable,
    write: (line: string) => void
  ): Promise<void>
{
  const loggerProvider =
    createLoggerProvider(
      'RQ_LOG_',
      readLoggerOptions(args),
      { allowStdout: false });

  try {
    await runMcpServer(
      { ...io,
        loggerProvider },
      input,
      write);
  } finally {
    await loggerProvider.dispose();
  }
}

/**
 * The name and the version of the installed package.
 */
export function serverInfo(
  ): McpServerInfo
{
  const { version } =
    createRequire(
      import.meta.url)(
        '../package.json') as { version: string; };

  return { name: SERVER_NAME,
           version };
}
