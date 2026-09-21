import fs
  from 'node:fs/promises';
import { messageOf }
  from '../formatting.js';
import { createServer,
         Server }
  from 'node:net';
import { Readable }
  from 'node:stream';
import { Logger }
  from 'asljs-logging';
import { Environment }
  from '../environment.js';
import { packageVersion }
  from '../commands/version.js';
import { endpointIsFile }
  from './endpoint.js';
import { readLines }
  from './lines.js';
import { createTools,
         McpTool }
  from './tools.js';

export const PROTOCOL_VERSION = '2024-11-05';

export const SERVER_NAME = 'asljs-kb';

export interface JsonRpcMessage
{
  jsonrpc?: string;
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse
{
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string; };
}

const METHOD_NOT_FOUND = -32601;

/**
 * Handle one JSON-RPC message.
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
  if (message.id === undefined) {
    return null;
  }

  if (message.method === 'initialize') {
    return { jsonrpc: '2.0',
             id: message.id,
             result:
               { protocolVersion: PROTOCOL_VERSION,
                 capabilities:
                   { tools: {} },
                 serverInfo:
                   { name: SERVER_NAME,
                     version:
                       packageVersion() } } };
  }

  if (message.method === 'tools/list') {
    return { jsonrpc: '2.0',
             id: message.id,
             result:
               { tools:
                   tools.map(
                     tool => ({ name: tool.name,
                                description: tool.description,
                                inputSchema: tool.inputSchema })) } };
  }

  if (message.method === 'tools/call') {
    return { jsonrpc: '2.0',
             id: message.id,
             result:
               await callTool(
                 message.params ?? {},
                 tools) };
  }

  return { jsonrpc: '2.0',
           id: message.id,
           error:
             { code: METHOD_NOT_FOUND,
               message:
                 `Method not found: ${message.method ?? ''}` } };
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
  const tools =
    createTools(environment);

  const logger =
    environment.loggerProvider.getLogger();

  const pending: Promise<void>[] = [ ];

  readLines(
    input,
    (
        line
      ) =>
    {
      if (line.trim() === '') {
        return;
      }

      pending.push(
        respond(
          line,
          tools,
          write,
          logger));
    });

  await new Promise<void>(
    resolve =>
      input.on(
        'end',
        resolve));

  await Promise.all(pending);
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
    });

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
    });
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

async function respond(
    line: string,
    tools: McpTool[],
    write: (line: string) => void,
    logger: Logger
  ): Promise<void>
{
  let message: JsonRpcMessage;

  try {
    message =
      JSON.parse(line) as JsonRpcMessage;
  } catch {
    logger.warning(
      'Ignored a line that is not valid JSON.');

    return;
  }

  logger.trace(
    `request ${message.method ?? ''}`);

  const response =
    await handleMessage(
      message,
      tools);

  if (!response) {
    return;
  }

  write(
    `${JSON.stringify(response)}\n`);
}

async function callTool(
    params: Record<string, unknown>,
    tools: McpTool[]
  ): Promise<Record<string, unknown>>
{
  const name = params.name;

  const tool =
    tools.find(
      candidate => candidate.name === name);

  if (!tool) {
    return toolError(
      `Tool is not registered: ${String(name)}`);
  }

  const args =
    params.arguments ?? {};

  if (
    typeof args
    !== 'object'
    || args === null
    || Array.isArray(args)
  ) {
    return toolError(
      'tools/call arguments must be an object');
  }

  try {
    const result =
      await tool.invoke(
        args as Record<string, unknown>);

    return { content:
               [ { type: 'text',
                   text:
                     describeResult(
                       tool.name,
                       result) } ] };
  } catch (error) {
    return toolError(
      messageOf(error));
  }
}

/**
 * A tool that answers with nothing says so, rather than sending no text.
 */
function describeResult(
    name: string,
    result: unknown
  ): string
{
  if (result === undefined) {
    return `${name} completed`;
  }

  return JSON.stringify(
    result,
    null,
    2);
}

function toolError(
    message: string
  ): Record<string, unknown>
{
  return { content:
             [ { type: 'text',
                 text: message } ],
           isError: true };
}
