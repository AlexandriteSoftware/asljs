import { Environment }
  from '../environment.js';
import { EntryKind,
         listEntries }
  from '../files.js';
import { resolveOutputFormat,
         writeJson,
         writeLines }
  from '../output.js';

export interface ListCommandOptions
{
  pattern?: string;
  kind?: string;
  hidden?: boolean;
  format?: string;
}

export async function execList(
    environment: Environment,
    options: ListCommandOptions = {}
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const entries =
    await listEntries(
      environment.library,
      { pattern: options.pattern,
        kind:
          toKind(options.kind),
        hidden: options.hidden === true });

  if (format === 'json') {
    writeJson(
      environment,
      entries);

    return;
  }

  writeLines(
    environment,
    entries.map(
      entry =>
      entry.kind === 'folder'
        ? `${entry.path}/`
        : entry.path));
}

function toKind(
    value: unknown
  ): EntryKind | 'any'
{
  if (
    typeof value
    !== 'string'
    || value.trim() === ''
  ) {
    return 'any';
  }

  const kind =
    value.trim().toLowerCase();

  if (
    kind === 'file'
    || kind === 'folder'
    || kind === 'any'
  ) {
    return kind;
  }

  throw new Error(
    `Unknown entry kind: ${value.trim()}. Use file, folder or any.`);
}
