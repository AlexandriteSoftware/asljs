import { Command }
  from 'commander';
import { loadEnvelope,
         saveEnvelope }
  from '../model/envelope.js';
import { type Read,
         read }
  from '../commands/read.js';
import { ensureEnvelopeFile,
         resolveEnvelopePath }
  from './env.js';
import { type MainOptions }
  from './types.js';

export function configureUpdateCommand(
    program: Command
  ): void
{
  program
    .command(
      'update')
    .description(
      'refresh envelope files using their update commands')
    .action(
      async () => {
        const options =
          program.opts<{
            envelope?: string;
          }>();

        await updateCmd(
          { envelopePath:
              resolveEnvelopePath(
                options.envelope) });
      });
}

async function updateCmd(
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

  await updateEnvelopeFiles(
    envelope);

  await saveEnvelope(
    envelope,
    envelopePath);
}

export async function updateEnvelopeFiles(
    envelope: Awaited<ReturnType<typeof loadEnvelope>>
  ): Promise<void>
{
  const updateCommands =
    envelope.files
      .map(
        file =>
          file.update)
      .filter(
        (command): command is Read =>
          command !== undefined);

  for (const command of updateCommands) {
    await read(
      envelope,
      command);
  }
}
