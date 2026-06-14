import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { readFile }
  from 'node:fs/promises';
import { marked }
  from 'marked';

export async function addRuleTestsFromMarkdown(
  filePath,
  eslint)
{
  const testCases =
    await extractTests(filePath);

  for (const testCase of testCases) {
    test(
      `markdown example: ${testCase.source}`,
      async () => {
        const [ result ] =
          await eslint.lintText(testCase.source);

        if (testCase.source === testCase.expected) {
          assert.strictEqual(
            result.output,
            undefined);
        } else {
          assert.strictEqual(
            result.output,
            testCase.expected);
        }
      });
  }
}

export async function extractTests(
  filePath)
{
  const markdown =
    await readFile(
      filePath,
      'utf8');
  
  const tokens =
    marked.lexer(markdown);

  let inTests = false;
  const tests = [];

  for (let index = 0;
       index < tokens.length;
       index++)
  {
    const token =
      tokens[index];

    if (token.type === 'heading') {
      if (token.depth === 2
          && token.text === 'Tests')
      {
        inTests = true;
        continue;
      }

      if (inTests
          && token.depth <= 2)
      {
        break;
      }
    }

    if (!inTests) {
      continue;
    }

    if (token.type === 'code'
        && token.lang === 'js')
    {
      const code =
        tokens[index];

      const parts =
        code.text.split(
          /\r?\n\/\/ ---\r?\n/g);

      tests.push(
        { source: parts[0],
          expected: parts[1] });

      index++;
    }
  }

  return tests;
}