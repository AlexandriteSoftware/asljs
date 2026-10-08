import { Command,
         CommanderError }
  from 'commander';
import { execAdd,
         execLink,
         execLog,
         execMove,
         execRemove,
         execUnlink }
  from './change.js';
import { execCheck }
  from './check.js';
import { AI_AGENTS,
         AiAgent }
  from './coverage.js';
import { Io }
  from './io.js';
import { execBacklinks,
         execLinks,
         execList,
         execToJson }
  from './query.js';
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
      'A requirement file, or a folder whose roots are verified')
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
        exitCode =
          await execCheck(
            io,
            { target });
      });

  cli.command('list')
    .description(
      'List the requirements and evidence of the graph, from the roots down')
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
        exitCode =
          await execList(
            io,
            { target,
              json: options.json });
      });

  cli.command('links')
    .description(
      'List the requirements and evidence a requirement links to')
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
        exitCode =
          await execLinks(
            io,
            { file,
              json: options.json });
      });

  cli.command('backlinks')
    .description(
      'List the requirements that link to a requirement or an evidence')
    .argument(
      '<file>',
      'A requirement or an evidence')
    .option(
      '--in <folder>',
      'The folder to look in; the working directory by default')
    .option(
      '--json',
      'Print JSON')
    .action(
      async (
          file: string,
          options: { in?: string; json?: boolean; }
        ) =>
      {
        exitCode =
          await execBacklinks(
            io,
            { file,
              in: options.in,
              json: options.json });
      });

  cli.command('tojson')
    .description(
      'Print the graph as JSON with the structural fields of every document')
    .argument(
      '<path>',
      'A requirement file, or a folder of requirements')
    .action(
      async (
          target: string
        ) =>
      {
        exitCode =
          await execToJson(
            io,
            { target });
      });

  const add =
    cli.command('add')
    .description(
      'Create a requirement or an evidence and link it from a requirement');

  add.command('requirement')
    .description(
      'Create RQ<n> <name>.md next to the parent and link it from the parent')
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
      'The path of the new document, instead of RQ<n> <name>.md')
    .option(
      '--in <folder>',
      'The folder the next id is looked for in; the working directory by default')
    .action(
      async (
          parent: string,
          name: string,
          options: { statement?: string; path?: string; in?: string; }
        ) =>
      {
        exitCode =
          await execAdd(
            io,
            { kind: 'requirement',
              parent,
              name,
              body: options.statement,
              path: options.path,
              in: options.in });
      });

  add.command('evidence')
    .description(
      'Create evidence/EV<n> <name>.md next to the parent and link it from the parent')
    .argument(
      '<parent>',
      'The requirement it shows to hold')
    .argument(
      '<name>',
      'The name after the id')
    .option(
      '--description <text>',
      'What the evidence shows')
    .option(
      '--step <command>',
      'A command of its steps; repeat for several',
      collect,
      [ ])
    .option(
      '--path <file>',
      'The path of the new document, instead of evidence/EV<n> <name>.md')
    .option(
      '--in <folder>',
      'The folder the next id is looked for in; the working directory by default')
    .action(
      async (
          parent: string,
          name: string,
          options: {
          description?: string;
          step: string[];
          path?: string;
          in?: string;
        }
        ) =>
      {
        exitCode =
          await execAdd(
            io,
            { kind: 'evidence',
              parent,
              name,
              body: options.description,
              steps: options.step,
              path: options.path,
              in: options.in });
      });

  cli.command('link')
    .description(
      'Link an existing requirement or evidence from a requirement')
    .argument(
      '<parent>',
      'The requirement')
    .argument(
      '<child>',
      'The requirement or evidence that implements it')
    .action(
      async (
          parent: string,
          child: string
        ) =>
      {
        exitCode =
          await execLink(
            io,
            { parent,
              child });
      });

  cli.command('unlink')
    .description(
      'Remove the links from a requirement to a requirement or evidence')
    .argument(
      '<parent>',
      'The requirement')
    .argument(
      '<child>',
      'The requirement or evidence it links to')
    .action(
      async (
          parent: string,
          child: string
        ) =>
      {
        exitCode =
          await execUnlink(
            io,
            { parent,
              child });
      });

  cli.command('remove')
    .description(
      'Delete a requirement or an evidence and the links to it')
    .argument(
      '<file>',
      'A requirement or an evidence')
    .option(
      '--recursive',
      'Also delete what it links to that nothing else links to')
    .option(
      '--in <folder>',
      'The folder whose links to it are removed; the working directory by default')
    .action(
      async (
          file: string,
          options: { recursive?: boolean; in?: string; }
        ) =>
      {
        exitCode =
          await execRemove(
            io,
            { file,
              recursive: options.recursive,
              in: options.in });
      });

  cli.command('move')
    .description(
      'Move or rename a requirement or an evidence and rewrite the links to it')
    .argument(
      '<file>',
      'A requirement or an evidence')
    .argument(
      '<destination>',
      'The new path, or a folder to move it into')
    .option(
      '--in <folder>',
      'The folder whose links to it are rewritten; the working directory by default')
    .action(
      async (
          file: string,
          destination: string,
          options: { in?: string; }
        ) =>
      {
        exitCode =
          await execMove(
            io,
            { file,
              destination,
              in: options.in });
      });

  cli.command('log')
    .description(
      'Append an entry to the Log of an evidence')
    .argument(
      '<file>',
      'An evidence')
    .requiredOption(
      '--status <status>',
      'Passed or Failed')
    .option(
      '--note <text>',
      'A short note')
    .option(
      '--time <time>',
      'The time in ISO 8601; now by default')
    .action(
      async (
          file: string,
          options: { status: string; note?: string; time?: string; }
        ) =>
      {
        exitCode =
          await execLog(
            io,
            { file,
              status: options.status,
              note: options.note,
              time: options.time });
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

function collect(
    value: string,
    previous: string[]
  ): string[]
{
  return [ ...previous,
           value ];
}
