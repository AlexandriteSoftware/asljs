import { type Context }
  from '../context.js';
import { type CopilotResponse }
  from '../copilot.js';
import { type Task }
  from '../task.js';
import { envelopeData }
  from '../tools/envelope.js';
import { type Envelope,
         type EnvelopeFile }
  from '../working-folder/envelope.js';

export interface EnvelopeProcessTaskParameters
{
}

export class EnvelopeProcessTask implements Task<CopilotResponse>
{
  constructor(
    readonly parameters: EnvelopeProcessTaskParameters = {}
  )
  {
  }

  async run(
    context: Context
  ): Promise<CopilotResponse>
  {
    context.logger.debug(
      'envelope-process: starting');

    const envelope =
      context.requireData<Envelope>(
        envelopeData);

    const response =
      await context.run(
        context.createTask<CopilotResponse>(
          'copilot',
          { prompt:
              buildPrompt(
                envelope) }));

    context.logger.debug(
      'envelope-process: done');

    return response;
  }
}

function buildPrompt(
    envelope: Envelope
  ): string
{
  const sections: string[] = [ ];

  if (envelope.instruction.trim().length > 0) {
    sections.push(
      'Instruction:',
      envelope.instruction);
  }

  if (
    envelope.task
    && envelope.task.trim().length > 0
  ) {
    sections.push(
      'Task:',
      envelope.task);
  }

  for (const file of envelope.files) {
    sections.push(
      formatFile(
        file));
  }

  return sections.join(
    '\n\n');
}

function formatFile(
    file: EnvelopeFile
  ): string
{
  const label =
    file.complete === false
      ? `File: ${file.path} (partial)`
      : `File: ${file.path}`;

  const body =
    file.type === 'text'
      ? file.content ?? ''
      : '(binary content omitted)';

  return [ label,
           '```',
           body,
           '```' ].join(
             '\n');
}
