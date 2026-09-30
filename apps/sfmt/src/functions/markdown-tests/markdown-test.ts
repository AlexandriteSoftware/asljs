export interface MarkdownTest
{
  /**
   * The test suite. Created from file name.
   */
  testSuite?: string;

  /**
   * The test title. Created from the truncated linearised fenced code block
   * source.
   */
  title?: string;

  source: string;

  expected: string;

  /**
   * Test tags. Created from the fenced code block language specifier.
   */
  tags: string[];
}

export function getFocusedMarkdownTests(
    markdownTests: MarkdownTest[]
  ): MarkdownTest[]
{
  return markdownTests.filter(isFocused);
}

function isFocused(
    markdownTest: MarkdownTest
  ): boolean
{
  return markdownTest.tags.includes('focus');
}
