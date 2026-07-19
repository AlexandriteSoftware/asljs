import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { AST,
         Rule,
         SourceCode }
  from 'eslint';
import * as ESTree
  from 'estree';
import { createFormatter }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { ensureNodeAndLocation }
  from '../functions/location.js';

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  {
  meta: { type: 'layout', fixable: 'code', schema: [] },
  create(context: Rule.RuleContext): Rule.RuleListener
  {
    const listener: Rule.RuleListener =
      {
      FunctionDeclaration(node): void
      {
        const tsNode =
          node as unknown as TSESTree.FunctionDeclaration;

        const sourceCode =
          context.sourceCode as SourceCode;

        const newLine =
          context.sourceCode.text.includes('\r\n')
          ? '\r\n'
          : '\n';

        const formattingContext: FormattingContext =
          {
          newLine,
          sourceCode
        };

        const correctLayout =
          checkLayout(
            tsNode,
            formattingContext);

        if (correctLayout) {
          return;
        }

        context.report(
          {
            node,
            message: 'Use asljs function declaration style.',
            fix(fixer: Rule.RuleFixer): Rule.Fix
            {
              const replacement =
                buildFunctionDeclaration(
                  tsNode,
                  formattingContext);

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

export const functionDeclarationFormatter =
  createFormatter(
    'function-declaration-style',
    ruleDefinition);

export default functionDeclarationFormatter.eslintRule;

/**
 * Checks that function parameters are on separate lines and the opening brace
 * is on a new line.
 */
function checkLayout(
    node: TSESTree.FunctionDeclaration,
    context: FormattingContext
  ): boolean
{
  const baseIndent =
    getIndentation(
      context.sourceCode,
      node);

  const id =
    node.id;

  const typeParameters =
    node.typeParameters;

  let openingParen: AST.Token | null = null;

  if (typeParameters) {
    openingParen = context.sourceCode.getTokenAfter(
      typeParameters as unknown as ESTree.Node
    );
  } else {
    openingParen = context.sourceCode.getTokenAfter(
      id as unknown as ESTree.Node
    );
  }

  ensureNodeAndLocation(
    openingParen,
    'Punctuator',
    '('
  );

  const openingParenEndLine =
    openingParen.loc.end.line;

  const parameters =
    node.params;

  if (parameters.length > 0) {
    const firstParameter =
      parameters[0];

    ensureNodeAndLocation(
      firstParameter
    );

    const firstParameterStartLine =
      firstParameter.loc.start.line;

    if (openingParenEndLine === firstParameterStartLine) {
      return false;
    }

    const parameterIndent =
      getIndentation(
        context.sourceCode,
        firstParameter);

    if (parameterIndent !== baseIndent + '    ') {
      return false;
    }
  }

  for (let index = 1; index < parameters.length; index++) {
    const previousParameter =
      parameters[index - 1];

    ensureNodeAndLocation(
      previousParameter
    );

    const currentParameter =
      parameters[index];

    ensureNodeAndLocation(
      currentParameter
    );

    const previousParameterEndLine =
      previousParameter.loc.end.line;

    const currentParameterStartLine =
      currentParameter.loc.start.line;

    if (previousParameterEndLine === currentParameterStartLine) {
      return false;
    }

    const parameterIndent =
      getIndentation(
        context.sourceCode,
        currentParameter);

    if (parameterIndent !== baseIndent + '    ') {
      return false;
    }
  }

  let closingParen: AST.Token | null = null;

  if (parameters.length > 0) {
    const lastParameter =
      parameters[parameters.length - 1];

    ensureNodeAndLocation(
      lastParameter
    );

    closingParen = context.sourceCode
      .getTokenAfter(
        lastParameter as unknown as ESTree.Node
      );

    ensureNodeAndLocation(
      closingParen,
      'Punctuator',
      ')'
    );

    const closingParenEndLine =
      closingParen.loc.end.line;

    if (closingParenEndLine === lastParameter.loc.end.line) {
      return false;
    }
  } else {
    const openingParenEndLine =
      openingParen.loc.end.line;

    closingParen = context.sourceCode
      .getTokenAfter(
        openingParen as unknown as ESTree.Node
      );

    ensureNodeAndLocation(
      closingParen,
      'Punctuator',
      ')'
    );

    const closingParenStartLine =
      closingParen.loc.start.line;

    if (openingParenEndLine === closingParenStartLine) {
      return false;
    }
  }

  const closingParenIndent =
    getIndentation(
      context.sourceCode,
      closingParen);

  if (closingParenIndent !== baseIndent + '  ') {
    return false;
  }

  return true;
}

export function buildFunctionDeclaration(
    node: TSESTree.FunctionDeclaration,
    context: FormattingContext
  ): string
{
  const baseIndent =
    getIndentation(
      context.sourceCode,
      node);

  const name =
    node.id?.name ?? '';

  const typeParameters =
    node.typeParameters;

  const body =
    node.body;

  const returnTypeText =
    getReturnTypeText(
      node,
      context);

  const parameters =
    node.params.map(
      parameter =>
      context.sourceCode.getText(
        parameter as unknown as ESTree.Node
      ));

  const code = [];

  if (node.async) {
    code.push('async ');
  }

  code.push('function ');

  if (name) {
    code.push(name);
  }

  if (typeParameters) {
    const typeParametersCode =
      context.sourceCode.getText(
        typeParameters as unknown as ESTree.Node);

    code.push(
      typeParametersCode
    );
  }

  code.push('(');

  for (let index = 0; index < parameters.length; index++) {
    code.push(
      context.newLine
    );

    code.push(baseIndent);
    code.push('    ');

    code.push(
      parameters[index]
    );

    if (index < parameters.length - 1) {
      code.push(',');
    }
  }

  code.push(
    context.newLine
  );

  code.push(baseIndent);
  code.push('  ');
  code.push(')');
  code.push(returnTypeText);

  code.push(
    context.newLine
  );

  code.push(
    context.sourceCode.getText(
      body as unknown as ESTree.Node
    )
  );

  return code.join('');
}

function getReturnTypeText(
    node: TSESTree.FunctionDeclaration,
    context: FormattingContext
  ): string
{
  if (!node.returnType) {
    return '';
  }

  const returnTypeText =
    context.sourceCode.getText(
      node.returnType as unknown as ESTree.Node);

  return returnTypeText;
}
