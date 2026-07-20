import { AST,
         SourceCode }
  from 'eslint';
import * as ESTree
  from 'estree';
import { ensureLocation,
         WithLocation }
  from './functions/location.js';

export type ContextElement =
  | ESTree.Node
  | AST.Token
  | ESTree.Comment;

export class FormattingContext
{
  newLine: string;

  constructor(
    public readonly sourceCode: SourceCode
  )
  {
    this.sourceCode = sourceCode;

    this.newLine = sourceCode.text.includes('\r\n')
      ? '\r\n'
      : '\n';
  }

  next(
    token: ContextElement,
    predicate?: (token?: ContextElement) => boolean
  ): AST.Token & WithLocation | undefined
  {
    const nextNode =
      this.sourceCode.getTokenAfter(token);

    if (!nextNode) {
      return;
    }

    if (predicate) {
      if (!predicate(nextNode)) {
        return;
      }
    }

    ensureLocation(nextNode);

    return nextNode;
  }
}

function isPunctuator(
    token?: ContextElement,
    punctuation?: string
  ): boolean
{
  if (token === undefined) {
    return false;
  }

  if (token.type !== 'Punctuator') {
    return false;
  }

  if (punctuation === undefined) {
    return true;
  }

  if (token.value !== punctuation) {
    return false;
  }

  return true;
}

export class FormattingContextPredicates
{
  static isPunctuator(
    token?: ContextElement,
    punctuation?: string
  ): boolean
  {
    return isPunctuator(
      token,
      punctuation);
  }

  static isOpeningParenthesis(
    token?: ContextElement
  ): boolean
  {
    return isPunctuator(
      token,
      '(');
  }

  static isClosingParenthesis(
    token?: ContextElement
  ): boolean
  {
    return isPunctuator(
      token,
      ')');
  }
}
