import { createLoggerProvider,
         readLoggerOptions }
  from 'asljs-logging';
import { type AgentSpec,
         AI_AGENTS,
         parseAgentSpec,
         postProcess,
         takeWritten,
         untilStopped }
  from 'asljs-mdcli';
import { Command,
         CommanderError }
  from 'commander';
import { Server }
  from 'node:http';
import path
  from 'node:path';
import { execArchive }
  from './archive.js';
import { OVERRIDE }
  from './ask.js';
import { execDevelop }
  from './develop.js';
import { execExec }
  from './exec.js';
import { getLogger,
         Io }
  from './io.js';
import { execList }
  from './list.js';
import { execPlan }
  from './plan.js';
import { execTasks }
  from './tasks.js';
import { execView }
  from './view.js';

/**
 * The configuration file, looked for in the board folder and its parents.
 */
export const CONFIG_FILE = 'board.json';

const WORKING_DIR =
  'The board folder, which holds Ideas, Plans, Tasks, Results and Archive; the current directory by default';

const AI =
  `The AI agent and model, [${
  AI_AGENTS.join('|')
}][:<model>], e.g. claude:fable; the first installed agent by default, ${OVERRIDE} replaces it`;

/**
 * What a run of the command line leaves: its exit code, and the Io of the
 * command, with `--working-dir` applied.
 */
export interface CliState
{
  exitCode: number;
  io: Io;
}

/**
 * The `board` command line, not yet run: the program, and the state its
 * actions set.
 */
export function createCli(
    args: string[],
    io: Io,
    servers: Server[] = [ ]
  ): { cli: Command; state: CliState; }
{
  const state: CliState =
    { exitCode: 0,
      io };

  const cli =
    new Command();

  cli.name('board')
    .description(
      'A planning board in markdown: develop ideas into plans, plans into tasks, and carry the tasks out with an AI agent.')
    .helpCommand(false)
    .configureOutput(
      { writeOut:
          value => io.stdout.write(value),
        writeErr:
          value => io.stderr.write(value) })
    .exitOverride()
    .option(
      '--loglevel <level>',
      'Log level: trace, debug, information, warning, error')
    .option(
      '--logfile <target>',
      'Where logs go: a file path, stdout or stderr')
    .option(
      '--logformat <format>',
      'Log format: auto, json, text or pretty')
    .hook(
      'preAction',
      (
          _cli,
          action
        ) =>
      {
        const folder =
          action.opts().workingDir as string | undefined;

        state.io =
          folder === undefined
          ? io
          : { ...io,
              cwd:
                path.resolve(
                  io.cwd,
                  folder) };
      });

  cli.command('develop')
    .description(
      'Develop an idea, plan or task with an AI agent: elaborate it, fold in the answers to its open questions, and list what is still open')
    .argument(
      '<item>',
      'An idea, plan or task: an id such as I19, P19 or T19-2, a .md name or a path')
    .argument(
      '[guidance]',
      'What to do, e.g. "add user specific goals"')
    .option(
      '--ai [agent]',
      AI)
    .action(
      async (
          target: string,
          guidance: string | undefined,
          options: { ai?: string | true; }
        ) =>
      {
        state.exitCode =
          await execDevelop(
            state.io,
            { target,
              guidance,
              ai:
                toSpec(options.ai) });
      });

  cli.command('plan')
    .description(
      'Write the plan of an idea, Plans/P<n> <subject>.md, with an AI agent')
    .argument(
      '<idea>',
      'An idea: an id such as I19, a .md name or a path')
    .argument(
      '[guidance]',
      'What the plan should aim at')
    .option(
      '--ai [agent]',
      AI)
    .action(
      async (
          target: string,
          guidance: string | undefined,
          options: { ai?: string | true; }
        ) =>
      {
        state.exitCode =
          await execPlan(
            state.io,
            { target,
              guidance,
              ai:
                toSpec(options.ai) });
      });

  cli.command('tasks')
    .description(
      'Break a plan into tasks, Tasks/T<n>-<m> <subject>.md, with an AI agent')
    .argument(
      '<plan>',
      'A plan: an id such as P19, a .md name or a path')
    .option(
      '--ai [agent]',
      AI)
    .action(
      async (
          target: string,
          options: { ai?: string | true; }
        ) =>
      {
        state.exitCode =
          await execTasks(
            state.io,
            { target,
              ai:
                toSpec(options.ai) });
      });

  cli.command('exec')
    .description(
      'Carry out the tasks of a plan one by one with an AI agent, writing each result to Results/R<n>-<m> <subject>.md')
    .argument(
      '<plan>',
      'A plan: an id such as P19, a .md name or a path')
    .option(
      '--ai [agent]',
      AI)
    .action(
      async (
          target: string,
          options: { ai?: string | true; }
        ) =>
      {
        state.exitCode =
          await execExec(
            state.io,
            { target,
              ai:
                toSpec(options.ai) });
      });

  cli.command('archive')
    .description(
      'Move an idea and its plan, tasks and results to Archive/I<n> <subject>/')
    .argument(
      '<idea>',
      'An idea, or any item of it: an id such as I19, a .md name or a path')
    .action(
      async (
          target: string
        ) =>
      {
        state.exitCode =
          await execArchive(
            state.io,
            { target });
      });

  cli.command('list')
    .description(
      'List the ideas, plans, tasks and results of the board')
    .option(
      '--json',
      'Print JSON')
    .action(
      async (
          options: { json?: boolean; }
        ) =>
      {
        state.exitCode =
          await execList(
            state.io,
            { json: options.json });
      });

  cli.command('view')
    .description(
      'Serve the board, a column each for Ideas, Plans, Tasks and Results, and the documents over HTTP')
    .option(
      '--port <port>',
      'Port to listen on, exactly; 0 picks a free one. By default the first free port from 3000 on')
    .action(
      async (
          options: { port?: string; }
        ) =>
      {
        const port =
          options.port === undefined
          ? undefined
          : Number(options.port);

        if (
          port !== undefined
          && (!Number.isInteger(port)
              || port < 0
              || port > 65535)
        ) {
          throw new Error(
            `Invalid port: ${options.port}`);
        }

        servers.push(
          await execView(
            state.io,
            { port }));
      });

  for (const command of cli.commands) {
    command.option(
      '--working-dir <folder>',
      WORKING_DIR);
  }

  return { cli,
           state };
}

/**
 * Runs the `board` command line and returns the exit code. `board view`
 * returns once the server listens, and adds it to `servers`; it serves until
 * whoever passed `servers` closes it.
 */
export async function runCli(
    args: string[],
    io: Io,
    servers: Server[] = [ ]
  ): Promise<number>
{
  const { cli, state } =
    createCli(
      args,
      io,
      servers);

  if (args.length === 0) {
    cli.outputHelp();
    return 0;
  }

  const logger =
    getLogger(
      io,
      'board');

  logger.debug(
    { args },
    'command started');

  takeWritten();

  try {
    await cli.parseAsync(
      args,
      { from: 'user' });
  } catch (error) {
    if (error instanceof CommanderError) {
      return error.exitCode;
    }

    io.stderr.write(
      `${
        error instanceof Error
          ? error.message
          : String(error)
      }\n`);

    state.exitCode = 1;
  }

  try {
    const processed =
      await postProcess(
        { ...state.io,
          logger:
            getLogger(
              state.io,
              'board.post-process') },
        takeWritten(),
        CONFIG_FILE);

    logger.debug(
      { exitCode: state.exitCode,
        postProcessing: processed },
      'command finished');

    return state.exitCode === 0
      ? processed
      : state.exitCode;
  } catch (error) {
    io.stderr.write(
      `${
        error instanceof Error
          ? error.message
          : String(error)
      }\n`);

    return 1;
  }
}

function toSpec(
    value: string | true | undefined
  ): AgentSpec | undefined
{
  return value === undefined
    ? undefined
    : parseAgentSpec(value);
}

/**
 * The `board` executable: runs the command line with a logger provider made
 * from `--loglevel`, `--logfile`, `--logformat` and the `BOARD_LOG_`
 * variables, and disposes it before it returns the exit code. A server that
 * `view` started serves until SIGINT or SIGTERM first.
 */
export async function main(
    args: string[],
    io: Io
  ): Promise<number>
{
  const loggerProvider =
    createLoggerProvider(
      'BOARD_LOG_',
      readLoggerOptions(args));

  const servers: Server[] = [ ];

  try {
    const exitCode =
      await runCli(
        args,
        { ...io,
          loggerProvider },
        servers);

    for (const server of servers) {
      await untilStopped(server);
    }

    return exitCode;
  } finally {
    await loggerProvider.dispose();
  }
}
