import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { Rule }
  from 'eslint';
import { AssignmentExpression,
         Node,
         VariableDeclarator }
  from 'estree';
import { FormatterDefinitionFactory,
         formatterFactory,
         RuleListenerFactory }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';
import { Logger }
  from '../logging.js';
import { fmtAssignmentExpression }
  from '../ts-fmt/fmt-assignment-expression.js';

const formatterDefinitionFactory: FormatterDefinitionFactory =
  formatterFactory(
    'assignment-expression',
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
      { AssignmentExpression: listener };

    return ruleListener;

    function listener(
        node: AssignmentExpression & Rule.NodeParentExtension
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
    context: Rule.RuleContext,
    node: AssignmentExpression & Rule.NodeParentExtension
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
        'Use asljs variable declaration style.',
      fix:
        fixer =>
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
    node: AssignmentExpression,
    context: FormattingContext
  ): boolean
{
  const left =
    node.left;

  if (!left) {
    context.logger.debug(
      'AssignmentExpression node has no left property, cancel.');

    return true;
  }

  const right =
    node.right;

  if (!right) {
    context.logger.debug(
      'AssignmentExpression node has no right property, cancel.');

    return true;
  }

  const nodeLeftLocation =
    tryGetLocation(
      left);

  if (!nodeLeftLocation) {
    context.logger.debug(
      'AssignmentExpression left node has no location, cancel.');

    return true;
  }

  const nodeLeftLocStartLine =
    nodeLeftLocation.start.line;

  if (
    expressionIsShort(
      right)
  ) {
    context.logger.debug(
      'AssignmentExpression right node is short, accept.');

    return true;
  }

  const equalsToken =
    context.sourceCode.getTokenBefore(
      right as unknown as Node,
      token => token.value === '=');

  if (!equalsToken) {
    context.logger.debug(
      'AssignmentExpression right node has no equals token, cancel.');

    return true;
  }

  const equalsTokenLocation =
    tryGetLocation(
      equalsToken);

  if (!equalsTokenLocation) {
    context.logger.debug(
      'AssignmentExpression equals token has no location, cancel.');

    return true;
  }

  const equalsTokenLocEndLine =
    equalsTokenLocation.end.line;

  const rightNodeLocation =
    tryGetLocation(
      right);

  if (!rightNodeLocation) {
    context.logger.debug(
      'AssignmentExpression right node has no location, cancel.');

    return true;
  }

  const rightNodeLocStartLine =
    rightNodeLocation.start.line;

  const result =
    equalsTokenLocEndLine < rightNodeLocStartLine;

  if (!result) {
    context.logger.debug(
      'AssignmentExpression equals token is not on a separate line from right node, reject.');

    return false;
  }

  context.logger.debug(
    'AssignmentExpression equals token is on a separate line from right node, accept.');

  return true;
}
