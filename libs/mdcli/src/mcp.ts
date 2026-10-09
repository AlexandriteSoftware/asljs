import { type Logger,
         NullLogger }
  from 'asljs-logging';
import { type Command }
  from 'commander';
import { Readable }
  from 'node:stream';

export const PROTOCOL_VERSION = '2024-11-05';

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

/**
 * The name and version a server reports to `initialize`.
 */
export interface McpServerInfo
{
  name: string;
  version: string;
}

export interface McpTool
{
  name: string;

  description: string;

  /**
   * JSON Schema of the tool arguments, as sent in `tools/list`.
   */
  inputSchema: Record<string, unknown>;

  /**
   * Runs the tool. A `textResult` is sent as it is; anything else as JSON, or
   * `<name> completed` for `undefined`. A thrown error is an error result.
   */
  invoke: (
    args: Record<string, unknown>
  ) => Promise<unknown>;
}

const TEXT_RESULT =
  Symbol('textResult');

export interface TextResult
{
  [TEXT_RESULT]: true;
  text: string;
  isError: boolean;
}

/**
 * A tool result sent as plain text rather than JSON, and marked as an error
 * when `isError`.
 */
export function textResult(
    text: string,
    isError = false
  ): TextResult
{
  return { [TEXT_RESULT]: true,
           text,
           isError };
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
    tools: McpTool[],
    info: McpServerInfo
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
                   { name: info.name,
                     version: info.version } } };
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
 * Call back once per complete line of a stream.
 *
 * A chunk can end mid-line, so the partial line is held until the rest of it
 * arrives. Both ends of the protocol read this way.
 */
export function readLines(
    input: Readable,
    onLine: (line: string) => void
  ): void
{
  let buffer = '';

  input.setEncoding('utf8');

  input.on(
    'data',
    (
        chunk: string
      ) =>
    {
      buffer += chunk;

      const lines =
        buffer.split('\n');

      buffer =
        lines.pop() ?? '';

      for (const line of lines) {
        onLine(line);
      }
    });
}

export interface ServeOptions
{
  /**
   * Where a line that is not valid JSON, which is ignored, is logged at
   * `warning`, each request at `trace`, and each tool call at `debug`;
   * nothing is logged when absent.
   */
  logger?: Logger;
}

/**
 * Serve `tools` over a line-delimited JSON-RPC stream. Resolves when the input
 * stream ends and every request is answered.
 */
export async function serveLines(
    input: Readable,
    write: (line: string) => void,
    tools: McpTool[],
    info: McpServerInfo,
    options: ServeOptions = {}
  ): Promise<void>
{
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
          info,
          write,
          options));
    });

  await new Promise<void>(
    resolve =>
      input.on(
        'end',
        resolve)
  );

  await Promise.all(pending);
}

/**
 * The output of a command line run by a tool of `commandTools`.
 */
export interface CommandOutput
{
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface CommandToolsOptions
{
  /**
   * Commands not to expose, by their full name, e.g. `view` or `add test`.
   */
  skip?: string[];
}

/**
 * A tool per command of a commander program, subcommands included, named by
 * the command path joined with `_`, e.g. `add_test`. Its arguments are the
 * command's arguments and options, by their names, e.g. `targets` and
 * `workingDir`; a call turns them back into a command line and runs it with
 * `run`, one call at a time. The result is the output as text, an error
 * result when the exit code is not 0.
 */
export function commandTools(
    program: Command,
    run: (args: string[]) => Promise<CommandOutput>,
    options: CommandToolsOptions = {}
  ): McpTool[]
{
  const skip =
    new Set(
      options.skip ?? [ ]);

  let queue: Promise<unknown> =
    Promise.resolve();

  const serialized =
    (
        args: string[]
      ): Promise<CommandOutput> =>
    {
    const next =
      queue.then(
        () => run(args));

    queue =
      next.catch(() => undefined);

    return next;
  };

  const tools: McpTool[] = [ ];

  const visit =
    (
        command: Command,
        prefix: string[]
      ): void =>
    {
    for (const child of command.commands) {
      const names =
        [ ...prefix,
          child.name() ];

      if (
        skip.has(
          names.join(' '))
      ) {
        continue;
      }

      if (child.commands.length > 0) {
        visit(
          child,
          names);

        continue;
      }

      tools.push(
        commandTool(
          child,
          names,
          serialized));
    }
  };

  visit(
    program,
    [ ]);

  return tools;
}

function commandTool(
    command: Command,
    names: string[],
    run: (args: string[]) => Promise<CommandOutput>
  ): McpTool
{
  const properties: Record<string, unknown> = {};

  const required: string[] = [ ];

  for (const argument of command.registeredArguments) {
    properties[argument.name()] =
      argument.variadic
      ? stringArrayProperty(
        argument.description)
      : stringProperty(
        argument.description);

    if (argument.required) {
      required.push(
        argument.name());
    }
  }

  for (const option of command.options) {
    properties[option.attributeName()] =
      option.required
      ? stringProperty(option.description)
      : option.optional
      ? stringProperty(
        `${option.description}. An empty string gives the option without a value`)
      : booleanProperty(option.description);
  }

  const name =
    names.join('_');

  return { name,
           description:
             `${command.description()} (\`${names.join(' ')}\`)`,
           inputSchema:
             objectSchema(
               properties,
               required),
           invoke:
             async (
                 args
               ) =>
             {
      const result =
        await run(
          toCommandLine(
            command,
            names,
            args));

      const text =
        [ result.stdout,
          result.stderr,
          result.exitCode === 0
          ? ''
          : `Exit code: ${result.exitCode}` ]
        .filter(
          part => part.trim() !== '')
        .map(
          part => part.trimEnd())
        .join('\n');

      return textResult(
        text === ''
          ? `${name} completed`
          : text,
        result.exitCode !== 0);
    } };
}

/**
 * The command line of a call: the command, its options as `--name=value` or
 * `--name`, then `--` and the arguments, so that a value starting with `-` is
 * never read as an option.
 */
function toCommandLine(
    command: Command,
    names: string[],
    args: Record<string, unknown>
  ): string[]
{
  const known =
    new Set(
      [ ...command.registeredArguments.map(
        argument => argument.name()),
        ...command.options.map(
          option => option.attributeName()) ]);

  for (const key of Object.keys(args)) {
    if (!known.has(key)) {
      throw new Error(
        `Unknown argument: ${key}`);
    }
  }

  const line =
    [ ...names ];

  for (const option of command.options) {
    const value =
      args[option.attributeName()];

    if (
      value === undefined
      || value === null
      || value === false
    ) {
      continue;
    }

    const flag =
      option.long ?? option.short!;

    if (
      value === true
      || option.optional
         && value === ''
    ) {
      line.push(flag);
    } else {
      line.push(
        `${flag}=${String(value)}`);
    }
  }

  const operands: string[] = [ ];

  for (const argument of command.registeredArguments) {
    const value =
      args[argument.name()];

    if (
      value === undefined
      || value === null
      || Array.isArray(value)
         && value.length === 0
    ) {
      if (argument.required) {
        throw new Error(
          `Missing argument: ${argument.name()}`);
      }

      continue;
    }

    operands.push(
      ...(Array.isArray(value)
        ? value
        : [ value ]).map(
          item => String(item)));
  }

  return operands.length === 0
    ? line
    : [ ...line,
        '--',
        ...operands ];
}

async function respond(
    line: string,
    tools: McpTool[],
    info: McpServerInfo,
    write: (line: string) => void,
    options: ServeOptions
  ): Promise<void>
{
  const logger =
    options.logger ?? new NullLogger();

  let message: JsonRpcMessage;

  try {
    message =
      JSON.parse(line) as JsonRpcMessage;
  } catch {
    logger.warning(
      'ignored a line that is not valid JSON');

    return;
  }

  logger.trace(
    { method: message.method,
      id: message.id },
    'request');

  if (message.method === 'tools/call') {
    logger.debug(
      { tool:
          message.params?.name },
      'tool call');
  }

  const response =
    await handleMessage(
      message,
      tools,
      info);

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

    if (isTextResult(result)) {
      return { content:
                 [ { type: 'text',
                     text: result.text } ],
               ...result.isError
          ? { isError: true }
          : {} };
    }

    return { content:
               [ { type: 'text',
                   text:
                     describeResult(
                       tool.name,
                       result) } ] };
  } catch (error) {
    return toolError(
      error instanceof Error
        ? error.message
        : String(error));
  }
}

function isTextResult(
    value: unknown
  ): value is TextResult
{
  return typeof value === 'object'
    && value !== null
    && TEXT_RESULT in value;
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

/**
 * Builders for the JSON Schema a tool declares for its arguments.
 */

export function objectSchema(
    properties: Record<string, unknown>,
    required: string[] = [ ]
  ): Record<string, unknown>
{
  if (required.length === 0) {
    return { type: 'object',
             properties };
  }

  return { type: 'object',
           properties,
           required };
}

export function stringProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'string',
           description };
}

export function booleanProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'boolean',
           description };
}

export function numberProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'number',
           description };
}

export function stringArrayProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'array',
           items:
             { type: 'string' },
           description };
}

export function enumProperty(
    values: readonly string[],
    description: string
  ): Record<string, unknown>
{
  return { type: 'string',
           enum:
             [ ...values ],
           description };
}
