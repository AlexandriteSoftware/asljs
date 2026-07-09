import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { unified }
  from 'unified';
import remarkParse
  from 'remark-parse';
import { createPinoLoggerProvider }
  from './logging/pino.js';
import { MarkdownDocument }
  from './model/markdown-document.js';
import { getMarkup,
         getSections }
  from './markdown-document-queries.js';

const loggerProvider =
  createPinoLoggerProvider();

const MARKDOWN_PARSER =
  unified().use(remarkParse);

test.after(
  () => {
    loggerProvider.dispose();
  });

test(
  'getMarkup returns markup from a markdown document #1',
  async () => {
    const document =
      parse(
        `# Heading 1`);

    const markup =
      getMarkup(
        document,
        document.root.children[0]);

    assert.equal(
      markup,
      '# Heading 1');
  });

test(
  'getMarkup returns markup from a markdown document #2',
  async () => {
    const document =
      parse(
        `# Heading 1

test`);

    const markup =
      getMarkup(
        document,
        document.root.children[1]);

    assert.equal(
      markup,
      'test');
  });

test(
  'getMarkup returns markup from a markdown document #3',
  async () => {
    const content =
      `# Heading 1

test`;

    const document =
      parse(content);

    const markup =
      getMarkup(
        document,
        document.root.children);

    assert.equal(
      markup,
      content);
  });


test(
  'getSections returns sections from a markdown document #1',
  async () => {
    const content =
      `# Heading 1`;

    const document =
      parse(
        content);

    const sections =
      getSections(
        document);

    assert.equal(
      sections[0].heading,
      'Heading 1');

    assert.equal(
      sections[0].level,
      1);

    assert.equal(
      sections[0].markup,
      content);
  });

test(
  'getSections returns sections from a markdown document #2',
  async () => {
    const content =
      `# Heading 1

text`;

    const document =
      parse(
        content);

    const sections =
      getSections(
        document);

    assert.equal(
      sections[0].heading,
      'Heading 1');

    assert.equal(
      sections[0].level,
      1);

    assert.equal(
      sections[0].markup,
      content);
  });


function parse(
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
