import { ExtractedCodeBlock,
         ExtractedHeading,
         ExtractedLink,
         ExtractedTable,
         ExtractedTask }
  from '../extract.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface ExtractCommandOptions
{
  path: string;
  kind: string;
  format?: string;
}

/**
 * Extract structured data from a markdown document. JSON is the default
 * output, because the result is structured data.
 */
export async function execExtract(
    context: CommandContext,
    options: ExtractCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(
      options.format,
      'json');

  const data =
    await context.client.call(
      'kb_extract',
      { path: options.path,
        kind: options.kind });

  writeResult(
    context.environment,
    format,
    data,
    describe(
      options.kind,
      data));
}

function describe(
    kind: string,
    data: unknown
  ): string[]
{
  if (kind === 'all') {
    return describeAll(
      data as Record<string, unknown>);
  }

  if (kind === 'front-matter') {
    return describeFrontMatter(data);
  }

  if (kind === 'headings') {
    return (data as ExtractedHeading[]).map(describeHeading);
  }

  if (kind === 'links') {
    return (data as ExtractedLink[]).map(describeLink);
  }

  if (kind === 'tasks') {
    return (data as ExtractedTask[]).map(describeTask);
  }

  if (kind === 'tables') {
    return (data as ExtractedTable[]).map(describeTable);
  }

  return (data as ExtractedCodeBlock[]).map(describeCode);
}

function describeAll(
    data: Record<string, unknown>
  ): string[]
{
  return [ ...describe(
    'front-matter',
    data.frontMatter),
           ...describe(
             'headings',
             data.headings),
           ...describe(
             'links',
             data.links),
           ...describe(
             'tasks',
             data.tasks),
           ...describe(
             'tables',
             data.tables),
           ...describe(
             'code',
             data.code) ];
}

function describeFrontMatter(
    data: unknown
  ): string[]
{
  if (
    data === null
    || typeof data
       !== 'object'
  ) {
    return [ ];
  }

  const lines: string[] = [ ];

  for (const [ key, value ] of Object.entries(data)) {
    lines.push(
      `${key}: ${asText(value)}`);
  }

  return lines;
}

function describeHeading(
    heading: ExtractedHeading
  ): string
{
  return `${'#'.repeat(heading.level)} ${heading.text} (line ${
    heading.line})`;
}

function describeLink(
    link: ExtractedLink
  ): string
{
  return `${link.kind} ${link.target}${suffix(link.text)} (line ${
    link.line})`;
}

function describeTask(
    task: ExtractedTask
  ): string
{
  return `[${mark(task.checked)}] ${task.text} (line ${task.line})`;
}

function describeTable(
    table: ExtractedTable
  ): string
{
  return `table ${table.headers.length} column(s), ${
    table.rows.length} row(s) (line ${table.line})`;
}

function describeCode(
    code: ExtractedCodeBlock
  ): string
{
  return `${language(code.language)} ${
    code.value.split('\n').length} line(s) (line ${code.line})`;
}

function asText(
    value: unknown
  ): string
{
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
}

function suffix(
    text: string
  ): string
{
  if (text === '') {
    return '';
  }

  return ` - ${text}`;
}

function mark(
    checked: boolean
  ): string
{
  if (checked) {
    return 'x';
  }

  return ' ';
}

function language(
    value: string
  ): string
{
  if (value === '') {
    return 'code';
  }

  return value;
}
