import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { MarkdownTest }
  from './markdown-test.js';
import { parseMarkdownTests }
  from './parse-markdown-tests.js';

test(
  'parseMarkdownTests: should parse test cases from markdown',
  (): void =>
  {
    const markdown =
      `
# Test Cases

## Tests

\`\`\`js
true
// ---
true
\`\`\`
`;

    const testCases =
      parseMarkdownTests(
        markdown);

    const expected: MarkdownTest[] =
      [ { expected: 'true',
          source: 'true',
          tags:
            [ 'js' ],
          title: '"true"' } ];

    assert.deepEqual(
      testCases,
      expected);
  });

test(
  'parseMarkdownTests: should parse focused tests from markdown',
  (): void =>
  {
    const markdown =
      `
# Test Cases

## Tests

\`\`\`ts focused
true
// ---
true
\`\`\`
`;

    const testCases =
      parseMarkdownTests(
        markdown);

    const expected: MarkdownTest[] =
      [ { expected: 'true',
          source: 'true',
          tags:
            [ 'ts',
              'focused' ],
          title: '"true"' } ];

    assert.deepEqual(
      testCases,
      expected);
  });

test(
  'parseMarkdownTests: should parse test suite from markdown',
  (): void =>
  {
    const markdown =
      `
# Test Cases

## Tests

\`\`\`ts focused
true
// ---
true
\`\`\`
`;

    const testCases =
      parseMarkdownTests(
        markdown,
        { path: 'test-suite.md' });

    const expected: MarkdownTest[] =
      [ { expected: 'true',
          source: 'true',
          tags:
            [ 'ts',
              'focused' ],
          testSuite: 'test-suite.md',
          title: '"true"' } ];

    assert.deepEqual(
      testCases,
      expected);
  });
