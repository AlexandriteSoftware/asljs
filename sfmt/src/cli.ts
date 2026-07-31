import { Command }
  from 'commander';
import { readFileSync }
  from 'node:fs';
import { createEnvironment,
         Environment }
  from './environment.js';
import { format }
  from './format.js';

type PackageMetadata = {
  name: string;
  version: string;
  description: string;
  homepage: string;
  author: string;
  license: string;
};

const packageMetadata: PackageMetadata =
  JSON.parse(
    readFileSync(
      new URL(
        '../package.json',
        import.meta.url),
      'utf8')) as PackageMetadata;

export async function runCli(
    args: string[],
    environment: Environment | null = null
  ): Promise<number>
{
  const ownEnvironment = !environment;

  environment =
    environment
    ?? createEnvironment();

  const cli =
    createCli(environment);

  if (args.length === 0) {
    writeHelp(
      environment,
      cli,
      false);

    return 0;
  }

  try {
    await cli.parseAsync(
      args,
      { from: 'user' });

    return 0;
  } catch (error) {
    if (
      writeCommanderError(
        environment,
        error,
        cli)
    ) {
      return 1;
    }

    const message =
      error instanceof Error
      ? error.message
      : String(error);

    if (!message) {
      return 1;
    }

    environment.stderr.write(`${message}\n`);

    return 1;
  } finally {
    if (ownEnvironment) {
      await environment.dispose();
    }
  }
}

function createCli(
    environment: Environment
  ): Command
{
  const cli =
    new Command();

  cli
    .name('sfmt')
    .description(
      packageMetadata.description)
    .argument(
      '[pattern]',
      'Glob pattern of files to format')
    .allowExcessArguments(false)
    .helpCommand(false)
    .configureOutput(
      { writeOut:
          value => environment.stdout.write(value),
        writeErr:
          value => environment.stderr.write(value),
        outputError: () => { } })
    .exitOverride(
      (
          error
        ) =>
      {
        throw error;
      })
    .hook(
      'preAction',
      () =>
      {
        environment.onDispose(
          async (): Promise<void> => { });
      })
    .action(
      async (
          pattern?: string
        ): Promise<void> =>
      {
        const fnArgs =
          pattern === undefined
          ? [ ]
          : [ pattern ];

        await format(
          environment,
          ...fnArgs);
      });

  return cli;
}

function writeCommanderError(
    environment: Environment,
    error: any,
    cli: Command
  ): boolean
{
  if (!(error instanceof Error)) {
    return false;
  }

  const code =
    (error as Error & { code?: string; }).code;

  if (
    typeof code
    !== 'string'
  ) {
    return false;
  }

  if (
    code
    === 'commander.optionMissingArgument'
  ) {
    const optionName =
      tryExtractOptionName(
        error.message);

    const text =
      optionName
      ? `Option ${optionName} requires a value.`
      : 'Option requires a value.';

    environment.stderr.write(`${text}\n`);

    return true;
  }

  if (
    code
    === 'commander.unknownOption'
  ) {
    const optionName =
      tryExtractOptionName(
        error.message);

    const text =
      optionName
      ? `Unknown option: ${optionName}.`
      : 'Unknown option.';

    environment.stderr.write(`${text}\n`);

    return true;
  }

  if (
    code
    === 'commander.unknownCommand'
  ) {
    environment.stderr.write(
      `Unknown command.\n`);

    writeHelp(
      environment,
      cli,
      true);

    return true;
  }

  if (
    code
    === 'commander.help'
  ) {
    writeHelp(
      environment,
      cli,
      false);

    return true;
  }

  return false;
}

function tryExtractOptionName(
    message: string
  ): string | null
{
  const match =
    /'(--[^ <']+)/.exec(message);

  if (
    !match
    || match.length < 2
  ) {
    return null;
  }

  const group = match[1];

  if (!group) {
    return null;
  }

  const trimmed =
    group.trim();

  if (trimmed === '') {
    return null;
  }

  return trimmed;
}

function writeHelp(
    environment: Environment,
    cli: Command,
    isError: boolean
  ): void
{
  const output =
    createHelpPreface()
    + cli.helpInformation();

  if (isError) {
    environment.stderr.write(output);
  } else {
    environment.stdout.write(output);
  }
}

function createHelpPreface(
  ): string
{
  let preface =
    `${packageMetadata.name} ${packageMetadata.version}\n`;

  preface
    += `${packageMetadata.homepage}\n\n`;

  return preface;
}