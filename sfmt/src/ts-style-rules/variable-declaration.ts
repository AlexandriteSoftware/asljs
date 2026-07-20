import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { Rule }
  from 'eslint';
import { expressionIsShort }
  from '../functions/short-expression.js';
import { createFormatter }
  from '../formatter.js';
import { Expression,
         Node }
  from 'estree';
import { getIndentation }
  from '../functions/indentations.js';
import { ensureNodeAndLocation,
         LocationIncompleteError }
  from '../functions/location.js';
import { FormattingContext,
         createFormattingContext }
  from '../formatting-context.js';

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  {
  meta: { type: 'layout', fixable: 'code', schema: [] },
  create(context: Rule.RuleContext): Rule.RuleListener
  {
    const listener: Rule.RuleListener =
      {
      VariableDeclarator(node): void
      {
        const tsNode =
          node as unknown as TSESTree.VariableDeclarator;

        if (!tsNode.init) {
          return;
        }

        const fmtCtx =
          createFormattingContext(
            context.sourceCode);

        const correctLayout =
          checkLayout(
            tsNode,
            fmtCtx);

        if (correctLayout) {
          return;
        }

        context.report(
          {
            node,
            message: 'Use asljs variable declaration style.',
            fix(fixer)
            {
              const replacement =
                buildVariableDeclarator(
                  tsNode,
                  fmtCtx);

              return fixer.replaceText(
                node,
                replacement
              );
            }
          }
        );
      }
    };

    return listener;
  }
};

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
  try {
    const nodeInitialiser =
      node.init;

    ensureNodeAndLocation(
      nodeInitialiser);

    if (
      expressionIsShort(
        nodeInitialiser as Expression)
    ) {
      return true;
    }

    const equalsToken =
      context.sourceCode.getTokenBefore(
        nodeInitialiser as unknown as Node,
        token => token.value === '=');

    ensureNodeAndLocation(
      equalsToken);

    const equalsTokenLocEndLine =
      equalsToken.loc.end.line;

    const nodeInitialiserLocStartLine =
      nodeInitialiser.loc.start.line;

    return equalsTokenLocEndLine < nodeInitialiserLocStartLine;
  } catch (error) {
    if (error instanceof LocationIncompleteError) {
      return true;
    }

    throw error;
  }
}

function buildVariableDeclarator(
    node: TSESTree.VariableDeclarator,
    context: FormattingContext
  ): string
{
  const code = [];

  const idText =
    context.sourceCode.getText(
      node.id as unknown as Node);

  code.push(idText);
  code.push(' =');

  const nodeInit =
    node.init;

  if (nodeInit) {
    const initText =
      context.sourceCode.getText(
        nodeInit as unknown as Node);

    if (
      expressionIsShort(
        nodeInit as Expression)
    ) {
      code.push(' ');
      code.push(initText);
    } else {
      const indentation =
        getVariableDeclaratorIndentation(
          node,
          context);

      code.push(
        context.newLine
      );

      code.push(indentation);
      code.push('  ');
      code.push(initText);
    }
  }

  return code.join('');
}

function getVariableDeclaratorIndentation(
    node: TSESTree.VariableDeclarator,
    context: FormattingContext
  ): string
{
  const nodeInit =
    node.init;

  if (!nodeInit) {
    return '';
  }

  const equalsToken =
    context.sourceCode.getTokenBefore(
      nodeInit as unknown as Node,
      token => token.value === '=');

  ensureNodeAndLocation(
    equalsToken);

  return getIndentation(
    context.sourceCode,
    equalsToken);
}
