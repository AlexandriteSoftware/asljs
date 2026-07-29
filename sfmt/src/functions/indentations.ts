import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { type TSESLint }
  from '@typescript-eslint/utils';

export class Indentation
{
  readonly #indentation: string;

  public static readonly Initial = new Indentation('');

  constructor(
    indentation: string | number
  )
  {
    this.#indentation =
      typeof indentation === 'number'
      ? ' '.repeat(indentation)
      : indentation;
  }

  get value(): string {
    return this.#indentation;
  }

  get column(): number {
    return this.#indentation.length;
  }

  equals(
    other: Indentation
  ): boolean
  {
    return this.#indentation === other.#indentation;
  }

  increase(
    size: number = 1
  ): Indentation
  {
    return new Indentation(
      this.#indentation + '  '.repeat(size));
  }

  decrease(
    size: number = 1
  ): Indentation
  {
    if (
      this.#indentation.length
      < 2 * size
    ) {
      throw new Error(
        'Cannot decrease indentation below zero.');
    }

    return new Indentation(
      this.#indentation.slice(
        0,
        -2 * size));
  }
}

export function getIndentation(
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.Node | TSESTree.Token
  ): Indentation
{
  const nodeStartLine = node.loc.start.line;

  const line =
    sourceCode.lines[nodeStartLine - 1];

  const whitespace =
    getIndentationFromLine(line);

  const indentation =
    new Indentation(
      whitespace);

  return indentation;
}

export function getIndentationFromLine(
    line: string
  ): string
{
  for (
    let index = 0;
    index < line.length;
    index++
  ) {
    const char = line[index];

    if (char !== ' ') {
      return ' '.repeat(index);
    }
  }

  return line;
}
