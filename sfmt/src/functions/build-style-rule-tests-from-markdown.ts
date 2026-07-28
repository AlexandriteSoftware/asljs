import { ESLint }
  from 'eslint';
import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import test
  from 'node:test';
import { MarkdownTest }
  from './markdown-tests/markdown-test.js';
import { readMarkdownTestsFromFile }
  from './markdown-tests/read-markdown-tests-from-file.js';

export type TestFn = (
  name?: string | undefined,
  fn?: test.TestFn | undefined
) => Promise<void>;

/**
 * Reads a markdown file with test cases and sets up tests for each test case.
 *
 * When the test has a tag `focus`, only tests with that tag will be run.
 *
 * If test case has line endings with `\n`, an additional test case will be
 * added with `\r\n` line endings.
 */
export async function buildStyleRuleTestsFromMarkdown(
    filePath: string,
    eslint: ESLint,
    testFn?: TestFn
  ): Promise<void>
{
  if (!filePath.endsWith('.test.js')) {
    throw new Error(
      `Expected a test file path ending with .test.js`);
  }

  /** packageRootDir is a directory with package.json */
  const packageRootDir =
    await findPackageRootDir(
      filePath);

  /** buildDir is a directory with build artifacts (e.g. .js files) */
  const buildDir =
    path.join(
      packageRootDir,
      'build');

  if (!filePath.startsWith(buildDir)) {
    throw new Error(
      `Expected a test file in the build directory.`);
  }

  /** path from root to the compiled tests typescript file (`build/...`) */
  const relativeFilePath =
    path.relative(
      buildDir,
      filePath);

  /** path to the markdown test cases file, which is next to the tests file */
  const relativeTestsFilePath =
    relativeFilePath.replace(
      /\.test\.(js|ts)$/,
      '.md');

  const srcDir =
    path.join(
      packageRootDir,
      'src');

  /**
   * Markdown test cases file path in the `src` directory. Constructed by
   * replacing the `.../build` path with `.../src` and replacing the `.test.js`
   * extension with `.md`.
   */
  const testsFilePath =
    path.join(
      srcDir,
      relativeTestsFilePath);

  const testCases: MarkdownTest[] =
    await readMarkdownTestsFromFile(
      testsFilePath);

  const focusedTests =
    testCases.filter(
      item => item.tags.includes('focus'));

  const testsFileShortPath =
    relativeTestsFilePath.replace(
      /\.md$/,
      '');

  let testCasesToRun: MarkdownTest[];

  if (focusedTests.length > 0) {
    testCasesToRun = focusedTests;
  } else {
    testCasesToRun =
      addNoiseToTestCase(
        testCases);
  }

  const localTestFn =
    testFn
    ?? test;

  for (const testCase of testCasesToRun) {
    localTestFn(
      `${testsFileShortPath}: ${testCase.title}`,
      async () =>
      {
        const [result] =
          await eslint.lintText(
            testCase.source);

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

function addNoiseToTestCase(
    testCases: MarkdownTest[]
  ): MarkdownTest[]
{
  const result: MarkdownTest[] = [ ];

  for (const testCase of testCases) {
    result.push(testCase);

    testWithCrNl(
      testCase,
      result);
  }

  return result;
}

function testWithCrNl(
    testCase: MarkdownTest,
    result: MarkdownTest[]
  ): void
{
  const crNlSourceLineEnding =
    testCase.source.replace(
      /\r?\n/g,
      '\r\n');

  if (
    testCase.source
    === crNlSourceLineEnding
  ) {
    return;
  }

  const crNlLineEndingExpected =
    testCase.expected.replace(
      /\r?\n/g,
      '\r\n');

  const withDifferentLineEndings: MarkdownTest =
    { testSuite: testCase.testSuite,
      title:
        `${testCase.title} (with \\r\\n)`,
      source:
        crNlSourceLineEnding,
      expected:
        crNlLineEndingExpected,
      tags: testCase.tags };

  result.push(
    withDifferentLineEndings);
}

/**
 * Looks for a folder among ancestors with a package.json file.
 */
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
        fs.constants.F_OK);
    } catch (err) {
      const parentDir =
        path.dirname(dir);

      if (parentDir === dir) {
        throw new Error(
          `Could not find package.json in any parent directory of ${dir}`);
      }

      dir = parentDir;

      continue;
    }

    break;
  }

  return dir;
}
