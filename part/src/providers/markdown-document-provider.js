import { unified }
  from 'unified';
import remarkParse
  from 'remark-parse';
import { readFile }
  from 'node:fs/promises';
import { MarkdownDocument }
  from '../markdown-document.js';

const MARKDOWN_PARSER =
  unified().use(remarkParse);

export class MarkdownDocumentProvider
{
  /**
   * @param {string} content
   * @returns {MarkdownDocument}
   */
  parse(
    content)
  {
    const document =
      MARKDOWN_PARSER.parse(
        content);
        
    return new MarkdownDocument(
      content,
      document);
  }

  /**
   * @param {string} path
   * @returns {Promise<MarkdownDocument>}
   */
  async load(
    path)
  {
    const content =
      await readFile(
        path,
        'utf8');

    const document =
      this.parse(content);

    return document;
  }
}
