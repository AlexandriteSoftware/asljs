import { createLoggerProvider,
         readLoggerOptions }
  from 'asljs-logging';
import { AI_AGENTS,
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
import { execAdd,
         execLink,
         execLog,
         execMove,
         execRemove,
         execUnlink }
  from './change.js';
import { execCheck }
  from './check.js';
import { execCoverage }
  from './coverage.js';
import { getLogger,
         Io }
  from './io.js';
import { execBacklinks,
         execLinks,
         execList,
         execToJson }
  from './query.js';
import { execTest }
  from './test.js';
import { execView }
  from './view.js';

const WORKING_DIR =
  'The folder to work in: paths resolve against it, ids and .md names are searched for in it, and its .rq folder holds the results; the current directory by default';

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
 * The `rq` command line, not yet run: the program, and the state its
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

  const command =
    [ 'rq',
      ...args.map(
        arg =>
        /^[\w./:=@+-]+$/.test(arg)
          ? arg
          : JSON.stringify(arg)) ]
    .join(' ');

  const cli =
    new Command();

  cli.name('rq')
    .description(
      'AI-assisted requirements management: test and view requirements and tests written in markdown.')
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

  cli.command('test')
    .description(
      'Run the tests of requirements and tests, record the results in .rq/E<n> <slug>.md, and report their status')
    .argument(
      '<targets...>',
      'Requirement or test files, folders, .md names, or ids such as R10 or T12')
    .option(
      '--recurse',
      'Also run the tests of every requirement below a requirement target')
    .option(
      '--name <slug>',
      'The slug of the results file; the targets by default')
    .option(
      '--ai [agent]',
      `The AI agent and model, [${
        AI_AGENTS.join('|')
      }][:<model>], e.g. claude:fable, for instruction steps; the first installed agent by default`)
    .action(
      async (
          targets: string[],
          options: {
          recurse?: boolean;
          name?: string;
          ai?: string | true;
        }
        ) =>
      {
        state.exitCode =
          await execTest(
            state.io,
            { targets,
              recurse: options.recurse,
              name: options.name,
              command,
              ai:
                options.ai === undefined
              ? undefined
              : parseAgentSpec(options.ai) });
      });

  cli.command('coverage')
    .description(
      'Ask an AI agent whether the sub-requirements and tests of each requirement fully cover it, and record the verdict in its Status')
    .argument(
      '<targets...>',
      'Requirement files, folders, .md names, or ids such as R10')
    .option(
      '--recurse',
      'Also check every requirement below a requirement target')
    .option(
      '--ai [agent]',
      `The AI agent and model, [${
        AI_AGENTS.join('|')
      }][:<model>], e.g. claude:fable; the first installed agent by default`)
    .action(
      async (
          targets: string[],
          options: {
          recurse?: boolean;
          ai?: string | true;
        }
        ) =>
      {
        state.exitCode =
          await execCoverage(
            state.io,
            { targets,
              recurse: options.recurse,
              ai:
                options.ai === undefined
              ? undefined
              : parseAgentSpec(options.ai) });
      });

  cli.command('view')
    .description(
      'Serve the requirements graph and the rendered documents over HTTP')
    .argument(
      '<path>',
      'A requirement file, or a folder of requirements')
    .option(
      '--port <port>',
      'Port to listen on, exactly; 0 picks a free one. By default the first free port from 3000 on')
    .action(
      async (
          target: string,
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
            { target,
              port }));
      });

  cli.command('check')
    .description(
      'Check the structure of the graph and its documents without running anything')
    .argument(
      '<path>',
      'A requirement file, or a folder of requirements')
    .action(
      async (
          target: string
        ) =>
      {
        state.exitCode =
          await execCheck(
            state.io,
            { target });
      });

  cli.command('list')
    .description(
      'List the requirements and tests of the graph, from the roots down')
    .argument(
      '<path>',
      'A requirement file, or a folder of requirements')
    .option(
      '--json',
      'Print JSON')
    .action(
      async (
          target: string,
          options: { json?: boolean; }
        ) =>
      {
        state.exitCode =
          await execList(
            state.io,
            { target,
              json: options.json });
      });

  cli.command('links')
    .description(
      'List the requirements and tests a requirement links to')
    .argument(
      '<file>',
      'A requirement')
    .option(
      '--json',
      'Print JSON')
    .action(
      async (
          file: string,
          options: { json?: boolean; }
        ) =>
      {
        state.exitCode =
          await execLinks(
            state.io,
            { file,
              json: options.json });
      });

  cli.command('backlinks')
    .description(
      'List the requirements that link to a requirement or a test')
    .argument(
      '<file>',
      'A requirement or a test')
    .option(
      '--json',
      'Print JSON')
    .action(
      async (
          file: string,
          options: { json?: boolean; }
        ) =>
      {
        state.exitCode =
          await execBacklinks(
            state.io,
            { file,
              json: options.json });
      });

  cli.command('tojson')
    .description(
      'Print the graph as JSON with the structural fields and the status of every document')
    .argument(
      '<path>',
      'A requirement file, or a folder of requirements')
    .action(
      async (
          target: string
        ) =>
      {
        state.exitCode =
          await execToJson(
            state.io,
            { target });
      });

  const add =
    cli.command('add')
    .description(
      'Create a requirement or a test and link it from a requirement');

  add.command('requirement')
    .description(
      'Create R<n> <name>.md next to the parent and link it from the parent')
    .argument(
      '<parent>',
      'The requirement it implements')
    .argument(
      '<name>',
      'The name after the id')
    .option(
      '--statement <text>',
      'The statement of the requirement')
    .option(
      '--path <file>',
      'The path of the new document, instead of R<n> <name>.md')
    .action(
      async (
          parent: string,
          name: string,
          options: { statement?: string; path?: string; }
        ) =>
      {
        state.exitCode =
          await execAdd(
            state.io,
            { kind: 'requirement',
              parent,
              name,
              body: options.statement,
              path: options.path });
      });

  add.command('test')
    .description(
      'Create tests/T<n> <name>.md next to the parent and link it from the parent')
    .argument(
      '<parent>',
      'The requirement it shows to hold')
    .argument(
      '<name>',
      'The name after the id')
    .option(
      '--description <text>',
      'What the test shows')
    .option(
      '--step <command>',
      'A shell step running the command; repeat for several',
      collect,
      [ ])
    .option(
      '--path <file>',
      'The path of the new document, instead of tests/T<n> <name>.md')
    .action(
      async (
          parent: string,
          name: string,
          options: {
          description?: string;
          step: string[];
          path?: string;
        }
        ) =>
      {
        state.exitCode =
          await execAdd(
            state.io,
            { kind: 'test',
              parent,
              name,
              body: options.description,
              steps: options.step,
              path: options.path });
      });

  cli.command('link')
    .description(
      'Link an existing requirement or test from a requirement')
    .argument(
      '<parent>',
      'The requirement')
    .argument(
      '<child>',
      'The requirement or test that implements it')
    .action(
      async (
          parent: string,
          child: string
        ) =>
      {
        state.exitCode =
          await execLink(
            state.io,
            { parent,
              child });
      });

  cli.command('unlink')
    .description(
      'Remove the links from a requirement to a requirement or test')
    .argument(
      '<parent>',
      'The requirement')
    .argument(
      '<child>',
      'The requirement or test it links to')
    .action(
      async (
          parent: string,
          child: string
        ) =>
      {
        state.exitCode =
          await execUnlink(
            state.io,
            { parent,
              child });
      });

  cli.command('remove')
    .description(
      'Delete a requirement or a test and the links to it')
    .argument(
      '<file>',
      'A requirement or a test')
    .option(
      '--recursive',
      'Also delete what it links to that nothing else links to')
    .action(
      async (
          file: string,
          options: { recursive?: boolean; }
        ) =>
      {
        state.exitCode =
          await execRemove(
            state.io,
            { file,
              recursive: options.recursive });
      });

  cli.command('move')
    .description(
      'Move or rename a requirement or a test and rewrite the links to it')
    .argument(
      '<file>',
      'A requirement or a test')
    .argument(
      '<destination>',
      'The new path, or a folder to move it into')
    .action(
      async (
          file: string,
          destination: string
        ) =>
      {
        state.exitCode =
          await execMove(
            state.io,
            { file,
              destination });
      });

  cli.command('log')
    .description(
      'Record a result established another way in .rq/E<n> <test>.md')
    .argument(
      '<test>',
      'A test file, .md name or id, e.g. T12')
    .requiredOption(
      '--status <status>',
      'PASS or FAIL')
    .option(
      '--note <text>',
      'A short note')
    .option(
      '--time <time>',
      'The time in ISO 8601; now by default')
    .action(
      async (
          file: string,
          options: {
          status: string;
          note?: string;
          time?: string;
        }
        ) =>
      {
        state.exitCode =
          await execLog(
            state.io,
            { file,
              status: options.status,
              note: options.note,
              time: options.time,
              command });
      });

  for (
    const command of [ ...cli.commands,
                       ...add.commands ]
  ) {
    if (command !== add) {
      command.option(
        '--working-dir <folder>',
        WORKING_DIR);
    }
  }

  return { cli,
           state };
}

/**
 * Runs the `rq` command line and returns the exit code. `rq view`
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
      'rq');

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
              'rq.post-process') },
        takeWritten(),
        'rq.json');

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

function collect(
    value: string,
    previous: string[]
  ): string[]
{
  return [ ...previous,
           value ];
}

/**
 * The `rq` executable: runs the command line with a logger provider made
 * from `--loglevel`, `--logfile`, `--logformat` and the `RQ_LOG_`
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
      'RQ_LOG_',
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
