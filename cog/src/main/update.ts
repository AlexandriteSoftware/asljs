import { Command }
  from 'commander';
import { read,
         ReadParameters }
  from '../commands/read.js';
import { envelopeData }
  from '../tools/envelope.js';
import { Envelope }
  from '../working-folder/envelope.js';
import { WorkingFolder }
  from '../working-folder/working-folder.js';
import { resolveEnvelopePath }
  from './env.js';
import { ExecutionContext,
         MainOptions }
  from './types.js';

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
      async () =>
      {
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
    new WorkingFolder(
      context.logger);

  const envelope =
    await envelopeContainer.loadEnvelope(
      envelopePath);

  context.automation.setData(
    envelopeData,
    envelope);

  await context.automation.run(
    context.automation.createTask(
      'envelope-update-files'));

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
      file => file.update)
    .filter(
      (command): command is ReadParameters => command !== undefined);

  for (const command of updateCommands) {
    await read(
      envelope,
      command);

    context?.console.writeLine(
      `refreshed ${command.pattern}`);
  }
}
