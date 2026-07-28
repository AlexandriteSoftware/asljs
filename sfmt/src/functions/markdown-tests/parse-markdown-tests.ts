import { marked,
         Tokens }
  from 'marked';
import { type MarkdownTest }
  from './markdown-test.js';

export interface MarkdownTestParsingContext
{
  path: string;
}

export function parseMarkdownTests(
    markdown: string,
    context?: MarkdownTestParsingContext
  ): MarkdownTest[]
{
  const tokens =
    marked.lexer(markdown);

  let inTests = false;

  const tests: MarkdownTest[] = [ ];

  for (
    let index = 0;
    index < tokens.length;
    index++
  ) {
    const token = tokens[index];

    if (token.type === 'heading') {
      if (
        token.depth === 2
        && token.text === 'Tests'
      ) {
        inTests = true;
        continue;
      }

      if (
        inTests
        && token.depth <= 2
      ) {
        break;
      }
    }

    if (
      !inTests
      || token.type !== 'code'
    ) {
      continue;
    }

    const code =
      token as Tokens.Code;

    const tags =
      (code.lang ?? '').split(/\s+/);

    const parts =
      code.text.split(
        /\r?\n\/\/ ---\r?\n/g);

    const source = parts[0];
    const expected = parts[1];

    const test: MarkdownTest =
      { source,
        expected,
        tags };

    const sourceJson =
      JSON.stringify(source);

    let title = '';

    const limit = 40;

    if (sourceJson.length > limit) {
      const excerpt =
        sourceJson.slice(
          0,
          limit);

      title = excerpt + '...';
    } else {
      title = sourceJson;
    }

    test.title = title;

    const testFilePath = context?.path;

    if (testFilePath) {
      test.testSuite =
        testFilePath.split(/[\\/]/).pop()
        ?? '';
    }

    tests.push(test);
  }

  return tests;
}
