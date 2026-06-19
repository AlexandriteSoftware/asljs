/**
 * @typedef
 *   { import('mdast')
 *       .Root }
 *   Root
 * @typedef
 *   { import('mdast')
 *       .RootContent }
 *   RootContent
 * @typedef
 *   { import('mdast')
 *       .Node }
 *   Node
 * @typedef
 *   { import('mdast')
 *       .Heading }
 *   Heading
 * @typedef
 *   { import('mdast')
 *       .List }
 *   List
 */

export class MarkdownDocument
{
  /**
   * @param {string} content
   * @param {Root} root
   */
  constructor(
    content,
    root)
  {
    this.content = content;
    this.root = root;
  }

  /**
   * @param {string} sectionHeadingMarkup 
   * @returns {Heading|null}
   */
  getSectionNode(
    sectionHeadingMarkup)
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

  /**
   * @param {string} sectionHeadingMarkup 
   * @returns {Node[]|null}
   */
  getSectionNodes(
    sectionHeadingMarkup)
  {
    /** @type {Node[]} */
    const sectionNodes = [];

    let inSection = false;

    for (const node of this.root.children) {
      if (node.type === 'heading') {
        if (inSection) {
          // section has ended
          break;
        }

        const headingNode = /** @type {Heading} */ (node);

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

  /**
   * @param {string} sectionHeadingMarkup 
   * @returns {Node[]|null}
   */
  getSectionPrimaryListItems(
    sectionHeadingMarkup)
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
      /** @type {List} */ (firstListNode);

    const listItems =
      firstList.children;

    return listItems;
  }

  /**
   * @param {Node|Node[]} node 
   * @returns {string}
   */
  getMarkup(
    node)
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

  /**
   * @param {Node|Node[]} nodes
   * @returns {string}
   */
  getText(
    nodes)
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
      /** @type {Node} */ (nodes);

    const value =
      (/** @type {any} */ (node)).value;

    if (typeof value === 'string') {
      return value;
    }

    const children =
      (/** @type {any} */ (node)).children;

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
