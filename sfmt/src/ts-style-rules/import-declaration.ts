import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { Rule }
  from 'eslint';
import { ImportDeclaration }
  from 'estree';
import { FormatterDefinitionFactory,
         formatterFactory,
         RuleListenerFactory }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { Logger }
  from '../logging.js';
import { fmtImportNode }
  from '../ts-fmt/fmt-import-node.js';

export type Import =
  | TSESTree.ImportSpecifier
  | TSESTree.ImportDefaultSpecifier
  | TSESTree.ImportNamespaceSpecifier;

const formatterDefinitionFactory: FormatterDefinitionFactory =
  formatterFactory(
    'import-declaration',
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
      { ImportDeclaration: listener };

    return ruleListener;

    function listener(
        node: ImportDeclaration & Rule.NodeParentExtension
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
    context: Rule.RuleContext,
    node: ImportDeclaration & Rule.NodeParentExtension
  ): void
{
  const tsNode =
    node as unknown as TSESTree.ImportDeclaration;

  const fmtCtx =
    new FormattingContext(
      context.sourceCode,
      logger);

  const sourceCode =
    context.sourceCode.getText(node);

  const replacement =
    fmtImportNode(
      tsNode,
      fmtCtx);

  if (sourceCode === replacement) {
    return;
  }

  context.report(
    { node: node,
      message:
        'Use asljs import style.',
      fix:
        (fixer: Rule.RuleFixer): Rule.Fix =>
      {
        return fixer.replaceText(
          node,
          replacement);
      } });
}
