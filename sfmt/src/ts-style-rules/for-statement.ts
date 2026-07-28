import { AST,
         Rule,
         SourceCode }
  from 'eslint';
import { ForStatement,
         Node }
  from 'estree';
import { FormatterDefinitionFactory,
         formatterFactory,
         RuleListenerFactory }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { tryGetLocation,
         type WithLocation }
  from '../functions/location.js';
import { Logger }
  from '../logging.js';
import { fmtForStatement }
  from '../ts-fmt/fmt-for-statement.js';

const formatterDefinitionFactory: FormatterDefinitionFactory =
  formatterFactory(
    'for-statement',
    listenerFactory);

export default formatterDefinitionFactory;

function listenerFactory(
    logger: Logger
  ): RuleListenerFactory
{
  const listenerFactory: RuleListenerFactory =
    (
    context: Rule.RuleContext
  ): Rule.RuleListener =>
  {
    const ruleListener: Rule.RuleListener =
      { ForStatement: listener };

    return ruleListener;

    function listener(
        node: ForStatement
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
    context: Rule.RuleContext,
    node: ForStatement
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
      message:
        'Use asljs for statement style.',
      fix:
        (fixer: Rule.RuleFixer): Rule.Fix =>
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
    node: ForStatement,
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

  const forTokenLocation =
    tryGetLocation(
      forToken);

  const openingParenLocation =
    tryGetLocation(
      openingParen);

  const firstSemicolonLocation =
    tryGetLocation(
      firstSemicolon);

  const secondSemicolonLocation =
    tryGetLocation(
      secondSemicolon);

  const closingParenLocation =
    tryGetLocation(
      closingParen);

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
      node as unknown as WithLocation);

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
    clause: Node | null,
    previousTokenLine: number,
    semicolonLine: number,
    expectedColumn: number
  ): boolean
{
  if (clause === null) {
    return semicolonLine === previousTokenLine + 1;
  }

  const clauseLocation =
    tryGetLocation(
      clause);

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
    clause: Node | null,
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

  const clauseLocation =
    tryGetLocation(
      clause);

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
    node: ForStatement,
    sourceCode: SourceCode,
    openingParen: AST.Token | null
  ): AST.Token | null
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
    node: ForStatement,
    sourceCode: SourceCode,
    firstSemicolon: AST.Token | null
  ): AST.Token | null
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
  ): NonNullable<Parameters<SourceCode['getTokenAfter']>[0]>
{
  return node as NonNullable<Parameters<SourceCode['getTokenAfter']>[0]>;
}
