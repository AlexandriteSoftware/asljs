import { Context }
  from './context.js';
import { CopilotAcpService,
         type CopilotService }
  from './copilot.js';
import { createLoggerProvider }
  from './logger.js';
import { SingletonServiceProvider }
  from './service.js';
import { DefaultTaskRunner,
         type TaskDefinition,
         type TaskParameter,
         TaskRegistry }
  from './task.js';
import { registerCoreTasks }
  from './tasks/register.js';
import { AsljsFormatterTool }
  from './tools/asljs-formatter.js';
import { CopilotAcpTool }
  from './tools/copilot.js';
import { DotnetCliTool }
  from './tools/dotnet.js';
import { DprintFormatterTool }
  from './tools/dprint-formatter.js';
import { GitTool }
  from './tools/git.js';
import { JbDotnetFormatterTool }
  from './tools/jb-dotnet-formatter.js';
import { NodeCommandRunner }
  from './tools/node-command-runner.js';
import { NpmCliTool }
  from './tools/npm.js';
import { TodoTool }
  from './tools/todo.js';

interface JsonRpcMessage
{
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
}

export async function main(
  ): Promise<void>
{
  const registry =
    new TaskRegistry();

  registerCoreTasks(registry);

  const loggerProvider =
    createLoggerProvider();

  const serviceProvider =
    new SingletonServiceProvider();

  const commandRunner =
    new NodeCommandRunner();

  const copilotTool =
    new CopilotAcpTool(
      loggerProvider.getLogger(
        'CopilotAcpTool'),
      { taskRegistry: registry });

  serviceProvider.register<CopilotService>(
    'copilot',
    () =>
      new CopilotAcpService(
        copilotTool)
  );

  const context =
    new Context(
      { taskFactory: registry,
        taskRunner:
          new DefaultTaskRunner(),
        serviceProvider,
        logger:
          loggerProvider.getLogger(
            'cog.mcp'),
        tools:
          [ [ 'asljs-formatter',
              new AsljsFormatterTool(
                commandRunner) ],
            [ 'copilot',
              copilotTool ],
            [ 'dotnet',
              new DotnetCliTool(
                commandRunner,
                loggerProvider.getLogger(
                  'DotnetCliTool')) ],
            [ 'dprint-formatter',
              new DprintFormatterTool(
                commandRunner) ],
            [ 'git',
              new GitTool(
                commandRunner) ],
            [ 'jb-dotnet-formatter',
              new JbDotnetFormatterTool(
                commandRunner) ],
            [ 'npm',
              new NpmCliTool(
                commandRunner,
                loggerProvider.getLogger(
                  'NpmCliTool')) ],
            [ 'todos',
              new TodoTool(
                loggerProvider.getLogger(
                  'TodoTool')) ] ] });

  let buffer = '';

  process.stdin.setEncoding('utf8');

  process.stdin.on(
    'data',
    (
        chunk
      ) =>
    {
      buffer += chunk;

      const lines =
        buffer.split('\n');

      buffer =
        lines.pop() ?? '';

      for (const line of lines) {
        if (line.trim() !== '') {
          void handle(
            JSON.parse(line) as JsonRpcMessage,
            registry,
            context);
        }
      }
    });

  await new Promise<void>(
    resolve =>
      process.stdin.on(
        'end',
        resolve)
  );

  await serviceProvider.dispose();
  await loggerProvider.dispose();
}

async function handle(
    message: JsonRpcMessage,
    registry: TaskRegistry,
    context: Context
  ): Promise<void>
{
  if (message.id === undefined) {
    return;
  }

  try {
    const result =
      message.method === 'initialize'
      ? { protocolVersion: '2024-11-05',
          capabilities:
            { tools: {} },
          serverInfo:
            { name: 'asljs-cog-tasks',
              version: '0.1.0' } }
      : message.method === 'tools/list'
      ? { tools:
            registry.definitions().map(toTool) }
      : message.method === 'tools/call'
      ? await callTask(
        message.params ?? {},
        registry,
        context)
      : undefined;

    if (result === undefined) {
      send(
        { jsonrpc: '2.0',
          id: message.id,
          error:
            { code: -32601,
              message:
                `Method not found: ${message.method ?? ''}` } });

      return;
    }

    send(
      { jsonrpc: '2.0',
        id: message.id,
        result });
  } catch (error) {
    send(
      { jsonrpc: '2.0',
        id: message.id,
        result:
          { content:
              [ { type: 'text',
                  text:
                    error instanceof Error
              ? error.message
              : String(error) } ],
            isError: true } });
  }
}

function toTool(
    definition: TaskDefinition
  ): Record<string, unknown>
{
  const properties: Record<string, unknown> = {};

  for (const parameter of definition.parameters ?? [ ]) {
    properties[parameter.name] =
      toSchema(parameter);
  }

  return { name: definition.name,
           description:
             definition.description
      ?? `Run the ${definition.name} task`,
           inputSchema:
             { type: 'object',
               properties } };
}

function toSchema(
    parameter: TaskParameter
  ): Record<string, unknown>
{
  if (
    parameter.type === 'string[]'
    || parameter.type === 'object[]'
  ) {
    return { type: 'array',
             items:
               { type:
                   parameter.type === 'object[]'
          ? 'object'
          : 'string' } };
  }

  return { type:
             parameter.type === 'number'
      ? 'number'
      : parameter.type };
}

async function callTask(
    params: Record<string, unknown>,
    registry: TaskRegistry,
    context: Context
  ): Promise<Record<string, unknown>>
{
  const name = params.name;

  if (
    typeof name
    !== 'string'
    || !registry.definitions().some(
      definition => definition.name === name)
  ) {
    throw new Error(
      `Task is not registered: ${String(name)}`);
  }

  const argumentsValue =
    params.arguments ?? {};

  if (
    typeof argumentsValue
    !== 'object'
    || argumentsValue === null
    || Array.isArray(argumentsValue)
  ) {
    throw new Error(
      'tools/call arguments must be an object');
  }

  const result =
    await context.run(
      context.createTask(
        name,
        argumentsValue));

  return { content:
             [ { type: 'text',
                 text:
                   result === undefined
        ? `Task ${name} completed`
        : JSON.stringify(result) } ] };
}

function send(
    message: unknown
  ): void
{
  process.stdout.write(
    `${JSON.stringify(message)}\n`);
}

if (process.argv[1]?.endsWith('mcp.js')) {
  await main();
}
