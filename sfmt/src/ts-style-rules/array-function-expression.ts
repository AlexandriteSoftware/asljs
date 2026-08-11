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
import { Logger }
  from 'asljs-logging';
import { fmtArrayFunctionExpression }
  from '../ts-fmt/fmt-array-function-expression.js';

const messages: Record<string, string> =
  { 'use-asljs-arrayfunctionexpression-style':
      'Use asljs arrayfunctionexpression style.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'arrayfunctionexpression',
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
      { ArrowFunctionExpression: listener };

    return ruleListener;

    function listener(
        node: TSESTree.ArrowFunctionExpression
      ): void
    {
      processArrowFunctionExpression(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processArrowFunctionExpression(
    logger: Logger,
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.ArrowFunctionExpression
  ): void
{
  if (node.body.type !== 'BlockStatement') {
    return;
  }

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
        'use-asljs-arrayfunctionexpression-style',
      fix:
        (
            fixer: TSESLint.RuleFixer
          ): TSESLint.RuleFix =>
        {
        const replacement =
          fmtArrayFunctionExpression(
            node,
            fmtCtx);

        return fixer.replaceText(
          node,
          replacement);
      } });
}

function checkLayout(
    node: TSESTree.ArrowFunctionExpression,
    context: FormattingContext
  ): boolean
{
  const replacement =
    fmtArrayFunctionExpression(
      node,
      context);

  const source =
    context.sourceCode.getText(
      node);

  return replacement === source;
}
