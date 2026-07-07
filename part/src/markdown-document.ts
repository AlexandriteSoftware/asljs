import { Root,
         Node,
         Heading,
         List }
  from 'mdast';

export class MarkdownDocument
{
  public content: string;
  public root: Root;

  constructor(
    content: string,
    root: Root)
  {
    this.content = content;
    this.root = root;
  }

  getSectionNode(
      sectionHeadingMarkup: string
    ): Heading | null
  {
    for (const node of this.root.children) {
      if (node.type !== 'heading') {
        continue;
      }

      const markup =
        this.getMarkup(
          node.children);

      if (markup !== sectionHeadingMarkup) {
        continue;
      }

      return node;
    }

    return null;
  }

  getSectionNodes(
      sectionHeadingMarkup: string
    ): Node[] | null
  {
    const sectionNodes: Node[] = [];

    let inSection = false;

    for (const node of this.root.children) {
      if (node.type === 'heading') {
        if (inSection) {
          // section has ended
          break;
        }

        const headingNode = node as Heading;

        const markup =
          this.getMarkup(
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

  getSectionPrimaryListItems(
      sectionHeadingMarkup: string
    ): Node[] | null
  {
    const sectionNodes =
      this.getSectionNodes(
        sectionHeadingMarkup);

    if (
      sectionNodes === null
      || sectionNodes.length === 0)
    {
      return null;
    }

    const firstListNode =
      sectionNodes.find(
        node =>
          node.type === 'list');

    if (!firstListNode) {
      return null;
    }

    const firstList =
      firstListNode as List;

    const listItems =
      firstList.children;

    return listItems;
  }

  getMarkup(
      node: Node | Node[]
    ): string
  {
    if (!node) {
      return '';
    }

    if (
      Array.isArray(node)
      && node.length === 0)
    {
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

    return this.content.slice(
      startOffset,
      endOffset);
  }

  getText(
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
            node =>
              this.getText(node))
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
            childNode =>
              this.getText(childNode))
          .join('');
      
      return text;
    }

    return '';
  }
}
