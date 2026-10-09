import { commandTools,
         type McpServerInfo,
         type McpTool,
         serveLines }
  from 'asljs-mdcli';
import { createRequire }
  from 'node:module';
import { Readable }
  from 'node:stream';
import { createCli,
         runCli }
  from './cli.js';
import { Io }
  from './io.js';

export const SERVER_NAME = 'asljs-rq';

/**
 * The tools of the MCP server: a tool per `rq` command, run as that command
 * line in `io.cwd`, or in its `workingDir`, with its output as the result.
 */
export function createTools(
    io: Io
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
            } } });

      return { exitCode,
               stdout,
               stderr };
    });
}

/**
 * Serves the `rq` commands as MCP tools over a line-delimited JSON-RPC
 * stream, e.g. standard input and output. Resolves when the input ends.
 */
export async function runMcpServer(
    io: Io,
    input: Readable,
    write: (line: string) => void
  ): Promise<void>
{
  await serveLines(
    input,
    write,
    createTools(io),
    serverInfo(),
    { onInvalidLine:
        () =>
        io.stderr.write(
          'Ignored a line that is not valid JSON.\n') });
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
