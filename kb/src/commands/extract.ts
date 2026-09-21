import { Environment }
  from '../environment.js';
import { ExtractedCodeBlock,
         ExtractedHeading,
         ExtractedLink,
         ExtractedTable,
         ExtractedTask,
         ExtractionKind,
         extractData,
         toExtractionKind }
  from '../extract.js';
import { readTextFile }
  from '../files.js';
import { parseMarkdown }
  from '../markdown.js';
import { isMarkdown }
  from '../notes.js';
import { resolveOutputFormat,
         writeJson,
         writeLines }
  from '../output.js';

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
    environment: Environment,
    options: ExtractCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(
      options.format,
      'json');

  const kind =
    toExtractionKind(options.kind);

  if (!isMarkdown(options.path)) {
    throw new Error(
      `Extraction is only supported for markdown files: ${options.path}`);
  }

  const text =
    await readTextFile(
      environment.library,
      options.path);

  const document =
    parseMarkdown(
      text,
      options.path);

  const data =
    extractData(
      document,
      kind);

  if (format === 'json') {
    writeJson(
      environment,
      data);

    return;
  }

  writeLines(
    environment,
    renderText(
      kind,
      data));
}

function renderText(
    kind: ExtractionKind,
    data: unknown
  ): string[]
{
  if (kind === 'all') {
    const all =
      data as Record<string, unknown>;

    return [ ...renderText(
      'front-matter',
      all.frontMatter),
             ...renderText(
               'headings',
               all.headings),
             ...renderText(
               'links',
               all.links),
             ...renderText(
               'tasks',
               all.tasks),
             ...renderText(
               'tables',
               all.tables),
             ...renderText(
               'code',
               all.code) ];
  }

  if (kind === 'front-matter') {
    if (
      data === null
      || typeof data
         !== 'object'
    ) {
      return [ ];
    }

    return Object.entries(
      data as Record<string, unknown>)
      .map(
        ([ key, value ]) =>
        `${key}: ${
          Array.isArray(value)
            ? value.join(', ')
            : String(value)}`);
  }

  if (kind === 'headings') {
    return (data as ExtractedHeading[]).map(
      heading =>
      `${'#'.repeat(heading.level)} ${heading.text} (line ${heading.line})`);
  }

  if (kind === 'links') {
    return (data as ExtractedLink[]).map(
      link =>
      `${link.kind} ${link.target}${
        link.text === ''
          ? ''
          : ` - ${link.text}`} (line ${link.line})`);
  }

  if (kind === 'tasks') {
    return (data as ExtractedTask[]).map(
      task =>
      `[${
        task.checked
          ? 'x'
          : ' '}] ${task.text} (line ${task.line})`);
  }

  if (kind === 'tables') {
    return (data as ExtractedTable[]).map(
      table =>
      `table ${table.headers.length} column(s), ${
        table.rows.length} row(s) (line ${table.line})`);
  }

  return (data as ExtractedCodeBlock[]).map(
    code =>
    `${
      code.language === ''
        ? 'code'
        : code.language} ${
      code.value.split('\n').length} line(s) (line ${code.line})`);
}
