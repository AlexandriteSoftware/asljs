import fs
  from 'node:fs/promises';
import { type MarkdownTest }
  from './markdown-test.js';
import { parseMarkdownTests }
  from './parse-markdown-tests.js';

export async function readMarkdownTestsFromFile(
    filePath: string
  ): Promise<MarkdownTest[]>
{
  const markdown =
    await fs.readFile(
      filePath,
      'utf8');

  const testCases =
    parseMarkdownTests(
      markdown,
      { path: filePath });

  return testCases;
}
