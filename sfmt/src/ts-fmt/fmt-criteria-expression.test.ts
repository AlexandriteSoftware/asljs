import * as espree
  from 'espree';
import { Expression }
  from 'estree';
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { fileURLToPath }
  from 'node:url';
import { readMarkdownTestsFromFile }
  from '../functions/markdown-tests/read-markdown-tests-from-file.js';
import { fmtCriteriaExpression }
  from './fmt-criteria-expression.js';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

const TESTS_FILE_PATH =
  scriptFilePathToTestsFilePath(
    SCRIPT_FILE_PATH);

const testCases =
  await readMarkdownTestsFromFile(
    TESTS_FILE_PATH);

for (const testCase of testCases) {
  test(
    `fmt-criteria-expression: ${testCase.title}`,
    (): void =>
    {
      assert.strictEqual(
        format(
          testCase.source),
        testCase.expected);
    });
}

function scriptFilePathToTestsFilePath(
    scriptFilePath: string
  ): string
{
  return scriptFilePath
    .replace(
      `${path.sep}build${path.sep}`,
      `${path.sep}src${path.sep}`)
    .replace(
      /\.test\.js$/,
      '.md');
}

function format(
    code: string
  ): string
{
  const expression =
    parseExpression(
      code);

  return fmtCriteriaExpression(
    expression,
    { getText:
        (node: Expression): string =>
        getNodeText(
          code,
          node),
      newLine: '\n' });
}

function parseExpression(
    code: string
  ): Expression
{
  const ast =
    espree.parse(
      code,
      { ecmaVersion: 'latest',
        sourceType: 'module',
        range: true });

  const statement = ast.body[0];

  if (
    statement.type
    !== 'ExpressionStatement'
  ) {
    throw new Error(
      'Expected expression statement');
  }

  return statement.expression as Expression;
}

function getNodeText(
    code: string,
    node: Expression
  ): string
{
  const range =
    (node as Expression & { range?: [number, number]; }).range;

  if (!range) {
    throw new Error(
      'Expected range information');
  }

  return code.slice(
    range[0],
    range[1]);
}
