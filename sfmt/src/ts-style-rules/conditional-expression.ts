import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { type TSESLint }
  from '@typescript-eslint/utils';
import { Rule }
  from 'eslint';
import { FormatterDefinitionFactory,
         RuleListenerFactory,
         tsFormatterFactory }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { Logger }
  from 'asljs-logging';
import { fmtConditionalExpression }
  from '../ts-fmt/fmt-conditional-expression.js';

const messages: Record<string, string> =
  { 'use-asljs-conditional-expression-style':
      'Use asljs conditional expression style.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'conditional-expression',
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
      { ConditionalExpression: listener };

    return ruleListener;

    function listener(
        node: TSESTree.ConditionalExpression
      ): void
    {
      processConditionalExpression(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processConditionalExpression(
    logger: Logger,
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.ConditionalExpression
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
        'use-asljs-conditional-expression-style',
      fix:
        (
            fixer: TSESLint.RuleFixer
          ): TSESLint.RuleFix =>
        {
        const replacement =
          fmtConditionalExpression(
            node,
            fmtCtx);

        return fixer.replaceText(
          node,
          replacement);
      } });
}

function checkLayout(
    node: TSESTree.ConditionalExpression,
    context: FormattingContext
  ): boolean
{
  const questionMark =
    context.sourceCode.getTokenAfter(
      asTokenTarget(
        node.test),
      token => token.value === '?');

  const colon =
    context.sourceCode.getTokenAfter(
      asTokenTarget(
        node.consequent),
      token => token.value === ':');

  if (
    questionMark
    === null
    || colon === null
  ) {
    return true;
  }

  const testEndLine =
    node.test.loc?.end.line;

  const consequentEndLine =
    node.consequent.loc?.end.line;

  if (
    testEndLine
    === undefined
    || consequentEndLine
       === undefined
  ) {
    return true;
  }

  return (
    questionMark.loc.start.line > testEndLine
    && colon.loc.start.line > consequentEndLine
  );
}

export function getIndentation(
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.ConditionalExpression
  ): string
{
  const nodeLocation = node.loc;

  if (
    nodeLocation
    === undefined
    || nodeLocation
       === null
  ) {
    return '';
  }

  const line =
    sourceCode.lines[nodeLocation.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}

function asTokenTarget(
    node: unknown
  ): NonNullable<Parameters<TSESLint.SourceCode['getTokenAfter']>[0]>
{
  return node as NonNullable<
    Parameters<TSESLint.SourceCode['getTokenAfter']>[0]
  >;
}

export function asTextNode(
    node: unknown
  ): Parameters<TSESLint.SourceCode['getText']>[0]
{
  return node as Parameters<TSESLint.SourceCode['getText']>[0];
}
