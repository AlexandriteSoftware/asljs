import { Command }
  from 'commander';
import { Context }
  from '../context.js';
import { type TaskDefinition,
         type TaskParameter,
         TaskRegistry }
  from '../task.js';
import { type Envelope }
  from '../working-folder/envelope.js';
import { WorkingFolder }
  from '../working-folder/working-folder.js';
import { resolveEnvelopePath }
  from './env.js';
import { ExecutionContext }
  from './types.js';

export function configureTaskCommands(
    program: Command,
    context: ExecutionContext,
    registry: TaskRegistry
  ): void
{
  const configured =
    new Set(
      program.commands
      .map(
        command => command.name()));

  for (const definition of registry.definitions()) {
    if (
      configured.has(
        definition.name)
    ) {
      continue;
    }

    const command =
      program
      .command(
        definition.name)
      .description(
        definition.description
          ?? `run the ${definition.name} task`);

    for (const parameter of definition.parameters ?? [ ]) {
      command.option(
        toOptionFlags(
          parameter),
        parameter.description
          ?? parameter.name);
    }

    command.action(
      async (
          options: Record<string, unknown>
        ) =>
      {
        const result =
          await runTask(
            context,
            definition,
            options,
            program.opts<{
            envelope?: string;
          }>());

        if (
          result !== undefined
          && result !== null
        ) {
          writeJson(
            context,
            result);
        }
      });
  }
}

async function runTask(
    context: ExecutionContext,
    definition: TaskDefinition,
    options: Record<string, unknown>,
    programOptions: { envelope?: string; }
  ): Promise<unknown>
{
  const parameters =
    buildParameters(
      definition,
      options);

  if (!definition.requiresEnvelope) {
    return await context.automation.run(
      context.automation.createTask(
        definition.name,
        parameters));
  }

  const envelopePath =
    resolveEnvelopePath(
      programOptions.envelope);

  const workingFolder =
    new WorkingFolder(
      context.logger);

  const loaded =
    await workingFolder.tryLoadEnvelope(
      envelopePath);

  const envelope =
    loaded
      && workingFolder.envelope
        !== null
    ? workingFolder.envelope
    : await workingFolder.initializeEnvelope();

  loadContext(
    context.automation,
    envelope);

  const result =
    await context.automation.run(
      context.automation.createTask(
        definition.name,
        parameters));

  saveContext(
    context.automation,
    envelope);

  await workingFolder.saveEnvelope(
    envelopePath);

  return result;
}

function loadContext(
    context: Context,
    envelope: Envelope
  ): void
{
  context.instruction =
    envelope.instruction;

  context.task = envelope.task;

  context.files.splice(
    0,
    context.files.length,
    ...envelope.files);
}

function saveContext(
    context: Context,
    envelope: Envelope
  ): void
{
  envelope.instruction = context.instruction;
  envelope.task = context.task;
  envelope.files = context.files;
}

function writeJson(
    context: ExecutionContext,
    value: unknown
  ): void
{
  for (
    const line of JSON.stringify(
      value,
      null,
      2)
      .split(
        '\n')
  ) {
    context.console.writeLine(
      line);
  }
}

function buildParameters(
    definition: TaskDefinition,
    options: Record<string, unknown>
  ): Record<string, unknown>
{
  const parameters: Record<string, unknown> = {};

  for (const parameter of definition.parameters ?? [ ]) {
    const value =
      options[parameter.name];

    if (value === undefined) {
      continue;
    }

    parameters[parameter.name] =
      parameter.type === 'number'
      ? parseNumber(
        parameter.name,
        value)
      : parameter.type === 'object[]'
      ? parseObjects(
        parameter.name,
        value)
      : value;
  }

  return parameters;
}

function toOptionFlags(
    parameter: TaskParameter
  ): string
{
  const flag =
    `--${
    toKebabCase(
      parameter.name)
  }`;

  if (parameter.type === 'boolean') {
    return flag;
  }

  return (
      parameter.type === 'string[]'
      || parameter.type === 'object[]'
    )
    ? `${flag} <value...>`
    : `${flag} <value>`;
}

function toKebabCase(
    name: string
  ): string
{
  return name.replace(
    /[A-Z]/g,
    letter => `-${letter.toLowerCase()}`);
}

function parseNumber(
    name: string,
    value: unknown
  ): number
{
  const parsed =
    Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `${name} must be a number`);
  }

  return parsed;
}

function parseObjects(
    name: string,
    value: unknown
  ): unknown[]
{
  if (!Array.isArray(value)) {
    throw new Error(
      `${name} must be an array`);
  }

  return value.map(
    (
        item
      ) =>
    {
      try {
        return JSON.parse(
          String(item)) as unknown;
      } catch {
        throw new Error(
          `${name} items must be JSON objects`);
      }
    });
}
