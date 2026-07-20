import { SourceCode }
  from 'eslint';

export type FormattingContext = { sourceCode: SourceCode; newLine: string; };

export function createFormattingContext(
    sourceCode: SourceCode
  ): FormattingContext
{
  const newLine =
    sourceCode.text.includes('\r\n')
    ? '\r\n'
    : '\n';

  return { sourceCode, newLine };
}
