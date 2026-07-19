import { SourceCode }
  from 'eslint';
import { WithLocation }
  from './location.js';

export function getIndentation(
    sourceCode: SourceCode,
    node: WithLocation
  ): string
{
  return getIndentationFromLine(
    sourceCode.lines[node.loc.start.line - 1]
  );
}

export function getIndentationFromLine(
    line: string
  ): string
{
  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}
