import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { Rule }
  from 'eslint';
import { Node,
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
import { expressionIsSimple }
  from '../functions/simple-expression.js';
import { Logger }
  from '../logging.js';
import { fmtVariableDeclarator }
  from '../ts-fmt/fmt-variable-declarator.js';

const formatterDefinitionFactory: FormatterDefinitionFactory =
  formatterFactory(
    'variable-declaration',
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
      { VariableDeclarator: listener };

    return ruleListener;

    function listener(
        node: VariableDeclarator & Rule.NodeParentExtension
      ): void
    {
      processVariableDeclaration(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processVariableDeclaration(
    logger: Logger,
    context: Rule.RuleContext,
    node: VariableDeclarator & Rule.NodeParentExtension
  ): void
{
  if (!node.init) {
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
      message:
        'Use asljs variable declaration style.',
      fix:
        fixer =>
      {
        const replacement =
          fmtVariableDeclarator(
            node,
            fmtCtx);

        return fixer.replaceText(
          node,
          replacement);
      } });
}

function checkLayout(
    node: VariableDeclarator,
    context: FormattingContext
  ): boolean
{
  const nodeInitialiser = node.init;

  if (!nodeInitialiser) {
    return true;
  }

  const nodeInitialiserLocation =
    tryGetLocation(
      nodeInitialiser);

  if (!nodeInitialiserLocation) {
    return true;
  }

  const nodeInitialiserLocStartLine =
    nodeInitialiserLocation.start.line;

  if (
    expressionIsSimple(
      nodeInitialiser)
  ) {
    return true;
  }

  const equalsToken =
    context.sourceCode.getTokenBefore(
      nodeInitialiser as unknown as Node,
      token => token.value === '=');

  const equalsTokenLocation =
    tryGetLocation(
      equalsToken);

  if (!equalsTokenLocation) {
    return true;
  }

  const equalsTokenLocEndLine =
    equalsTokenLocation.end.line;

  return equalsTokenLocEndLine < nodeInitialiserLocStartLine;
}
