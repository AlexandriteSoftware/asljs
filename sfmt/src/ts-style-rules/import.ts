import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { Rule }
  from 'eslint';
import { createFormatter }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { fmtImportNode }
  from '../ts-fmt/fmt-import-node.js';

export type Import =
  | TSESTree.ImportSpecifier
  | TSESTree.ImportDefaultSpecifier
  | TSESTree.ImportNamespaceSpecifier;

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  { meta:
      { fixable: 'code' },
    create:
      (context: Rule.RuleContext): Rule.RuleListener =>
  {
    const listener: Rule.RuleListener =
      { ImportDeclaration:
          (node): void =>
      {
        const tsNode =
          node as unknown as TSESTree.ImportDeclaration;

        const fmtCtx =
          new FormattingContext(
          context.sourceCode
        );

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
      } };

    return listener;
  } };

export const importFormatter =
  createFormatter(
    'import-style',
    ruleDefinition);

export default importFormatter.eslintRule;
