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
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsSimple }
  from '../functions/simple-expression.js';
import { Logger }
  from 'asljs-logging';
import { fmtAssignmentExpression }
  from '../ts-fmt/fmt-assignment-expression.js';

const messages: Record<string, string> =
  { 'use-asljs-assignment-expression-style':
      'Use asljs assignment expression style.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'assignment-expression',
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
      { AssignmentExpression: listener };

    return ruleListener;

    function listener(
        node: TSESTree.AssignmentExpression
      ): void
    {
      processAssignmentExpression(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processAssignmentExpression(
    logger: Logger,
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.AssignmentExpression
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
        'use-asljs-assignment-expression-style',
      fix:
        (
            fixer: TSESLint.RuleFixer
          ): TSESLint.RuleFix =>
        {
        const replacement =
          fmtAssignmentExpression(
            node,
            fmtCtx);

        return fixer.replaceText(
          node,
          replacement);
      } });
}

function checkLayout(
    node: TSESTree.AssignmentExpression,
    context: FormattingContext
  ): boolean
{
  const logger = context.logger;

  const left = node.left;

  if (!left) {
    logger.debug(
      'AssignmentExpression node has no left property, cancel.');

    return true;
  }

  const right = node.right;

  if (!right) {
    logger.debug(
      'AssignmentExpression node has no right property, cancel.');

    return true;
  }

  if (
    expressionIsSimple(
      right)
  ) {
    logger.debug(
      'AssignmentExpression right node is simple, accept.');

    return true;
  }

  const nodeLeftLocation = left?.loc;

  if (!nodeLeftLocation) {
    logger.debug(
      'AssignmentExpression left node has no location, cancel.');

    return true;
  }

  const equalsToken =
    context.sourceCode.getTokenBefore(
      right,
      token => token.value === '=');

  if (!equalsToken) {
    logger.debug(
      'AssignmentExpression right node has no equals token, cancel.');

    return true;
  }

  const equalsTokenLocation = equalsToken?.loc;

  if (!equalsTokenLocation) {
    logger.debug(
      'AssignmentExpression equals token has no location, cancel.');

    return true;
  }

  const equalsTokenLocEndLine =
    equalsTokenLocation.end.line;

  const rightNodeLocation = right?.loc;

  if (!rightNodeLocation) {
    logger.debug(
      'AssignmentExpression right node has no location, cancel.');

    return true;
  }

  const rightNodeLocStartLine =
    rightNodeLocation.start.line;

  const result =
    equalsTokenLocEndLine < rightNodeLocStartLine;

  if (!result) {
    logger.debug(
      'AssignmentExpression equals token is not on a separate line from right node, reject.');

    return false;
  }

  logger.debug(
    'AssignmentExpression equals token is on a separate line from right node, accept.');

  return true;
}
