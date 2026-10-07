import { Logger }
  from 'asljs-logging';
import { Code }
  from 'mdast';
import { mkdir,
         readFile,
         writeFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { buildDiagram }
  from '../diagram/diagram-builder.js';
import { readDiagramDocument }
  from '../diagram/diagram-document-reader.js';
import { renderMermaidToSvg }
  from '../diagram/mermaid-svg.js';
import { toMermaid }
  from '../diagram/mermaid.js';
import { Environment }
  from '../environment.js';
import { getSections,
         Section }
  from '../markdown-document-queries.js';
import { DiagramTarget }
  from '../model/diagram-document.js';
import { MarkdownDocument }
  from '../model/markdown-document.js';
import { MarkdownDocumentProvider }
  from '../providers/markdown-document-provider.js';

interface DiagramCommandOptions
{
  /**
   * Path of the diagram document, relative to the working directory.
   */
  document: string;

  format?: string;

  stdout?: boolean;

  check?: boolean;
}

type MarkdownTarget = Extract<DiagramTarget, { kind: 'markdown'; }>;

/**
 * Builds the diagram a diagram document describes and saves it to the
 * document's `Target`, or prints it when there is no target or `stdout` is
 * set. `check` reports a target that is not current instead of saving it.
 */
export async function execDiagram(
    logger: Logger,
    environment: Environment,
    options: DiagramCommandOptions
  ): Promise<void>
{
  if (
    options.stdout
    && options.check
  ) {
    throw new Error(
      '--stdout and --check cannot be used together.');
  }

  const documentPath =
    path.resolve(
      environment.cwd,
      options.document);

  const providers =
    environment.getProviders();

  const diagramDocument =
    await readDiagramDocument(
      providers.markdownDocumentProvider,
      documentPath,
      environment.project);

  const target =
    options.stdout
    ? null
    : diagramDocument.target;

  if (
    target !== null
    && options.format !== undefined
  ) {
    throw new Error(
      '--format applies to printing; the Target decides the format it is saved in. Add --stdout to print.');
  }

  if (
    options.check
    && target === null
  ) {
    throw new Error(
      `${
        display(
          environment,
          documentPath)
      }: --check needs a Target in the "Output" section.`);
  }

  if (
    options.check
    && target?.kind === 'svg'
  ) {
    throw new Error(
      '--check cannot compare an SVG target.');
  }

  const diagram =
    await buildDiagram(
      logger,
      providers,
      diagramDocument);

  const mermaid =
    toMermaid(diagram);

  if (target === null) {
    const format =
      getDiagramFormat(
        options.format);

    environment.stdout.write(
      format === 'svg'
        ? `${await renderMermaidToSvg(mermaid)}\n`
        : `${mermaid}\n`);

    return;
  }

  if (options.check) {
    if (
      !await isTargetCurrent(
        providers.markdownDocumentProvider,
        target,
        mermaid)
    ) {
      environment.stderr.write(
        `${
          display(
            environment,
            target.path)
        }: the diagram is not current; run part diagram "${
          display(
            environment,
            documentPath)
        }".\n`);

      environment.exitCode = 1;
    }

    return;
  }

  await writeTarget(
    providers.markdownDocumentProvider,
    target,
    mermaid);
}

function display(
    environment: Environment,
    filePath: string
  ): string
{
  return path.relative(
    environment.cwd,
    filePath);
}

function getDiagramFormat(
    format: string | undefined
  ): 'mermaid' | 'svg'
{
  const normalised =
    (format ?? 'mermaid').trim();

  if (
    normalised === ''
    || normalised === 'mermaid'
  ) {
    return 'mermaid';
  }

  if (normalised === 'svg') {
    return 'svg';
  }

  throw new Error(
    `Unknown diagram format: ${format}`);
}

async function readTextOrNull(
    filePath: string
  ): Promise<string | null>
{
  try {
    return await readFile(
      filePath,
      'utf8');
  } catch {
    return null;
  }
}

async function isTargetCurrent(
    markdownDocumentProvider: MarkdownDocumentProvider,
    target: DiagramTarget,
    mermaid: string
  ): Promise<boolean>
{
  if (target.kind === 'markdown') {
    const document =
      await markdownDocumentProvider.load(
        target.path);

    return findBlock(
      document,
      target)
      ?.value.trim() === mermaid;
  }

  return await readTextOrNull(target.path) === `${mermaid}\n`;
}

/**
 * Saves the diagram. A file is written only when its content changes.
 */
async function writeTarget(
    markdownDocumentProvider: MarkdownDocumentProvider,
    target: DiagramTarget,
    mermaid: string
  ): Promise<void>
{
  let current: string | null;
  let content: string;

  if (target.kind === 'markdown') {
    const document =
      await markdownDocumentProvider.load(
        target.path);

    current = document.content;

    content =
      replaceBlock(
        document,
        target,
        mermaid);
  } else {
    current =
      await readTextOrNull(
        target.path);

    content =
      target.kind === 'svg'
      ? `${await renderMermaidToSvg(mermaid)}\n`
      : `${mermaid}\n`;
  }

  if (content === current) {
    return;
  }

  await mkdir(
    path.dirname(target.path),
    { recursive: true });

  await writeFile(
    target.path,
    content,
    'utf8');
}

/**
 * The first section whose heading, at any level, is the target heading; an
 * error when the document has none.
 */
function findSection(
    document: MarkdownDocument,
    target: MarkdownTarget
  ): Section
{
  const section =
    getSections(document).find(
      item =>
      item.level > 0
      && item.heading === target.heading);

  if (!section) {
    throw new Error(
      `${target.path}: the Target heading "${target.heading}" is not in the document.`);
  }

  return section;
}

/**
 * The first `mermaid` code block of the target section.
 */
function findBlock(
    document: MarkdownDocument,
    target: MarkdownTarget
  ): Code | null
{
  const node =
    findSection(
      document,
      target)
    .content.nodes.find(
      item =>
        item.type === 'code'
        && (item as Code).lang === 'mermaid');

  return node
    ? node as Code
    : null;
}

/**
 * The document with the Mermaid text in the first `mermaid` block of the
 * target section, or in a block added at the end of the section.
 */
function replaceBlock(
    document: MarkdownDocument,
    target: MarkdownTarget,
    mermaid: string
  ): string
{
  const content = document.content;

  const fenced =
    `\`\`\`mermaid\n${mermaid}\n\`\`\``;

  const block =
    findBlock(
      document,
      target);

  if (block) {
    return content.slice(
      0,
      block.position!.start.offset)
      + fenced
      + content.slice(
        block.position!.end.offset);
  }

  const section =
    findSection(
      document,
      target);

  const offset =
    section.nodes[section.nodes.length - 1].position!.end.offset!;

  return `${
    content.slice(
      0,
      offset)
  }\n\n${fenced}${content.slice(offset)}`;
}
