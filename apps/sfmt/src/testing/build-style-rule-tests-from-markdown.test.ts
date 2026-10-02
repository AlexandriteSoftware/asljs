import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { buildStyleRuleTestsFromMarkdown }
  from './build-style-rule-tests-from-markdown.js';

test(
  'buildStyleRuleTestsFromMarkdown: should parse test cases from markdown',
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
      'src/tests.md',
      markdown);

    await tmpdir.writeText(
      'package.json',
      '{}');

    const tests: string[] = [ ];

    await buildStyleRuleTestsFromMarkdown(
      tmpdir.resolve(
        'build/tests.test.js'),
      { lintText:
          async (): Promise<any> => ({}) } as any,
      test);

    assert.deepEqual(
      tests,
      [ 'tests: "true"' ]);

    function test(
        name?: string | undefined,
        fn?: test.TestFn | undefined
      ): Promise<void>
    {
      tests.push(
        name
          ?? '');

      return Promise.resolve();
    }
  });
