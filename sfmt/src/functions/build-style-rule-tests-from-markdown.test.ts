import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { parseTests }
  from './build-style-rule-tests-from-markdown.js';

test(
  'parseTests: should parse test cases from markdown',
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
      parseTests(
        markdown);

    assert.deepEqual(
      testCases,
      [
        {
          expected: 'true',
          source: 'true',
          tags: ['js'],
          title: '"true"'
        }
      ]
    );
  }
);
