import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { type TSESLint }
  from '@typescript-eslint/utils';
import { FormatterDefinitionFactory,
         RuleListenerFactory,
         tsFormatterFactory }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { Logger }
  from '../logging.js';
import { fmtForStatement }
  from '../ts-fmt/fmt-for-statement.js';

const messages: Record<string, string> =
  { 'use-asljs-for-statement-style':
      'Use asljs for statement style.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'for-statement',
    listenerFactory,
    messages);

export default formatterDefinitionFactory;

function listenerFactory(
    logger: Logger
  ): RuleListenerFactory
{
  const listenerFactory: RuleListenerFactory =
    (
    context: TSESLint.RuleContext<string, readonly unknown[]>
  ): TSESLint.RuleListener =>
  {
    const ruleListener: TSESLint.RuleListener =
      { ForStatement: listener };

    return ruleListener;

    function listener(
        node: TSESTree.ForStatement
      ): void
    {
      processForStatement(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processForStatement(
    logger: Logger,
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.ForStatement
  ): void
{
  const fmtCtx =
    new FormattingContext(
      context.sourceCode,
      logger);

  const correctLayout =
    checkLayout(
      node,
      fmtCtx);

  if (correctLayout) {
    return;
  }

  context.report(
    { node: node,
      messageId:
        'use-asljs-for-statement-style',
      fix:
        (
        fixer: TSESLint.RuleFixer
      ): TSESLint.RuleFix =>
      {
        const replacement =
          fmtForStatement(
            node,
            fmtCtx);

        return fixer.replaceText(
          node,
          replacement);
      } });
}

function checkLayout(
    node: TSESTree.ForStatement,
    context: FormattingContext
  ): boolean
{
  const sourceCode = context.sourceCode;

  const forToken =
    sourceCode.getFirstToken(
      node);

  const openingParen =
    sourceCode.getTokenAfter(
      asTokenTarget(
        forToken),
      token => token.value === '(');

  const firstSemicolon =
    getFirstSemicolon(
      node,
      sourceCode,
      openingParen);

  const secondSemicolon =
    getSecondSemicolon(
      node,
      sourceCode,
      firstSemicolon);

  const closingParen =
    sourceCode.getTokenBefore(
      asTokenTarget(
        node.body),
      token => token.value === ')');

  if (
    forToken === null
    || openingParen
       === null
    || firstSemicolon
       === null
    || secondSemicolon
       === null
    || closingParen
       === null
  ) {
    return true;
  }

  const forTokenLocation = forToken?.loc;

  const openingParenLocation = openingParen?.loc;

  const firstSemicolonLocation = firstSemicolon?.loc;

  const secondSemicolonLocation =
    secondSemicolon?.loc;

  const closingParenLocation = closingParen?.loc;

  if (
    !forTokenLocation
    || !openingParenLocation
    || !firstSemicolonLocation
    || !secondSemicolonLocation
    || !closingParenLocation
  ) {
    return true;
  }

  if (
    forTokenLocation.start.line
    !== openingParenLocation.start.line
  ) {
    return false;
  }

  const baseIndentation =
    getIndentation(
      sourceCode,
      node);

  const clauseIndentation =
    baseIndentation.increase();

  if (
    !checkClause(
      node.init ?? null,
      openingParenLocation.end.line,
      firstSemicolonLocation.start.line,
      clauseIndentation.column)
  ) {
    return false;
  }

  if (
    !checkClause(
      node.test ?? null,
      firstSemicolonLocation.end.line,
      secondSemicolonLocation.start.line,
      clauseIndentation.column)
  ) {
    return false;
  }

  if (
    !checkUpdateClause(
      node.update ?? null,
      secondSemicolonLocation.end.line,
      closingParenLocation.start.line,
      clauseIndentation.column,
      closingParenLocation.start.column,
      baseIndentation.column)
  ) {
    return false;
  }

  return true;
}

function checkClause(
    clause: TSESTree.Node | null,
    previousTokenLine: number,
    semicolonLine: number,
    expectedColumn: number
  ): boolean
{
  if (clause === null) {
    return semicolonLine === previousTokenLine + 1;
  }

  const clauseLocation = clause?.loc;

  if (!clauseLocation) {
    return true;
  }

  return (
    clauseLocation.start.line === previousTokenLine + 1
    && clauseLocation.start.column === expectedColumn
    && clauseLocation.end.line === semicolonLine
  );
}

function checkUpdateClause(
    clause: TSESTree.Node | null,
    previousTokenLine: number,
    closingParenLine: number,
    expectedColumn: number,
    closingParenColumn: number,
    expectedClosingParenColumn: number
  ): boolean
{
  if (clause === null) {
    return (
      closingParenLine === previousTokenLine + 1
      && closingParenColumn === expectedClosingParenColumn
    );
  }

  const clauseLocation = clause?.loc;

  if (!clauseLocation) {
    return true;
  }

  return (
    clauseLocation.start.line === previousTokenLine + 1
    && clauseLocation.start.column === expectedColumn
    && clauseLocation.end.line + 1 === closingParenLine
    && closingParenColumn === expectedClosingParenColumn
  );
}

function getFirstSemicolon(
    node: TSESTree.ForStatement,
    sourceCode: Readonly<TSESLint.SourceCode>,
    openingParen: TSESTree.Token | null
  ): TSESTree.Token | null
{
  if (
    openingParen
    === null
  ) {
    return null;
  }

  if (node.init === null) {
    return sourceCode.getTokenAfter(
      asTokenTarget(
        openingParen),
      token => token.value === ';');
  }

  return sourceCode.getTokenAfter(
    asTokenTarget(
      node.init),
    token => token.value === ';');
}

function getSecondSemicolon(
    node: TSESTree.ForStatement,
    sourceCode: Readonly<TSESLint.SourceCode>,
    firstSemicolon: TSESTree.Token | null
  ): TSESTree.Token | null
{
  if (
    firstSemicolon
    === null
  ) {
    return null;
  }

  if (node.test === null) {
    return sourceCode.getTokenAfter(
      asTokenTarget(
        firstSemicolon),
      token => token.value === ';');
  }

  return sourceCode.getTokenAfter(
    asTokenTarget(
      node.test),
    token => token.value === ';');
}

function asTokenTarget(
    node: unknown
  ): NonNullable<Parameters<TSESLint.SourceCode['getTokenAfter']>[0]>
{
  return node as NonNullable<
    Parameters<TSESLint.SourceCode['getTokenAfter']>[0]
  >;
}
