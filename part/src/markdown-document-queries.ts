import { Heading,
         Node,
         Root }
  from 'mdast';
import { MarkdownDocument }
  from './model/markdown-document.js';

export interface SectionContent
{
  nodes: Node[];
  markup: string;
}

export interface Section
{
  heading: string;
  level: number;
  nodes: Node[];
  markup: string;
  content: SectionContent;
}

export function getSections(
  document: MarkdownDocument
): Section[]
{
  const sections: Section[] = [];

  let currentSection: Section =
    {
    heading: '',
    level: 0,
    nodes: [],
    markup: '',
    content: { nodes: [], markup: '' }
  };

  sections.push(
    currentSection
  );

  for (const node of document.root.children) {
    if (node.type !== 'heading') {
      currentSection.nodes.push(node);
      currentSection.content.nodes.push(node);

      continue;
    }

    if (
      sections.length === 1
      && currentSection.level === 0
      && currentSection.nodes.length === 0
    ) {
      sections.pop();
    }

    if (sections.length > 0) {
      updateMarkupForSection(
        document,
        sections[sections.length - 1]
      );
    }

    const markup =
      getMarkup(
        document,
        node.children);

    const newSection: Section =
      {
      heading: markup,
      level: (node as Heading).depth,
      nodes: [node],
      markup: '',
      content: { nodes: [], markup: '' }
    };

    sections.push(newSection);

    currentSection = newSection;
  }

  if (sections.length > 0) {
    updateMarkupForSection(
      document,
      sections[sections.length - 1]
    );
  }

  return sections;

  function updateMarkupForSection(
    document: MarkdownDocument,
    section: Section
  ): void
  {
    const sectionMarkup =
      getMarkup(
        document,
        section.nodes);

    section.markup = sectionMarkup;

    const contentMarkup =
      getMarkup(
        document,
        section.content.nodes);

    section.content.markup = contentMarkup;
  }
}

export function getSectionNode(
  document: MarkdownDocument,
  sectionHeadingMarkup: string
): Heading | null
{
  for (const node of document.root.children) {
    if (node.type !== 'heading') {
      continue;
    }

    const markup =
      getMarkup(
        document,
        node.children);

    if (markup !== sectionHeadingMarkup) {
      continue;
    }

    return node;
  }

  return null;
}

/**
 * Returns section nodes for the given section heading markup. Returns null if
 * the section is not found.
 */
export function getSectionNodes(
  document: MarkdownDocument,
  sectionHeadingMarkup: string
): Node[] | null
{
  const sectionNodes: Node[] = [];

  let inSection = false;

  for (const node of document.root.children) {
    if (node.type === 'heading') {
      if (inSection) {
        // section has ended
        break;
      }

      const headingNode =
        node as Heading;

      const markup =
        getMarkup(
          document,
          headingNode.children);

      if (markup === sectionHeadingMarkup) {
        inSection = true;
        continue;
      }
    }

    if (inSection) {
      sectionNodes.push(node);
    }
  }

  if (sectionNodes.length === 0) {
    if (inSection) {
      // section was found but has no content
      return [];
    }

    // section not found
    return null;
  }

  return sectionNodes;
}

export function getMarkup(
  document: MarkdownDocument,
  node: Node | Node[]
): string
{
  if (!node) {
    return '';
  }

  if (
    Array.isArray(node)
    && node.length === 0
  ) {
    return '';
  }

  const firstNode =
    Array.isArray(node)
    ? node[0]
    : node;

  const lastNode =
    Array.isArray(node)
    ? node[node.length - 1]
    : node;

  const startOffset =
    firstNode.position?.start?.offset;

  if (typeof startOffset !== 'number') {
    return '';
  }

  const endOffset =
    lastNode.position?.end?.offset;

  if (typeof endOffset !== 'number') {
    return '';
  }

  return document.content.slice(
    startOffset,
    endOffset
  );
}

export function getText(
  document: MarkdownDocument,
  nodes: Node | Node[]
): string
{
  if (!nodes) {
    return '';
  }

  if (Array.isArray(nodes)) {
    const text =
      nodes
      .map(
        (node) =>
          getText(
            document,
            node
          )
      )
      .join('');

    return text;
  }

  const node =
    nodes as Node;

  const value =
    (node as any).value;

  if (typeof value === 'string') {
    return value;
  }

  const children =
    (node as any).children;

  if (Array.isArray(children)) {
    const text =
      children
      .map(
        (childNode) =>
          getText(
            document,
            childNode
          )
      )
      .join('');

    return text;
  }

  return '';
}
