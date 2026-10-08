import { Command,
         CommanderError }
  from 'commander';
import { AI_AGENTS,
         AiAgent }
  from './coverage.js';
import { Io }
  from './io.js';
import { execVerify }
  from './verify.js';
import { execView }
  from './view.js';

/**
 * Runs the `rq` command line and returns the exit code. `rq view` returns
 * once the server listens; the server keeps the process running.
 */
export async function runCli(
    args: string[],
    io: Io
  ): Promise<number>
{
  let exitCode = 0;

  const cli =
    new Command();

  cli.name('rq')
    .description(
      'AI-assisted requirements management: verify and view requirements and evidence written in markdown.')
    .helpCommand(false)
    .configureOutput(
      { writeOut:
          value => io.stdout.write(value),
        writeErr:
          value => io.stderr.write(value) })
    .exitOverride();

  cli.command('verify')
    .description(
      'Verify a requirement and everything it is implemented by: structure, evidence steps and, with --ai, coverage')
    .argument(
      '<path>',
      'A requirement file, or a folder whose root requirement is verified')
    .option(
      '--ai [agent]',
      `Check with an AI agent that each requirement is fully covered: ${
        AI_AGENTS.join(' or ')
      }; claude when omitted`)
    .action(
      async (
          target: string,
          options: { ai?: string | true; }
        ) =>
      {
        exitCode =
          await execVerify(
            io,
            { target,
              ai:
                parseAgent(options.ai) });
      });

  cli.command('view')
    .description(
      'Serve the requirements graph and the rendered documents over HTTP')
    .argument(
      '<path>',
      'A requirement file, or a folder of requirements')
    .option(
      '--port <port>',
      'Port to listen on; 0 picks a free one',
      '3000')
    .action(
      async (
          target: string,
          options: { port: string; }
        ) =>
      {
        const port =
          Number(options.port);

        if (
          !Number.isInteger(port)
          || port < 0
          || port > 65535
        ) {
          throw new Error(
            `Invalid port: ${options.port}`);
        }

        await execView(
          io,
          { target,
            port });
      });

  if (args.length === 0) {
    cli.outputHelp();
    return 0;
  }

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

    return 1;
  }

  return exitCode;
}

function parseAgent(
    value: string | true | undefined
  ): AiAgent | undefined
{
  if (value === undefined) {
    return undefined;
  }

  if (value === true) {
    return 'claude';
  }

  const agent =
    value.trim() as AiAgent;

  if (!AI_AGENTS.includes(agent)) {
    throw new Error(
      `Unknown AI agent: ${value}. Use ${AI_AGENTS.join(' or ')}.`);
  }

  return agent;
}
