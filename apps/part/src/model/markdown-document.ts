import { Root }
  from 'mdast';

/**
 * Markdown document.
 */
export interface MarkdownDocument
{
  /**
   * Markdown document content.
   */
  content: string;

  /**
   * Markdown document root node.
   */
  root: Root;
}
