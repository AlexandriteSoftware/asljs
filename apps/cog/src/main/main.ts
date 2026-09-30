import { Command,
         CommanderError }
  from 'commander';
import { readFileSync }
  from 'node:fs';
import { DefaultHostConsole }
  from '../console.js';
import { Context }
  from '../context.js';
import { CopilotAcpService,
         type CopilotService }
  from '../copilot.js';
import { createLoggerProvider }
  from '../logger.js';
import { NodeCommandRunner }
  from '../node-command-runner.js';
import { SingletonServiceProvider }
  from '../service.js';
import { DefaultTaskRunner,
         TaskRegistry }
  from '../task.js';
import { CopilotAcpTool }
  from '../tasks/copilot/acp-client.js';
import { AsljsFormatterTool }
  from '../tasks/formatting/asljs-formatter.js';
import { DprintFormatterTool }
  from '../tasks/formatting/dprint-formatter.js';
import { JbDotnetFormatterTool }
  from '../tasks/formatting/jb-dotnet-formatter.js';
import { GitTool }
  from '../tasks/git/git.js';
import { registerCoreTasks }
  from '../tasks/register.js';
import { DotnetCliTool }
  from '../tasks/workflow/dotnet.js';
import { NpmCliTool }
  from '../tasks/workflow/npm.js';
import { TodoTool }
  from '../tasks/workflow/todo-reader.js';
import { configureConfigCommand }
  from './config.js';
import { configureListCommand }
  from './list.js';
import { readLoggerOptions }
  from './logger-options.js';
import { configureReadCommand }
  from './read.js';
import { readTaskDirectories,
         registerTaskDirectories }
  from './task-directories.js';
import { configureTaskCommands }
  from './tasks.js';
import { ExecutionContext }
  from './types.js';
import { configureUpdateCommand }
  from './update.js';

function collect(
    value: string,
    values: string[]
  ): string[]
{
  return [ ...values,
           value ];
}

type PackageMetadata = {
  version: string;
};

const packageMetadata: PackageMetadata =
  JSON.parse(
    readFileSync(
      new URL(
        '../../package.json',
        import.meta.url),
      'utf8')) as PackageMetadata;

export async function main(
    argv = process.argv
  ): Promise<void>
{
  const loggerProvider =
    createLoggerProvider(
      readLoggerOptions(
        argv));

  const logger =
    loggerProvider.getLogger(
      'cog.main');

  const taskRegistry =
    new TaskRegistry();

  registerCoreTasks(
    taskRegistry);

  await registerTaskDirectories(
    taskRegistry,
    readTaskDirectories(
      argv));

  const serviceProvider =
    new SingletonServiceProvider();

  const commandRunner =
    new NodeCommandRunner();

  const hostConsole =
    new DefaultHostConsole();

  const copilotTool =
    new CopilotAcpTool(
      loggerProvider.getLogger(
        'CopilotAcpTool'),
      { taskRegistry });

  serviceProvider.register<CopilotService>(
    'copilot',
    () =>
      new CopilotAcpService(
        copilotTool)
  );

  const automation =
    new Context(
      { taskFactory: taskRegistry,
        taskRunner:
          new DefaultTaskRunner(),
        serviceProvider,
        logger:
          loggerProvider.getLogger(
            'cog.tasks'),
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

  const context: ExecutionContext =
    { loggerProvider,
      logger,
      console: hostConsole,
      automation };

  try {
    const program =
      new Command();

    program
      .name(
        'cog')
      .allowExcessArguments(
        false)
      .exitOverride()
      .option(
        '--envelope <path>',
        'path to the envelope JSON file')
      .option(
        '--tasks-dir <path>',
        'directory containing task modules',
        collect,
        [ ])
      .option(
        '--context <path>',
        'path to persisted context JSON data')
      .option(
        '--init-context <path>',
        'path to initial context JSON data')
      .option(
        '--loglevel <level>',
        'logging level, for example trace or information')
      .option(
        '--logfile <path>',
        'file to write logs to')
      .showHelpAfterError();

    configureReadCommand(
      program,
      context);

    configureListCommand(
      program,
      context);

    configureUpdateCommand(
      program,
      context);

    configureConfigCommand(
      program,
      context);

    configureTaskCommands(
      program,
      context,
      taskRegistry);

    program
      .command(
        'version')
      .description(
        'print application version')
      .action(
        () =>
        {
          context.console.writeLine(
            packageMetadata.version);
        });

    program
      .action(
        () =>
        {
          throw new Error(
            'Usage: cog <command> [args...]. Run cog --help to list commands.');
        });

    // exitOverride turns help and version output into a zero-exit error.
    try {
      await program.parseAsync(
        argv);
    } catch (error) {
      if (
        !(error instanceof CommanderError)
        || error.exitCode !== 0
      ) {
        throw error;
      }
    }
  } finally {
    await serviceProvider.dispose();
    await loggerProvider.dispose();
  }
}
