import {
  buildArtefactDefinitionReport,
  buildCheckReport,
  buildInventoryReport,
} from './inventory.js';

const HELP_TEXT = `Usage: part <command>

Commands:
  inventory            Scan the current folder and print artifact inventory
  artefactdefinition   List definitions and their locations
  check                Run rules for artefacts matching a pattern

Options:
  --definitions <path> Search definitions in the specified folder only
  --with-positives     Show passing and failing check rows
`;

export async function runCli(args, environment)
{
  const [command, ...rest] = args;

  if (!command || command === '--help' || command === '-h') {
    environment.stdout.write(`${HELP_TEXT}\n`);
    return 0;
  }

  const parsedCommand = command.toLowerCase();

  if (!isSupportedCommand(parsedCommand)) {
    environment.stderr.write(`Unknown command: ${command}\n`);
    environment.stderr.write(`${HELP_TEXT}\n`);
    return 1;
  }

  try {
    const options = parseOptions(rest);
    validateOptions(parsedCommand, options);
    const result = await buildReport(parsedCommand, environment.cwd, options);
    environment.stdout.write(`${result.report}\n`);
    return result.exitCode;
  }
  catch (error) {
    const message =
      error instanceof Error
      ? error.message
      : String(error);

    environment.stderr.write(`${message}\n`);
    return 1;
  }
}

function isSupportedCommand(command)
{
  return command === 'inventory'
         || command === 'artefactdefinition'
         || command === 'check';
}

function parseOptions(args)
{
  const options = {
    positionals: [],
  };

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];

    if (!current.startsWith('--')) {
      options.positionals.push(current);
      continue;
    }

    const parsedOption = parseLongOption(current, args[index + 1]);
    options[parsedOption.name] = parsedOption.value;

    if (parsedOption.consumesNextArgument) {
      index += 1;
    }
  }

  if (options.definitions === true) {
    throw new Error('Option --definitions requires a value.');
  }

  return options;
}

function validateOptions(command, options)
{
  const supportedOptionNames = getSupportedOptionNames(command);

  for (const optionName of Object.keys(options)) {
    if (optionName === 'positionals') {
      continue;
    }

    if (!supportedOptionNames.has(optionName)) {
      throw new Error(`Unknown option: --${optionName}`);
    }
  }
}

function getSupportedOptionNames(command)
{
  if (command === 'inventory' || command === 'artefactdefinition') {
    return new Set(['definitions']);
  }

  if (command === 'check') {
    return new Set(['definitions', 'rules', 'definitions-path', 'with-positives']);
  }

  return new Set();
}

function parseLongOption(current, next)
{
  const equalsIndex = current.indexOf('=');

  if (equalsIndex !== -1) {
    const name = current.slice(2, equalsIndex);
    const value = current.slice(equalsIndex + 1);

    if (!name) {
      throw new Error(`Invalid option: ${current}`);
    }

    return {
      name,
      value,
      consumesNextArgument: false,
    };
  }

  const name = current.slice(2);

  if (!name) {
    throw new Error(`Invalid option: ${current}`);
  }

  if (next && !next.startsWith('--')) {
    return {
      name,
      value: next,
      consumesNextArgument: true,
    };
  }

  return {
    name,
    value: true,
    consumesNextArgument: false,
  };
}

async function buildReport(command, cwd, options)
{
  if (command === 'artefactdefinition') {
    return {
      report: await buildArtefactDefinitionReport(cwd, {
        ...options,
        definitionTarget: options.positionals[0],
        definitionsPath: options.definitions,
      }),
      exitCode: 0,
    };
  }

  if (command === 'check') {
    const checkResult = await buildCheckReport(cwd, {
      ...options,
      pattern: options.positionals[0],
      definitionNames: splitCommaSeparatedOption(options.definitions),
      ruleNames: splitCommaSeparatedOption(options.rules),
      definitionsPath: options['definitions-path'],
      withPositives: options['with-positives'] === true,
    });

    return {
      report: checkResult.report,
      exitCode: checkResult.hasFailures
? 1
: 0,
    };
  }

  return {
    report: await buildInventoryReport(cwd, {
      ...options,
      definitionsPath: options.definitions,
    }),
    exitCode: 0,
  };
}

function splitCommaSeparatedOption(value)
{
  if (typeof value !== 'string' || value.trim() === '') {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}