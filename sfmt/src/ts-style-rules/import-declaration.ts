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
  from '../logging.js';
import { fmtImportNode }
  from '../ts-fmt/fmt-import-node.js';

const messages: Record<string, string> =
  { 'use-asljs-import-style':
      'Use asljs import style.' };

export type Import =
  | TSESTree.ImportSpecifier
  | TSESTree.ImportDefaultSpecifier
  | TSESTree.ImportNamespaceSpecifier;

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'import-declaration',
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
      { ImportDeclaration: listener };

    return ruleListener;

    function listener(
        node: TSESTree.ImportDeclaration
      ): void
    {
      processImportDeclaration(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processImportDeclaration(
    logger: Logger,
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.ImportDeclaration
  ): void
{
  const fmtCtx =
    new FormattingContext(
      context.sourceCode,
      logger);

  const sourceCode =
    context.sourceCode.getText(node);

  const replacement =
    fmtImportNode(
      node,
      fmtCtx);

  if (sourceCode === replacement) {
    return;
  }

  context.report(
    { node: node,
      messageId:
        'use-asljs-import-style',
      fix:
        (
        fixer: TSESLint.RuleFixer
      ): TSESLint.RuleFix =>
      {
        return fixer.replaceText(
          node,
          replacement);
      } });
}
