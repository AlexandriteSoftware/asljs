import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { Rule }
  from 'eslint';
import { Node }
  from 'estree';
import { createFormatter }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';
import { fmtVariableDeclarator }
  from '../ts-fmt/fmt-variable-declarator.js';

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  { meta:
      { type: 'layout',
        fixable: 'code',
        schema: [] },
    create:
      (context: Rule.RuleContext): Rule.RuleListener =>
  {
    const listener: Rule.RuleListener =
      { VariableDeclarator:
          (node): void =>
      {
        const tsNode =
          node as unknown as TSESTree.VariableDeclarator;

        if (!tsNode.init) {
          return;
        }

        const fmtCtx =
          new FormattingContext(
          context.sourceCode
        );

        const correctLayout =
          checkLayout(
            tsNode,
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
                  tsNode,
                  fmtCtx);

              return fixer.replaceText(
                node,
                replacement);
            } });
      } };

    return listener;
  } };

export const variableDeclarationFormatter =
  createFormatter(
    'variable-declaration-style',
    ruleDefinition);

export default variableDeclarationFormatter.eslintRule;

function checkLayout(
    node: TSESTree.VariableDeclarator,
    context: FormattingContext
  ): boolean
{
  const nodeInitialiser =
    node.init;

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
    expressionIsShort(
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
