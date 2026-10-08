import { readFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { parseLogEntry }
  from './document.js';
import { resolveUrl }
  from './edit.js';
import { display,
         loadGraph,
         RqGraph,
         RqNode }
  from './graph.js';
import { Io }
  from './io.js';
import { getSection,
         MarkdownNode,
         parseMarkdown,
         plainText }
  from './markdown.js';

/**
 * Checks the structure of the graph of a requirement file or folder without
 * running anything: the graph errors, and in each document its heading, its
 * links or steps, its `## Implementation` list and its `## Log`. Returns the
 * exit code.
 */
export async function execCheck(
    io: Io,
    options: { target: string; }
  ): Promise<number>
{
  const graph =
    await loadGraph(
      path.resolve(
        io.cwd,
        options.target));

  const problems =
    [ ...graph.errors ];

  for (const node of graph.nodes.values()) {
    for (
      const problem of checkDocument(
        node,
        await readFile(
          node.path,
          'utf8'))
    ) {
      problems.push(
        `${
          display(
            graph,
            node.path)
        }: ${problem}`);
    }
  }

  for (const problem of problems) {
    io.stdout.write(
      `Error  ${problem}\n`);
  }

  if (problems.length > 0) {
    return 1;
  }

  io.stdout.write(
    `OK  ${countLabel(graph)}\n`);

  return 0;
}

/**
 * The structure problems of one document.
 */
export function checkDocument(
    node: RqNode,
    text: string
  ): string[]
{
  const problems: string[] = [ ];

  const root =
    parseMarkdown(text);

  if (node.title === null) {
    problems.push(
      'no level 1 heading.');
  }

  if (
    node.kind === 'requirement'
    && node.links.length === 0
  ) {
    problems.push(
      'links to no requirement or evidence.');
  }

  if (
    node.kind === 'evidence'
    && node.steps.length === 0
  ) {
    problems.push(
      'the Steps section has no commands.');
  }

  const definitions = new Map<string, string>();

  const collectDefinitions =
    (
        item: MarkdownNode
      ): void =>
    {
    if (item.type === 'definition') {
      definitions.set(
        item.identifier,
        item.url);
    }

    if ('children' in item) {
      item.children.forEach(collectDefinitions);
    }
  };

  collectDefinitions(root);

  for (
    const item of listItems(
      getSection(
        root,
        'Implementation'),
      () =>
        problems.push(
          'the Implementation section holds more than a list.'))
  ) {
    if (
      !linksToMarkdown(
        node.path,
        item,
        definitions)
    ) {
      problems.push(
        `the Implementation item "${
          plainText(item).trim()
        }" links to no requirement or evidence.`);
    }
  }

  for (
    const item of listItems(
      getSection(
        root,
        'Log'),
      () =>
        problems.push(
          'the Log section holds more than a list.'))
  ) {
    const text =
      plainText(item).trim();

    if (
      parseLogEntry(text)
      === null
    ) {
      problems.push(
        `the log entry "${text}" is not "<time> Passed|Failed[ - <note>]".`);
    }
  }

  if (
    node.kind === 'requirement'
    && node.log.length > 0
  ) {
    problems.push(
      'a requirement has a Log section; only evidence is run.');
  }

  return problems;
}

function listItems(
    section: MarkdownNode[] | null,
    onOther: () => void
  ): MarkdownNode[]
{
  const items: MarkdownNode[] = [ ];
  let reported = false;

  for (const node of section ?? [ ]) {
    if (node.type === 'list') {
      items.push(...node.children);
    } else if (
      node.type !== 'definition'
      && !reported
    ) {
      reported = true;
      onOther();
    }
  }

  return items;
}

function linksToMarkdown(
    file: string,
    node: MarkdownNode,
    definitions: ReadonlyMap<string, string>
  ): boolean
{
  const url =
    node.type === 'link'
    ? node.url
    : node.type === 'linkReference'
    ? definitions.get(node.identifier)
    : undefined;

  if (url !== undefined) {
    return resolveUrl(
      file,
      url)
      ?.path.toLowerCase().endsWith('.md')
      === true;
  }

  return 'children' in node
    && node.children.some(
      child =>
        linksToMarkdown(
          file,
          child,
          definitions));
}

function countLabel(
    graph: RqGraph
  ): string
{
  const nodes =
    [ ...graph.nodes.values() ];

  const evidence =
    nodes.filter(
      node => node.kind === 'evidence')
    .length;

  return `${nodes.length - evidence} requirements, ${evidence} evidence`;
}
