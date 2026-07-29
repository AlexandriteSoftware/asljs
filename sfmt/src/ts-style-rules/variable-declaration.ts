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
import { expressionIsSimple }
  from '../functions/simple-expression.js';
import { Logger }
  from '../logging.js';
import { fmtVariableDeclarator }
  from '../ts-fmt/fmt-variable-declarator.js';

const messages: Record<string, string> =
  { 'use-asljs-variable-declaration-style':
      'Use asljs variable declaration style.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'variable-declaration',
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
      { VariableDeclarator: listener };

    return ruleListener;

    function listener(
        node: TSESTree.VariableDeclarator
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
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.VariableDeclarator
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
      messageId:
        'use-asljs-variable-declaration-style',
      fix:
        (
        fixer: TSESLint.RuleFixer
      ): TSESLint.RuleFix =>
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
    node: TSESTree.VariableDeclarator,
    context: FormattingContext
  ): boolean
{
  const nodeInitialiser = node.init;

  if (!nodeInitialiser) {
    return true;
  }

  const nodeInitialiserLocation =
    nodeInitialiser?.loc;

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
      nodeInitialiser,
      token => token.value === '=');

  const equalsTokenLocation = equalsToken?.loc;

  if (!equalsTokenLocation) {
    return true;
  }

  const equalsTokenLocEndLine =
    equalsTokenLocation.end.line;

  return equalsTokenLocEndLine < nodeInitialiserLocStartLine;
}
