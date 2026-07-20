import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { Rule }
  from 'eslint';
import { Expression,
         Node }
  from 'estree';
import { createFormatter }
  from '../formatter.js';
import { createFormattingContext,
         FormattingContext }
  from '../formatting-context.js';
import { getIndentation,
         Indentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';
import { expressionIsShort }
  from '../functions/short-expression.js';

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
      nodeInitialiser
    )
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

function buildVariableDeclarator(
    node: TSESTree.VariableDeclarator,
    context: FormattingContext
  ): string
{
  const code: string[] = [];

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
        nodeInit as Expression
      )
    ) {
      code.push(' ');
      code.push(initText);
    } else {
      code.push(
        context.newLine
      );

      const indentation =
        getVariableDeclaratorIndentation(
          node,
          context);

      code.push(
        indentation.increase().value
      );

      code.push(initText);
    }
  }

  return code.join('');
}

function getVariableDeclaratorIndentation(
    node: TSESTree.VariableDeclarator,
    context: FormattingContext
  ): Indentation
{
  const nodeInit =
    node.init;

  if (!nodeInit) {
    return Indentation.INITIAL;
  }

  const equalsToken =
    context.sourceCode.getTokenBefore(
      nodeInit as unknown as Node,
      token => token.value === '=');

  if (!equalsToken) {
    return Indentation.INITIAL;
  }

  const equalsTokenLocation =
    tryGetLocation(
      equalsToken);

  if (!equalsTokenLocation) {
    return Indentation.INITIAL;
  }

  return getIndentation(
    context.sourceCode,
    equalsToken
  );
}
