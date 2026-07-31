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
import { fmtIfStatement,
         fmtIfTestExpression }
  from '../ts-fmt/fmt-if-statement.js';

const messages: Record<string, string> =
  { 'use-asljs-if-statement-style':
      'Use asljs if statement style.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'if-statement',
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
      { IfStatement: listener };

    return ruleListener;

    function listener(
        node: TSESTree.IfStatement
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
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.IfStatement
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
        'use-asljs-if-statement-style',
      fix:
        (
            fixer: TSESLint.RuleFixer
          ): TSESLint.RuleFix =>
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
    node: TSESTree.IfStatement,
    context: FormattingContext
  ): boolean
{
  const sourceCode = context.sourceCode;

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
    || openingParen
       === null
    || closingParen
       === null
  ) {
    return true;
  }

  const ifTokenLocation = ifToken?.loc;

  const openingParenLocation = openingParen?.loc;

  const closingParenLocation = closingParen?.loc;

  const testLocation = node.test?.loc;

  if (
    !ifTokenLocation
    || !openingParenLocation
    || !closingParenLocation
    || !testLocation
  ) {
    return true;
  }

  if (
    ifTokenLocation.start.line
    !== openingParenLocation.start.line
  ) {
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

  if (
    !checkElseIfLayout(
      node,
      context)
  ) {
    return false;
  }

  return true;
}

function checkConditionLayout(
    node: TSESTree.IfStatement,
    sourceCode: Readonly<TSESLint.SourceCode>,
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
        node)
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
        node.test) === formattedTestExpression
    );
  }

  const baseIndentation =
    getIndentation(
      sourceCode,
      node);

  const expectedConditionIndentation =
    baseIndentation.increase();

  return (
    testStartLine === openingParenLine + 1
    && node.test.loc?.start.column === expectedConditionIndentation.column
    && closingParenLine === node.test.loc?.end.line + 1
    && closingParenColumn === baseIndentation.column
    && context.sourceCode.getText(
      node.test) === formattedTestExpression
  );
}

function checkElseIfLayout(
    node: TSESTree.IfStatement,
    context: FormattingContext
  ): boolean
{
  const alternate = node.alternate ?? null;

  if (
    alternate === null
    || alternate.type
       !== 'IfStatement'
  ) {
    return true;
  }

  const elseToken =
    context.sourceCode.getTokenBefore(
      asTokenTarget(
        alternate),
      token => token.value === 'else');

  const elseTokenLocation = elseToken?.loc;

  const alternateLocation = alternate?.loc;

  if (
    !elseTokenLocation
    || !alternateLocation
  ) {
    return true;
  }

  return elseTokenLocation.start.line === alternateLocation.start.line;
}

function asTokenTarget(
    node: unknown
  ): NonNullable<Parameters<TSESLint.SourceCode['getTokenAfter']>[0]>
{
  return node as NonNullable<
    Parameters<TSESLint.SourceCode['getTokenAfter']>[0]
  >;
}
