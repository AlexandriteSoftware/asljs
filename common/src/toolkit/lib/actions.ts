import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { PKG_COMMON_DIR }
  from '../api.js';

export interface CommandDoc {
  actionKey: string;
  actionSummary: string;
  helpText: string;
}

export async function getCommandDocs(
  ): Promise<CommandDoc[]>
{
  const content =
    await fs.readFile(
      getToolkitDocsPath(),
        'utf8');

  return parseToolkitDocs(content);
}

export function getActionHelpText(
    commandDocs: CommandDoc[]
  ): string
{
  return commandDocs
    .map(
      commandDoc => [
        `${commandDoc.actionKey}: ${commandDoc.actionSummary}`,
        commandDoc.helpText,
      ].join('\n'))
    .join('\n\n');
}

export function parseToolkitDocs(
    markdownText: string
  ): CommandDoc[]
{
  const normalizedText =
    markdownText.replace(
      /\r\n/g,
      '\n');

  const lines =
    normalizedText.split('\n');

  if (lines[0]?.trim() !== '# toolkit') {
    throw new Error(
      'toolkit.md must start with "# toolkit".');
  }

  const commands = [];

  let lineIndex = 1;

  while (lineIndex < lines.length) {
    while (lineIndex < lines.length
           && lines[lineIndex].trim() === '')
    {
      lineIndex += 1;
    }

    if (lineIndex >= lines.length) {
      break;
    }

    const headingLine =
      lines[lineIndex];

    if (!headingLine.startsWith('## ')) {
      throw new Error(
        `toolkit.md expected a command heading at line ${lineIndex + 1}.`);
    }

    const actionKey =
      headingLine.slice(3).trim();

    lineIndex += 1;

    while (lineIndex < lines.length
           && lines[lineIndex].trim() === '')
    {
      lineIndex += 1;
    }

    const summaryLine =
      lines[lineIndex] ?? '';

    if (!summaryLine.startsWith('> ')) {
      throw new Error(
        `toolkit.md expected a blockquote summary for "${actionKey}".`);
    }

    const actionSummary =
      summaryLine.slice(2).trim();

    lineIndex += 1;

    while (lineIndex < lines.length
           && lines[lineIndex].trim() === '')
    {
      lineIndex += 1;
    }

    const helpLines = [];

    while (lineIndex < lines.length
           && !lines[lineIndex].startsWith('## '))
    {
      helpLines.push(
        lines[lineIndex]);

      lineIndex += 1;
    }

    const helpText =
      normalizeHelpText(
        helpLines.join('\n'));

    if (helpText === '') {
      throw new Error(
        `toolkit.md expected help text for "${actionKey}".`);
    }

    commands.push(
      { actionKey,
        actionSummary,
        helpText });
  }

  return commands;
}

function normalizeHelpText(
    text: string
  ): string
{
  return text
    .trim()
    .replace(
      /\r\n/g,
      '\n');
}

function getToolkitDocsPath(
  ): string
{
  return path.join(
    PKG_COMMON_DIR,
    'docs',
    'toolkit.md');
}
