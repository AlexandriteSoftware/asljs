import { readFile }
  from 'node:fs/promises';
import remarkParse
  from 'remark-parse';
import { unified }
  from 'unified';
import { Logger }
  from '../logging/logging.js';
import { MarkdownDocument }
  from '../model/markdown-document.js';

const MARKDOWN_PARSER =
  unified().use(remarkParse);

export class MarkdownDocumentProvider
{
  constructor(
    private readonly logger: Logger
  )
  {
  }

  parse(
    content: string
  ): MarkdownDocument
  {
    const document =
      MARKDOWN_PARSER.parse(
        content);

    const markdownDocument: MarkdownDocument =
      { content,
        root: document };

    return markdownDocument;
  }

  async load(
    path: string
  ): Promise<MarkdownDocument>
  {
    this.logger.trace(
      'load(...) { %s }',
      path);

    let content =
      await readFile(
        path,
        'utf8');

    if (content.startsWith('\uFEFF')) {
      content = content.slice(1);
    }

    const document =
      this.parse(content);

    return document;
  }
}
