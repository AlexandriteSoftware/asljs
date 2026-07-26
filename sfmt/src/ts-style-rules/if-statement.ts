import { Rule,
         SourceCode }
  from 'eslint';
import { IfStatement }
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
import { fmtIfStatement,
         fmtIfTestExpression }
  from '../ts-fmt/fmt-if-statement.js';

const formatterDefinitionFactory: FormatterDefinitionFactory =
  formatterFactory(
    'if-statement',
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
      { IfStatement: listener };

    return ruleListener;

    function listener(
        node: IfStatement
      ): void
    {
      processIfStatement(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processIfStatement(
    logger: Logger,
    context: Rule.RuleContext,
    node: IfStatement
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
        'Use asljs if statement style.',
      fix:
        (fixer: Rule.RuleFixer): Rule.Fix =>
      {
        const replacement =
          fmtIfStatement(
            node,
            fmtCtx);

        return fixer.replaceText(
          node,
          replacement);
      } });
}

function checkLayout(
    node: IfStatement,
    context: FormattingContext
  ): boolean
{
  const sourceCode =
    context.sourceCode;

  const ifToken =
    sourceCode.getFirstToken(
      node);

  const openingParen =
    sourceCode.getTokenAfter(
      asTokenTarget(
        ifToken),
      token => token.value === '(');

  const closingParen =
    sourceCode.getTokenBefore(
      asTokenTarget(
        node.consequent),
      token => token.value === ')');

  if (
    ifToken === null
    || openingParen === null
    || closingParen === null
  ) {
    return true;
  }

  const ifTokenLocation =
    tryGetLocation(
      ifToken);

  const openingParenLocation =
    tryGetLocation(
      openingParen);

  const closingParenLocation =
    tryGetLocation(
      closingParen);

  const testLocation =
    tryGetLocation(
      node.test);

  if (
    !ifTokenLocation
    || !openingParenLocation
    || !closingParenLocation
    || !testLocation
  ) {
    return true;
  }

  if (ifTokenLocation.start.line !== openingParenLocation.start.line) {
    return false;
  }

  if (
    !checkConditionLayout(
      node,
      sourceCode,
      openingParenLocation.end.line,
      closingParenLocation.start.line,
      closingParenLocation.start.column,
      testLocation.start.line,
      context)
  ) {
    return false;
  }

  if (!checkElseIfLayout(
    node,
    context)) {
    return false;
  }

  return true;
}

function checkConditionLayout(
    node: IfStatement,
    sourceCode: SourceCode,
    openingParenLine: number,
    closingParenLine: number,
    closingParenColumn: number,
    testStartLine: number,
    context: FormattingContext
  ): boolean
{
  const formattedTestExpression =
    fmtIfTestExpression(
      node.test,
      context,
      getIndentation(
        sourceCode,
        node as unknown as WithLocation)
        .increase()
        .value);

  const isMultilineCondition =
    formattedTestExpression.includes(
      context.newLine);

  if (!isMultilineCondition) {
    return (
      testStartLine === openingParenLine
      && node.test.loc?.end.line === closingParenLine
      && context.sourceCode.getText(
        node.test) === formattedTestExpression);
  }

  const baseIndentation =
    getIndentation(
      sourceCode,
      node as unknown as WithLocation);

  const expectedConditionIndentation =
    baseIndentation.increase();

  return (
    testStartLine === openingParenLine + 1
    && node.test.loc?.start.column === expectedConditionIndentation.column
    && closingParenLine === node.test.loc?.end.line + 1
    && closingParenColumn === baseIndentation.column
    && context.sourceCode.getText(
      node.test) === formattedTestExpression);
}

function checkElseIfLayout(
    node: IfStatement,
    context: FormattingContext
  ): boolean
{
  const alternate =
    node.alternate ?? null;

  if (alternate === null || alternate.type !== 'IfStatement') {
    return true;
  }

  const elseToken =
    context.sourceCode.getTokenBefore(
      asTokenTarget(
        alternate),
      token => token.value === 'else');

  const elseTokenLocation =
    tryGetLocation(
      elseToken);

  const alternateLocation =
    tryGetLocation(
      alternate);

  if (!elseTokenLocation || !alternateLocation) {
    return true;
  }

  return elseTokenLocation.start.line === alternateLocation.start.line;
}

function asTokenTarget(
    node: unknown
  ): NonNullable<Parameters<SourceCode['getTokenAfter']>[0]>
{
  return node as NonNullable<Parameters<SourceCode['getTokenAfter']>[0]>;
}
