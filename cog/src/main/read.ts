import { Command }
  from 'commander';
import { loadEnvelope,
         saveEnvelope }
  from '../model/envelope.js';
import { read }
  from '../commands/read.js';
import { ensureEnvelopeFile,
         resolveEnvelopePath }
  from './env.js';
import { type ExecutionContext,
         type MainOptions }
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
        ) => {
        const options =
          program.opts<{
            envelope?: string;
          }>();

        await readCmd(
          context,
          path,
          readOptions,
          { envelopePath:
              resolveEnvelopePath(
                options.envelope) });
      });
}

async function readCmd(
    context: ExecutionContext,
    pattern: string,
    readOptions: ReadCliOptions,
    options: MainOptions = {}
  ): Promise<void>
{
  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  await ensureEnvelopeFile(
    envelopePath);

  const envelope =
    await loadEnvelope(
      envelopePath);

  await read(
    envelope,
    { command: 'read',
      pattern,
      exclude:
        readOptions.exclude ?? [],
      lines:
        parsePositiveInteger(
          readOptions.lines,
          'lines'),
      sizeKb:
        parsePositiveInteger(
          readOptions.sizeKb,
          'sizeKb'),
      readToEnd:
        readOptions.readToEnd ?? false,
      withBinaryB64:
        readOptions.withBinaryB64 ?? false },
    undefined,
    context);

  await saveEnvelope(
    envelope,
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

  if (!Number.isInteger(
      parsed)
      || parsed <= 0
      || parsed.toString() !== value) {
    throw new Error(
      `${name} must be a positive integer`);
  }

  return parsed;
}
