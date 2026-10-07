import { Logger }
  from 'asljs-logging';
import { Code }
  from 'mdast';
import { writeFile }
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
import { getSections }
  from '../markdown-document-queries.js';
import { MarkdownDocument }
  from '../model/markdown-document.js';

interface DiagramCommandOptions
{
  /**
   * Path of the diagram document, relative to the working directory.
   */
  document: string;

  format?: string;

  write?: boolean;

  check?: boolean;
}

const DIAGRAM_SECTION = 'Diagram';

/**
 * Builds the diagram a diagram document describes. Prints Mermaid text or
 * SVG, writes the text into the document's `## Diagram` section, or checks
 * that the section is current.
 */
export async function execDiagram(
    logger: Logger,
    environment: Environment,
    options: DiagramCommandOptions
  ): Promise<void>
{
  const format =
    getDiagramFormat(
      options.format);

  if (
    options.write
    && options.check
  ) {
    throw new Error(
      '--write and --check cannot be used together.');
  }

  if (
    format === 'svg'
    && (options.write
        || options.check)
  ) {
    throw new Error(
      '--write and --check work with Mermaid text, not --format=svg.');
  }

  const documentPath =
    path.resolve(
      environment.cwd,
      options.document);

  const providers =
    environment.getProviders();

  const { diagram: diagramDocument, document } =
    await readDiagramDocument(
      providers.markdownDocumentProvider,
      documentPath);

  const diagram =
    await buildDiagram(
      logger,
      providers,
      diagramDocument);

  const mermaid =
    toMermaid(diagram);

  const displayPath =
    path.relative(
      environment.cwd,
      documentPath);

  if (options.check) {
    const block =
      findDiagramBlock(document);

    if (
      block?.node.value.trim()
      !== mermaid
    ) {
      environment.stderr.write(
        `${displayPath}: the diagram is not current; run part diagram "${displayPath}" --write.\n`);

      environment.exitCode = 1;
    }

    return;
  }

  if (options.write) {
    const content =
      replaceDiagramBlock(
        document,
        mermaid);

    if (content !== document.content) {
      await writeFile(
        documentPath,
        content,
        'utf8');
    }

    return;
  }

  if (format === 'svg') {
    environment.stdout.write(
      `${await renderMermaidToSvg(mermaid)}\n`);

    return;
  }

  environment.stdout.write(
    `${mermaid}\n`);
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

/**
 * The first `mermaid` code block of the `## Diagram` section.
 */
function findDiagramBlock(
    document: MarkdownDocument
  ): { node: Code; } | null
{
  const section =
    getSections(document).find(
      item =>
      item.level === 2
      && item.heading === DIAGRAM_SECTION);

  const node =
    section?.content.nodes.find(
      item =>
      item.type === 'code'
      && (item as Code).lang === 'mermaid');

  return node
    ? { node:
          node as Code }
    : null;
}

/**
 * The document with the Mermaid text in the first `mermaid` block of the
 * `## Diagram` section. A missing block is added at the end of the section,
 * and a missing section at the end of the document.
 */
function replaceDiagramBlock(
    document: MarkdownDocument,
    mermaid: string
  ): string
{
  const content = document.content;

  const fenced =
    `\`\`\`mermaid\n${mermaid}\n\`\`\``;

  const block =
    findDiagramBlock(document);

  if (block) {
    return content.slice(
      0,
      block.node.position!.start.offset)
      + fenced
      + content.slice(
        block.node.position!.end.offset);
  }

  const section =
    getSections(document).find(
      item =>
      item.level === 2
      && item.heading === DIAGRAM_SECTION);

  if (section) {
    const last =
      section.nodes[section.nodes.length - 1];

    const offset =
      last.position!.end.offset!;

    return `${
      content.slice(
        0,
        offset)
    }\n\n${fenced}${content.slice(offset)}`;
  }

  return `${content.trimEnd()}\n\n## ${DIAGRAM_SECTION}\n\n${fenced}\n`;
}
