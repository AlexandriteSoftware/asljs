import { Command }
  from 'commander';
import { EnvelopeContainer }
  from '../envelope/container.js';
import { type ReadParameters,
         read }
  from '../commands/read.js';
import { resolveEnvelopePath }
  from './env.js';
import { type ExecutionContext,
         type MainOptions }
  from './types.js';
import { Envelope } from '../envelope/envelope.js';

export function configureUpdateCommand(
    program: Command,
    context: ExecutionContext
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
          context,
          { envelopePath:
              resolveEnvelopePath(
                options.envelope) });
      });
}

async function updateCmd(
    context: ExecutionContext,
    options: MainOptions = {}
  ): Promise<void>
{
  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  const envelopeContainer =
    new EnvelopeContainer(
      context.logger);

  const envelope =
    await envelopeContainer.loadEnvelope(
      envelopePath);

  await updateEnvelopeFiles(
    envelope,
    context);

  await envelopeContainer.saveEnvelope(
    envelopePath);
}

export async function updateEnvelopeFiles(
    envelope: Envelope,
    context?: ExecutionContext
  ): Promise<void>
{
  const updateCommands =
    envelope.files
      .map(
        file =>
          file.update)
      .filter(
        (command): command is ReadParameters =>
          command !== undefined);

  for (const command of updateCommands) {
    await read(
      envelope,
      command);

    context?.console.writeLine(
      `refreshed ${command.pattern}`);
  }
}
