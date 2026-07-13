import { ESLint }
  from 'eslint';
import { marked,
         Tokens }
  from 'marked';
import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import test
  from 'node:test';
import { formatText }
  from '../format.js';
import { FormatterDefinition }
  from '../formatter.js';
import { jsStyleFormatters }
  from '../js-style-rules/style-rules.js';
import { tsStyleFormatters }
  from '../ts-style-rules/style-rules.js';

interface TestCase
{
  source: string;
  expected: string;
  tags: string[];
}

async function findPackageRootDir(
  dir: string
): Promise<string>
{
  while (true) {
    const packageJsonPath =
      path.join(
        dir,
        'package.json');

    try {
      await fs.access(
        packageJsonPath,
        fs.constants.F_OK
      );
    } catch (err) {
      const parentDir =
        path.dirname(dir);

      if (parentDir === dir) {
        throw new Error(
          `Could not find package.json in any parent directory of ${dir}`
        );
      }

      dir = parentDir;

      continue;
    }

    break;
  }

  return dir;
}

export async function addRuleTestsFromMarkdown(
  filePath: string,
  eslint: ESLint
): Promise<void>
{
  const packageRootDir =
    await findPackageRootDir(filePath);

  const buildDir =
    path.join(
      packageRootDir,
      'build');

  const relativeFilePath =
    path.relative(
      buildDir,
      filePath);

  const relativeTestsFilePath =
    relativeFilePath.replace(
      /\.test\.(js|ts)$/,
      '.md');

  const srcDir =
    path.join(
      packageRootDir,
      'src');

  const testsFilePath =
    path.join(
      srcDir,
      relativeTestsFilePath);

  const testCases =
    await extractTests(testsFilePath);

  const formatters =
    await loadFormattersForTests(
      relativeTestsFilePath);

  for (const testCase of testCases) {
    const sourceJson =
      JSON.stringify(
        testCase.source);

    const formattingFilePath =
      createFormattingFilePath(
        testsFilePath,
        testCase.tags);

    test(
      `${relativeTestsFilePath}: eslint: ${sourceJson}`,
      async () =>
      {
        const [result] =
          await eslint.lintText(
            testCase.source);

        if (testCase.source === testCase.expected) {
          assert.strictEqual(
            result.output,
            undefined
          );
        } else {
          assert.strictEqual(
            result.output,
            testCase.expected
          );
        }
      }
    );

    test(
      `${relativeTestsFilePath}: formatters: ${sourceJson}`,
      async () =>
      {
        const result =
          await formatText(
            formattingFilePath,
            testCase.source,
            formatters);

        const expected =
          await formatText(
            formattingFilePath,
            testCase.expected,
            formatters);

        assert.strictEqual(
          result,
          expected
        );
      }
    );
  }
}

export async function extractTests(
  filePath: string
): Promise<TestCase[]>
{
  const markdown =
    await fs.readFile(
      filePath,
      'utf8');

  const tokens =
    marked.lexer(markdown);

  let inTests = false;

  const tests: TestCase[] = [];

  for (let index = 0; index < tokens.length; index++) {
    const token =
      tokens[index];

    if (token.type === 'heading') {
      if (token.depth === 2 && token.text === 'Tests') {
        inTests = true;
        continue;
      }

      if (inTests && token.depth <= 2) {
        break;
      }
    }

    if (!inTests || token.type !== 'code') {
      continue;
    }

    const code =
      token as Tokens.Code;

    const tags =
      (code.lang ?? '').split(/\s+/);

    const parts =
      code.text.split(
        /\r?\n\/\/ ---\r?\n/g);

    tests.push(
      { source: parts[0], expected: parts[1], tags: tags });
  }

  const focusedTests =
    tests.filter(
      (testCase) =>
    testCase.tags.includes('focus'));

  if (focusedTests.length > 0) {
    return focusedTests;
  }

  return tests;
}

function createFormattingFilePath(
  testsFilePath: string,
  tags: string[]
): string
{
  const extension =
    getFormattingFileExtension(
      testsFilePath,
      tags);

  return path.join(
    path.dirname(testsFilePath),
    `formatter-test${extension}`
  );
}

function getFormattingFileExtension(
  testsFilePath: string,
  tags: string[]
): string
{
  const language =
    tags.find(
      (tag) => tag !== 'focus');

  if (language === 'ts' || language === 'typescript') {
    return '.ts';
  }

  if (language === 'js' || language === 'javascript') {
    return '.js';
  }

  if (
    testsFilePath.includes(
      `${path.sep}ts-style-rules${path.sep}`)
  ) {
    return '.ts';
  }

  return '.js';
}

async function loadFormattersForTests(
  relativeTestsFilePath: string
): Promise<FormatterDefinition[]>
{
  const normalisedRelativeTestsFilePath =
    relativeTestsFilePath.replace(
      /\\/g,
      '/');

  if (normalisedRelativeTestsFilePath === 'js-style-rules/style-rules.md') {
    return jsStyleFormatters;
  }

  if (normalisedRelativeTestsFilePath === 'ts-style-rules/style-rules.md') {
    return tsStyleFormatters;
  }

  const modulePath =
    `../${
    relativeTestsFilePath.replace(
      /\.md$/,
      '.js'
    )
  }`;

  const module =
    await import(modulePath);

  const formatters =
    Object.values(module).filter(
      isFormatterDefinition);

  if (formatters.length === 0) {
    throw new Error(
      `Could not find formatter definitions for ${relativeTestsFilePath}`
    );
  }

  return formatters;
}

function isFormatterDefinition(
  value: unknown
): value is FormatterDefinition
{
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate =
    value as Partial<FormatterDefinition>;

  return (
    typeof candidate.name === 'string'
    && typeof candidate.eslintRule === 'object'
    && candidate.eslintRule !== null
  );
}
