import { spawn }
  from 'node:child_process';
import { connect,
         Socket }
  from 'node:net';
import { Readable,
         Writable }
  from 'node:stream';
import { fileURLToPath }
  from 'node:url';
import { Environment }
  from '../environment.js';
import { endpointFor }
  from './endpoint.js';
import { readLines }
  from './lines.js';
import { handleMessage,
         SERVER_NAME }
  from './server.js';
import { createTools }
  from './tools.js';

/**
 * How a client reached its server.
 */
export type ClientKind =
  | 'connected'
  | 'internal'
  | 'in-process';

export interface McpClient
{
  readonly kind: ClientKind;

  /**
   * Call one tool and return its result, already parsed.
   */
  call: (
    tool: string,
    args: Record<string, unknown>
  ) => Promise<unknown>;

  close: () => Promise<void>;
}

export interface OpenClientOptions
{
  /**
   * Address of a running server. Defaults to the address of the library.
   */
  endpoint?: string;

  /**
   * Fail when no server is running rather than starting one.
   */
  connectOnly?: boolean;
}

interface Waiting
{
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

interface Connection
{
  request: (
    method: string,
    params: Record<string, unknown>
  ) => Promise<unknown>;

  close: () => Promise<void>;
}

/**
 * Open a client for a library.
 *
 * A server already serving that library is used when there is one, so its
 * warm index answers the call. Otherwise a server is started for this one
 * call and shut down when the client closes.
 */
export async function openClient(
    root: string,
    options: OpenClientOptions = {}
  ): Promise<McpClient>
{
  const endpoint =
    options.endpoint
    ?? endpointFor(root);

  const connected =
    await connectToEndpoint(endpoint);

  if (connected) {
    return connected;
  }

  if (options.connectOnly === true) {
    throw new Error(
      `No knowledge base server is listening on ${endpoint}.`);
  }

  return await startInternalServer(root);
}

/**
 * Connect to a server that is already running.
 *
 * Returns `null` when nothing is listening, and when what answers is not a
 * knowledge base server.
 */
export async function connectToEndpoint(
    endpoint: string
  ): Promise<McpClient | null>
{
  const socket =
    await openSocket(endpoint);

  if (!socket) {
    return null;
  }

  const connection =
    createConnection(
      socket,
      socket,
      (): Promise<void> =>
      {
        // Ending alone leaves the connection half open when the peer does
        // not answer with its own end, which keeps the process alive.
        socket.end();
        socket.destroy();

        return Promise.resolve();
      });

  const served =
    await shakeHands(connection);

  if (!served) {
    await connection.close();

    return null;
  }

  return { kind: 'connected',
           call:
             toolCaller(connection),
           close: connection.close };
}

/**
 * Start a server for this call, and shut it down when the client closes.
 *
 * The server is started without an index, because a process that serves one
 * command gains nothing from building one.
 */
export async function startInternalServer(
    root: string
  ): Promise<McpClient>
{
  const child =
    spawn(
      process.execPath,
      [ serverPath(),
        '--library',
        root,
        '--no-index' ],
      { stdio:
          [ 'pipe',
            'pipe',
            'inherit' ] });

  const connection =
    createConnection(
      child.stdout as Readable,
      child.stdin as Writable,
      (): Promise<void> =>
      new Promise<void>(
        (
            resolve
          ) =>
        {
          child.once(
            'exit',
            () => resolve());

          child.stdin.end();
        }));

  await shakeHands(connection);

  return { kind: 'internal',
           call:
             toolCaller(connection),
           close: connection.close };
}

/**
 * A client that calls the tools in this process, over no transport.
 *
 * Tests use it to exercise a command without a process boundary.
 */
export function createInProcessClient(
    environment: Environment
  ): McpClient
{
  return { kind: 'in-process',
           call:
             async (
                 tool,
                 args
               ) =>
             {
             const response =
               await handleMessage(
                 { jsonrpc: '2.0',
                   id: 1,
                   method: 'tools/call',
                   params:
                     { name: tool,
                       arguments: args } },
                 createTools(environment));

             return readToolResult(response?.result);
           },
           close:
             () => Promise.resolve() };
}

function toolCaller(
    connection: Connection
  ): (tool: string, args: Record<string, unknown>) => Promise<unknown>
{
  return async (tool, args) =>
    readToolResult(
      await connection.request(
        'tools/call',
        { name: tool,
          arguments: args }));
}

/**
 * Confirm the peer is a knowledge base server before anything is asked of it.
 */
async function shakeHands(
    connection: Connection
  ): Promise<boolean>
{
  const result =
    await connection.request(
      'initialize',
      { protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo:
          { name: 'kb-cli',
            version: '1' } })
      .catch(() => null);

  const info =
    (result as { serverInfo?: { name?: string; }; })?.serverInfo;

  return info?.name === SERVER_NAME;
}

function openSocket(
    endpoint: string
  ): Promise<Socket | null>
{
  return new Promise<Socket | null>(
    (
        resolve
      ) =>
    {
      const socket =
        connect(endpoint);

      socket.once(
        'connect',
        () => resolve(socket));

      socket.once(
        'error',
        () =>
        {
          socket.destroy();

          resolve(null);
        });
    });
}

function createConnection(
    input: Readable,
    output: Writable,
    close: () => Promise<void>
  ): Connection
{
  const pending = new Map<number, Waiting>();

  let nextId = 1;

  readLines(
    input,
    line =>
    deliver(
      line,
      pending));

  input.on(
    'close',
    () => abandon(pending));

  return { request:
             (
                 method,
                 params
               ) =>
             {
             const id = nextId;

             nextId += 1;

             const answer =
               new Promise<unknown>(
                 (resolve, reject) =>
                 pending.set(
                   id,
                   { resolve,
                     reject }));

             output.write(
               `${
                 JSON.stringify(
                   { jsonrpc: '2.0',
                     id,
                     method,
                     params })}\n`);

             return answer;
           },
           close };
}

function deliver(
    line: string,
    pending: Map<number, Waiting>
  ): void
{
  const message =
    parseMessage(line);

  if (!message) {
    return;
  }

  const waiting =
    pending.get(message.id);

  if (!waiting) {
    return;
  }

  pending.delete(message.id);

  if (message.error) {
    waiting.reject(
      new Error(message.error));

    return;
  }

  waiting.resolve(message.result);
}

function parseMessage(
    line: string
  ): { id: number; result?: unknown; error?: string; } | null
{
  if (line.trim() === '') {
    return null;
  }

  let message: {
    id?: number;
    result?: unknown;
    error?: { message?: string; };
  };

  try {
    message =
      JSON.parse(line);
  } catch {
    return null;
  }

  if (
    typeof message.id
    !== 'number'
  ) {
    return null;
  }

  if (message.error) {
    return { id: message.id,
             error:
               message.error.message
               ?? 'The knowledge base server reported an error.' };
  }

  return { id: message.id,
           result: message.result };
}

function abandon(
    pending: Map<number, Waiting>
  ): void
{
  for (const waiting of pending.values()) {
    waiting.reject(
      new Error(
        'The knowledge base server closed the connection.'));
  }

  pending.clear();
}

/**
 * Unwrap a `tools/call` result: the payload is JSON in the first text item,
 * and a tool failure arrives as a result rather than as a protocol error.
 */
function readToolResult(
    result: unknown
  ): unknown
{
  const payload =
    result as
      { content?: { type: string; text: string; }[];
        isError?: boolean; };

  const text =
    payload?.content?.[0]?.text ?? '';

  if (payload?.isError === true) {
    throw new Error(text);
  }

  if (text === '') {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function serverPath(
  ): string
{
  return fileURLToPath(
    new URL(
      '../../bin/kb-mcp.js',
      import.meta.url));
}
