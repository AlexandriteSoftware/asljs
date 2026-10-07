import path
  from 'node:path';
import { getListItemsAsText,
         getLists,
         getSections,
         Section }
  from '../markdown-document-queries.js';
import { DiagramDirection,
         DiagramDocument,
         DiagramEdgeDirection,
         DiagramEdgeProperty,
         DiagramEdgeStyle,
         DiagramGrouping,
         DiagramTarget }
  from '../model/diagram-document.js';
import { MarkdownDocument }
  from '../model/markdown-document.js';
import { MarkdownDocumentProvider }
  from '../providers/markdown-document-provider.js';

const EDGE_STYLES: readonly DiagramEdgeStyle[] =
  [ 'solid',
    'dotted',
    'thick',
    'invisible' ];

const EDGE_DIRECTIONS: readonly DiagramEdgeDirection[] =
  [ 'forward',
    'reverse' ];

const DIRECTIONS: readonly DiagramDirection[] =
  [ 'TD',
    'LR',
    'BT',
    'RL' ];

const GROUPINGS: readonly DiagramGrouping[] =
  [ 'none',
    'folder' ];

/**
 * Reads a diagram document. Errors name the document and the section.
 */
export async function readDiagramDocument(
    markdownDocumentProvider: MarkdownDocumentProvider,
    documentPath: string,
    projectPath: string
  ): Promise<DiagramDocument>
{
  return parseDiagramDocument(
    await markdownDocumentProvider.load(
      documentPath),
    documentPath,
    projectPath);
}

/**
 * A relative `Target` path starts from the document's folder; one starting
 * with `/` from the project root.
 */
export function parseDiagramDocument(
    document: MarkdownDocument,
    documentPath: string,
    projectPath: string
  ): DiagramDocument
{
  const sections =
    getSections(
      document);

  const fail =
    (
        message: string
      ): never =>
    {
    throw new Error(
      `${documentPath}: ${message}`);
  };

  const title =
    sections.find(
      section => section.level === 1);

  if (!title) {
    fail(
      'the level 1 heading, the diagram name, is missing.');
  }

  const findSection =
    (heading: string): Section | undefined =>
    sections.find(
      section =>
        section.level === 2
        && section.heading === heading);

  const nodesSection =
    findSection('Nodes');

  if (!nodesSection) {
    fail(
      'the "Nodes" section is missing.');
  }

  const nodeSettings =
    readSettings(
      document,
      nodesSection!,
      [ 'Definitions',
        'Label',
        'Exclude' ],
      fail);

  const definitions =
    splitList(
      nodeSettings.get('Definitions'));

  if (definitions.length === 0) {
    fail(
      '"Nodes" needs "Definitions".');
  }

  const edges =
    readEdges(
      document,
      sections,
      fail);

  const rootSection =
    findSection('Root');

  let root: DiagramDocument['root'] = null;

  if (rootSection) {
    const rootSettings =
      readSettings(
        document,
        rootSection,
        [ 'Artefacts',
          'Follow',
          'Depth' ],
        fail);

    const artefacts =
      splitList(
        rootSettings.get('Artefacts'));

    if (artefacts.length === 0) {
      fail(
        '"Root" needs "Artefacts".');
    }

    const follow =
      rootSettings.has('Follow')
      ? splitList(
        rootSettings.get('Follow'))
      : edges.map(
        edge => edge.name);

    for (const name of follow) {
      if (
        !edges.some(
          edge => edge.name === name)
      ) {
        fail(
          `"Root" follows "${name}", which is not a section under "Edges".`);
      }
    }

    const depthText =
      rootSettings.get('Depth');

    const depth =
      depthText === undefined
      ? null
      : Number(depthText);

    if (
      depth !== null
      && (!Number.isInteger(depth)
          || depth < 0)
    ) {
      fail(
        `"Depth" must be a whole number, but was "${depthText}".`);
    }

    root =
      { artefacts,
        follow,
        depth };
  }

  const layoutSection =
    findSection('Layout');

  const layoutSettings =
    layoutSection
    ? readSettings(
      document,
      layoutSection,
      [ 'Direction',
        'Group' ],
      fail)
    : new Map<string, string>();

  const outputSection =
    findSection('Output');

  const target =
    outputSection
    ? readSettings(
      document,
      outputSection,
      [ 'Target' ],
      fail).get('Target')
    : undefined;

  return { path: documentPath,
           name: title!.heading,
           nodes:
             { definitions,
               label:
                 nodeSettings.get('Label') ?? null,
               exclude:
                 splitList(
                   nodeSettings.get('Exclude')) },
           root,
           edges,
           layout:
             { direction:
                 readChoice(
                   layoutSettings.get('Direction'),
                   DIRECTIONS,
                   'TD',
                   '"Direction"',
                   fail),
               group:
                 readChoice(
                   layoutSettings.get('Group'),
                   GROUPINGS,
                   'none',
                   '"Group"',
                   fail) },
           target:
             target === undefined
      ? null
      : parseTarget(
        target,
        documentPath,
        projectPath,
        fail) };
}

function parseTarget(
    value: string,
    documentPath: string,
    projectPath: string,
    fail: (message: string) => never
  ): DiagramTarget
{
  const hashIndex =
    value.indexOf('#');

  const filePart =
    (hashIndex < 0
    ? value
    : value.slice(
      0,
      hashIndex)).trim();

  const targetPath =
    filePart === ''
    ? documentPath
    : filePart.startsWith('/')
    ? path.join(
      projectPath,
      filePart.slice(1))
    : path.resolve(
      path.dirname(documentPath),
      filePart);

  const extension =
    path.extname(targetPath).toLowerCase();

  if (hashIndex >= 0) {
    const heading =
      value.slice(hashIndex + 1).trim();

    if (
      heading === ''
      || extension !== '.md'
    ) {
      fail(
        `"Target" "${value}" must name a heading of a markdown document, e.g. "Overview.md#Diagram".`);
    }

    return { kind: 'markdown',
             path: targetPath,
             heading };
  }

  if (extension === '.mmd') {
    return { kind: 'mermaid',
             path: targetPath };
  }

  if (extension === '.svg') {
    return { kind: 'svg',
             path: targetPath };
  }

  return fail(
    `"Target" "${value}" must be a .mmd or .svg file, or a markdown document and heading, e.g. "Overview.md#Diagram".`);
}

function readEdges(
    document: MarkdownDocument,
    sections: Section[],
    fail: (message: string) => never
  ): DiagramEdgeProperty[]
{
  const edgesIndex =
    sections.findIndex(
      section =>
      section.level === 2
      && section.heading === 'Edges');

  if (edgesIndex < 0) {
    return [ ];
  }

  const edges: DiagramEdgeProperty[] = [ ];

  for (
    let index = edgesIndex + 1;
    index < sections.length
    && sections[index].level > 2;
    index++
  ) {
    const section = sections[index];

    if (section.level !== 3) {
      continue;
    }

    const name = section.heading;

    if (
      edges.some(
        edge => edge.name === name)
    ) {
      fail(
        `the edge property "${name}" is listed twice.`);
    }

    const separatorIndex =
      name.lastIndexOf('.');

    const settings =
      readSettings(
        document,
        section,
        [ 'Style',
          'Label',
          'Direction' ],
        fail);

    edges.push(
      { name,
        definition:
          separatorIndex < 0
          ? null
          : name.slice(
            0,
            separatorIndex),
        property:
          name.slice(separatorIndex + 1),
        style:
          readChoice(
            settings.get('Style'),
            EDGE_STYLES,
            'solid',
            `"Style" of "${name}"`,
            fail),
        label:
          settings.get('Label') ?? null,
        direction:
          readChoice(
            settings.get('Direction'),
            EDGE_DIRECTIONS,
            'forward',
            `"Direction" of "${name}"`,
            fail) });
  }

  return edges;
}

/**
 * The `- Key: value` items of the section's lists. Unknown keys are errors,
 * so a misspelt setting is not silently ignored.
 */
function readSettings(
    document: MarkdownDocument,
    section: Section,
    keys: string[],
    fail: (message: string) => never
  ): Map<string, string>
{
  const settings = new Map<string, string>();

  for (
    const list of getLists(
      section.content.nodes)
  ) {
    for (
      const item of getListItemsAsText(
        document,
        list)
    ) {
      const match =
        /^([^:]+):(.*)$/s.exec(
          item.trim());

      const key = match?.[1].trim() ?? '';

      if (!keys.includes(key)) {
        fail(
          `"${section.heading}" has an unknown setting "${item.trim()}"; expected ${
            keys.map(
              item => `"${item}"`).join(', ')
          }.`);
      }

      settings.set(
        key,
        match![2]
          .replaceAll(
            '`',
            '')
          .trim());
    }
  }

  return settings;
}

function readChoice<T extends string>(
    value: string | undefined,
    choices: readonly T[],
    fallback: T,
    name: string,
    fail: (message: string) => never
  ): T
{
  if (value === undefined) {
    return fallback;
  }

  const choice =
    choices.find(
      item => item.toLowerCase() === value.toLowerCase());

  if (!choice) {
    fail(
      `${name} must be one of ${choices.join(', ')}, but was "${value}".`);
  }

  return choice!;
}

function splitList(
    value: string | undefined
  ): string[]
{
  return (value ?? '')
    .split(',')
    .map(
      item => item.trim())
    .filter(
      item => item !== '');
}
