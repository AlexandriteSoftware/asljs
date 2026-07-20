import { Command }
  from 'commander';
import { read,
         ReadParameters }
  from '../commands/read.js';
import { EnvelopeContainer }
  from '../envelope/container.js';
import { Envelope }
  from '../envelope/envelope.js';
import { resolveEnvelopePath }
  from './env.js';
import { ExecutionContext,
         MainOptions }
  from './types.js';

interface ReadCliOptions
{
  lines?: string;
  sizeKb?: string;
  readToEnd?: boolean;
  withBinaryB64?: boolean;
  exclude?: string[];
}

export function configureReadCommand(
    program: Command,
    context: ExecutionContext
  ): void
{
  program
    .command(
      'read')
    .argument(
      '<path>')
    .description(
      'read files into the envelope')
    .option(
      '--lines <N>',
      'if file is a text file, only read first N lines',
      '150')
    .option(
      '--sizeKb <M>',
      'if file is a text file, only read first M kilobytes',
      '15')
    .option(
      '--read-to-end',
      'if file is a text file, read to the end',
      false)
    .option(
      '--with-binary-b64',
      'if file is a binary file, read it as base64',
      false)
    .option(
      '--exclude <path>',
      'file, folder, or glob pattern to exclude',
      collect,
      [])
    .action(
      async (
        path: string,
        readOptions: ReadCliOptions
      ) =>
      {
        const options =
          program.opts<{
          envelope?: string;
        }>();

        await readCmd(
          context,
          path,
          readOptions,
          {
            envelopePath: resolveEnvelopePath(
              options.envelope)
          });
      });
}

async function readCmd(
    context: ExecutionContext,
    pattern: string,
    readOptions: ReadCliOptions,
    options: MainOptions = {}
  ): Promise<void>
{
  const logger =
    context.logger.scope(
      { instanceId: 'readCmd()' });

  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  const normalisedPattern =
    normaliseGlobPattern(
      pattern);

  const normalisedExcludes =
    readOptions.exclude?.map(
      normaliseGlobPattern);

  const envelopeContainer =
    new EnvelopeContainer(
    context.logger
  );

  const envelopeLoaded =
    await envelopeContainer.tryLoadEnvelope(
      envelopePath);

  let envelope: Envelope;

  if (
    envelopeLoaded
    && envelopeContainer.envelope !== null
  ) {
    envelope = envelopeContainer.envelope;
  } else {
    envelope = await envelopeContainer.initializeEnvelope();
  }

  const parameters: ReadParameters =
    {
    command: 'read',
    pattern: normalisedPattern,
    exclude: normalisedExcludes ?? [],
    lines: parsePositiveInteger(
      readOptions.lines,
      'lines'),
    sizeKb: parsePositiveInteger(
      readOptions.sizeKb,
      'sizeKb'),
    readToEnd: readOptions.readToEnd ?? false,
    withBinaryB64: readOptions.withBinaryB64 ?? false
  };

  logger.trace(
    'calling read() with parameters: %o',
    parameters);

  await read(
    envelope,
    parameters,
    undefined,
    context);

  await envelopeContainer.saveEnvelope(
    envelopePath);
}

function collect(
    value: string,
    values: string[]
  ): string[]
{
  return [
    ...values,
    value
  ];
}

function parsePositiveInteger(
    value: string | undefined,
    name: string
  ): number
{
  const parsed =
    Number.parseInt(
      value ?? '',
      10);

  if (
    !Number.isInteger(
      parsed)
    || parsed <= 0
    || parsed.toString() !== value
  ) {
    throw new Error(
      `${name} must be a positive integer`
    );
  }

  return parsed;
}

function normaliseGlobPattern(
    pattern: string
  ): string
{
  return pattern.replace(
    /\\/g,
    '/');
}
