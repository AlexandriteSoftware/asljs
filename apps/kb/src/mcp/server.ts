import { handleMessage as handleRpcMessage,
         type JsonRpcMessage,
         type JsonRpcResponse,
         type McpTool,
         PROTOCOL_VERSION,
         serveLines }
  from 'asljs-mdcli';
import fs
  from 'node:fs/promises';
import { createServer,
         Server }
  from 'node:net';
import { Readable }
  from 'node:stream';
import { packageVersion }
  from '../commands/version.js';
import { Environment }
  from '../environment.js';
import { endpointIsFile }
  from './endpoint.js';
import { createTools }
  from './tools.js';

export {
  PROTOCOL_VERSION
};

export type {
  JsonRpcMessage,
  JsonRpcResponse
};

export const SERVER_NAME = 'asljs-kb';

/**
 * Handle one JSON-RPC message, as the `kb` server.
 *
 * Returns `null` for notifications, which carry no id and expect no response.
 * Tool failures are reported as a successful response with `isError`, as the
 * Model Context Protocol requires.
 */
export async function handleMessage(
    message: JsonRpcMessage,
    tools: McpTool[]
  ): Promise<JsonRpcResponse | null>
{
  return handleRpcMessage(
    message,
    tools,
    { name: SERVER_NAME,
      version:
        packageVersion() });
}

/**
 * Serve the `kb` tools over a line-delimited JSON-RPC stream. Resolves when
 * the input stream ends.
 */
export async function runMcpServer(
    environment: Environment,
    input: Readable,
    write: (line: string) => void
  ): Promise<void>
{
  const logger =
    environment.loggerProvider.getLogger();

  await serveLines(
    input,
    write,
    createTools(environment),
    { name: SERVER_NAME,
      version:
        packageVersion() },
    { onInvalidLine:
        () =>
        logger.warning(
          'Ignored a line that is not valid JSON.'),
      onRequest:
        method =>
        logger.trace(
          `request ${method}`) });
}

export interface EndpointServer
{
  close: () => Promise<void>;
}

/**
 * Serve the tools on an endpoint, so that a client can find this server
 * instead of starting one of its own.
 *
 * Each connection is an independent JSON-RPC stream over the same library and
 * the same index.
 */
export async function serveEndpoint(
    environment: Environment,
    endpoint: string
  ): Promise<EndpointServer>
{
  await removeStaleEndpoint(endpoint);

  const server =
    createServer(
      (
          socket
        ) =>
      {
      void runMcpServer(
        environment,
        socket,
        line => socket.write(line));
    });

  await new Promise<void>(
    (
        resolve,
        reject
      ) =>
    {
      server.once(
        'error',
        reject);

      server.listen(
        endpoint,
        resolve);
    }
  );

  return { close:
             async (): Promise<void> =>
             {
      await stopListening(server);

      await removeStaleEndpoint(endpoint);
    } };
}

function stopListening(
    server: Server
  ): Promise<void>
{
  return new Promise<void>(
    (
        resolve
      ) =>
    {
      server.close(() => resolve());
    }
  );
}

/**
 * A socket file outlives the process that listened on it, so a previous run
 * leaves one behind that has to be cleared before listening again.
 */
async function removeStaleEndpoint(
    endpoint: string
  ): Promise<void>
{
  if (!endpointIsFile(endpoint)) {
    return;
  }

  await fs.rm(
    endpoint,
    { force: true });
}
