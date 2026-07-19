import { Command }
  from 'commander';
import { EnvelopeContainer }
  from '../envelope/container.js';
import { Envelope,
         EnvelopeFile }
  from '../envelope/envelope.js';
import { resolveEnvelopePath }
  from './env.js';
import { ExecutionContext,
         MainOptions }
  from './types.js';

export function configureListCommand(
    program: Command,
    context: ExecutionContext
  ): void
{
  program
    .command(
      'list'
    )
    .description(
      'print a markdown table of envelope files'
    )
    .action(
      async () =>
      {
        const options =
          program.opts<{
          envelope?: string;
        }>();

        await listCmd(
          context,
          {
            envelopePath: resolveEnvelopePath(
              options.envelope
            )
          }
        );
      }
    );
}

async function listCmd(
    context: ExecutionContext,
    options: MainOptions = {}
  ): Promise<void>
{
  const envelopePath =
    resolveEnvelopePath(
      options.envelopePath);

  const envelopeContainer =
    new EnvelopeContainer(
    context.logger
  );

  const envelope =
    await envelopeContainer.loadEnvelope(
      envelopePath);

  for (
    const line of formatFileList(
      envelope
    )
      .trimEnd()
      .split(
        '\n'
      )
  ) {
    context.console.writeLine(
      line
    );
  }
}

export function formatFileList(
    envelope: Envelope
  ): string
{
  const lines =
    [
    '| Location | Complete | Type |',
    '| --- | --- | --- |',
    ...envelope.files
      .map(
        file =>
          `| ${
            escapeMarkdownTableCell(
              file.path
            )
          } | ${
            formatComplete(
              file
            )
          } | ${
            escapeMarkdownTableCell(
              file.type
            )
          } |`
      )
  ];

  return `${
    lines.join(
      '\n'
    )
  }\n`;
}

function formatComplete(
    file: EnvelopeFile
  ): string
{
  return file.complete === undefined
    ? ''
    : file.complete
    ? 'yes'
    : 'no';
}

function escapeMarkdownTableCell(
    value: string
  ): string
{
  return value
    .replace(
      /\\/g,
      '\\\\'
    )
    .replace(
      /\|/g,
      '\\|'
    )
    .replace(
      /\r?\n/g,
      ' '
    );
}
