import { RuleDefinition,
         RuleDefinitionTypeOptions }
  from '@eslint/core';
import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { AST,
         Rule }
  from 'eslint';
import * as ESTree
  from 'estree';
import { createFormatter }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { tryGetLocation }
  from '../functions/location.js';

const ruleDefinition: RuleDefinition<RuleDefinitionTypeOptions> =
  { meta:
      { type: 'layout',
        fixable: 'code',
        schema: [] },
    create:
      (context: Rule.RuleContext): Rule.RuleListener =>
  {
    const listener: Rule.RuleListener =
      { FunctionDeclaration:
          (node): void =>
      {
        const tsNode =
          node as unknown as TSESTree.FunctionDeclaration;

        const sourceCode =
          context.sourceCode;

        const fmtCtx =
          new FormattingContext(
          sourceCode
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
              'Use asljs function declaration style.',
            fix:
              (fixer: Rule.RuleFixer): Rule.Fix =>
            {
              const replacement =
                buildFunctionDeclaration(
                  tsNode,
                  fmtCtx);

              return fixer.replaceText(
                node,
                replacement);
            } });
      } };

    return listener;
  } };

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

  const parametersIndent =
    baseIndent.increase(2);

  const id =
    node.id;

  const typeParameters =
    node.typeParameters;

  let openingParen: AST.Token | null = null;

  if (typeParameters) {
    openingParen = context.sourceCode.getTokenAfter(
      typeParameters as unknown as ESTree.Node);
  } else {
    openingParen = context.sourceCode.getTokenAfter(
      id as unknown as ESTree.Node);
  }

  if (
    !openingParen
    || openingParen.type !== 'Punctuator'
    || openingParen.value !== '('
  ) {
    return true;
  }

  const openingParenLocation =
    tryGetLocation(
      openingParen);

  if (!openingParenLocation) {
    return true;
  }

  const openingParenEndLine =
    openingParenLocation.end.line;

  const parameters =
    node.params;

  if (parameters.length > 0) {
    const firstParameter =
      parameters[0];

    const tryGetFirstParameterLocation =
      tryGetLocation(
        firstParameter);

    if (!tryGetFirstParameterLocation) {
      return true;
    }

    const firstParameterStartLine =
      tryGetFirstParameterLocation.start.line;

    if (openingParenEndLine === firstParameterStartLine) {
      return false;
    }

    const parameterIndent =
      getIndentation(
        context.sourceCode,
        firstParameter);

    if (parameterIndent.value !== parametersIndent.value) {
      return false;
    }
  }

  for (let index = 1; index < parameters.length; index++) {
    const previousParameter =
      parameters[index - 1];

    const previousParameterLocation =
      tryGetLocation(
        previousParameter);

    if (!previousParameterLocation) {
      return true;
    }

    const currentParameter =
      parameters[index];

    const currentParameterLocation =
      tryGetLocation(
        currentParameter);

    if (!currentParameterLocation) {
      return true;
    }

    const previousParameterEndLine =
      previousParameterLocation.end.line;

    const currentParameterStartLine =
      currentParameterLocation.start.line;

    if (previousParameterEndLine === currentParameterStartLine) {
      return false;
    }

    const parameterIndent =
      getIndentation(
        context.sourceCode,
        currentParameter);

    if (parameterIndent.value !== parametersIndent.value) {
      return false;
    }
  }

  let closingParen: AST.Token | null = null;

  if (parameters.length > 0) {
    const lastParameter =
      parameters[parameters.length - 1];

    const lastParameterLocation =
      tryGetLocation(
        lastParameter);

    if (!lastParameterLocation) {
      return true;
    }

    closingParen = context.sourceCode
      .getTokenAfter(
        lastParameter as unknown as ESTree.Node);

    if (
      !closingParen
      || closingParen.type !== 'Punctuator'
      || closingParen.value !== ')'
    ) {
      return true;
    }

    const closingParenLocation =
      tryGetLocation(
        closingParen);

    if (!closingParenLocation) {
      return true;
    }

    const closingParenEndLine =
      closingParenLocation.end.line;

    if (closingParenEndLine === lastParameterLocation.end.line) {
      return false;
    }
  } else {
    const openingParenEndLine =
      openingParenLocation.end.line;

    closingParen = context.sourceCode
      .getTokenAfter(
        openingParen as unknown as ESTree.Node);

    if (
      !closingParen
      || closingParen.type !== 'Punctuator'
      || closingParen.value !== ')'
    ) {
      return true;
    }

    const closingParenLocation =
      tryGetLocation(
        closingParen);

    if (!closingParenLocation) {
      return true;
    }

    const closingParenStartLine =
      closingParenLocation.start.line;

    if (openingParenEndLine === closingParenStartLine) {
      return false;
    }
  }

  const closingParenIndent =
    baseIndent.increase();

  const actualClosingParenIndent =
    getIndentation(
      context.sourceCode,
      closingParen);

  if (closingParenIndent.value !== actualClosingParenIndent.value) {
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

  const parameterIndent =
    baseIndent.increase(2);

  const closeParenIndent =
    baseIndent.increase();

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
        parameter as unknown as ESTree.Node));

  const code: string[] = [];

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
      typeParametersCode);
  }

  code.push('(');

  for (let index = 0; index < parameters.length; index++) {
    code.push(
      context.newLine);

    code.push(
      parameterIndent.value);

    code.push(
      parameters[index]);

    if (index < parameters.length - 1) {
      code.push(',');
    }
  }

  code.push(
    context.newLine);

  code.push(
    closeParenIndent.value);

  code.push(')');
  code.push(returnTypeText);

  code.push(
    context.newLine);

  code.push(
    baseIndent.value);

  code.push(
    context.sourceCode.getText(
      body as unknown as ESTree.Node));

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
