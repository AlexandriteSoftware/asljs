import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { MarkdownTest }
  from './markdown-test.js';
import { readMarkdownTestsFromFile }
  from './read-markdown-tests-from-file.js';

test(
  'readMarkdownTestsFromFile: should parse test cases from markdown',
  async (): Promise<void> =>
  {
    await using tmpdir =
      new TmpDir();

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

    await tmpdir.writeText(
      'tests.md',
      markdown);

    const testCases =
      await readMarkdownTestsFromFile(
        tmpdir.resolve('tests.md'));

    const expected: MarkdownTest[] =
      [ { testSuite: 'tests.md',
          expected: 'true',
          source: 'true',
          tags:
            [ 'js' ],
          title: '"true"' } ];

    assert.deepEqual(
      testCases,
      expected);
  });
