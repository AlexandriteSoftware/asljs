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
import { getIndentation }
  from '../functions/indentations.js';
import { Logger }
  from 'asljs-logging';
import { fmtFunctionDeclaration }
  from '../ts-fmt/fmt-function-declaration.js';

const messages: Record<string, string> =
  { 'use-asljs-function-declaration-style':
      'Use asljs function declaration style.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'function-declaration',
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
      { FunctionDeclaration: listener };

    return ruleListener;

    function listener(
        node: TSESTree.FunctionDeclaration
      ): void
    {
      processFunctionDeclaration(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processFunctionDeclaration(
    logger: Logger,
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.FunctionDeclaration
  ): void
{
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
        'use-asljs-function-declaration-style',
      fix:
        (
            fixer: TSESLint.RuleFixer
          ): TSESLint.RuleFix =>
        {
        const replacement =
          fmtFunctionDeclaration(
            node,
            fmtCtx);

        return fixer.replaceText(
          node,
          replacement);
      } });
}

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

  const id = node.id;

  const typeParameters =
    (node as unknown as { typeParameters: TSESTree.Node | null; })
      .typeParameters;

  let openingParen: TSESTree.Token | null = null;

  if (typeParameters) {
    openingParen =
      context.sourceCode.getTokenAfter(
        typeParameters);
  } else if (id) {
    openingParen =
      context.sourceCode.getTokenAfter(
        id);
  }

  if (
    !openingParen
    || openingParen.type
       !== 'Punctuator'
    || openingParen.value !== '('
  ) {
    return true;
  }

  const openingParenLocation = openingParen?.loc;

  if (!openingParenLocation) {
    return true;
  }

  const openingParenEndLine =
    openingParenLocation.end.line;

  const parameters = node.params;

  if (parameters.length > 0) {
    const firstParameter = parameters[0];

    const tryGetFirstParameterLocation = firstParameter?.loc;

    if (!tryGetFirstParameterLocation) {
      return true;
    }

    const firstParameterStartLine =
      tryGetFirstParameterLocation.start.line;

    if (
      openingParenEndLine
      === firstParameterStartLine
    ) {
      return false;
    }

    const parameterIndent =
      getIndentation(
        context.sourceCode,
        firstParameter);

    if (
      parameterIndent.value
      !== parametersIndent.value
    ) {
      return false;
    }
  }

  for (
    let index = 1;
    index < parameters.length;
    index++
  ) {
    const previousParameter =
      parameters[index - 1];

    const previousParameterLocation =
      previousParameter?.loc;

    if (!previousParameterLocation) {
      return true;
    }

    const currentParameter = parameters[index];

    const currentParameterLocation =
      currentParameter?.loc;

    if (!currentParameterLocation) {
      return true;
    }

    const previousParameterEndLine =
      previousParameterLocation.end.line;

    const currentParameterStartLine =
      currentParameterLocation.start.line;

    if (
      previousParameterEndLine
      === currentParameterStartLine
    ) {
      return false;
    }

    const parameterIndent =
      getIndentation(
        context.sourceCode,
        currentParameter);

    if (
      parameterIndent.value
      !== parametersIndent.value
    ) {
      return false;
    }
  }

  let closingParen: TSESTree.Token | null = null;

  if (parameters.length > 0) {
    const lastParameter =
      parameters[parameters.length - 1];

    const lastParameterLocation = lastParameter?.loc;

    if (!lastParameterLocation) {
      return true;
    }

    closingParen =
      context.sourceCode
      .getTokenAfter(
        lastParameter);

    if (
      !closingParen
      || closingParen.type
         !== 'Punctuator'
      || closingParen.value !== ')'
    ) {
      return true;
    }

    const closingParenLocation = closingParen?.loc;

    if (!closingParenLocation) {
      return true;
    }

    const closingParenEndLine =
      closingParenLocation.end.line;

    if (
      closingParenEndLine
      === lastParameterLocation.end.line
    ) {
      return false;
    }
  } else {
    const openingParenEndLine =
      openingParenLocation.end.line;

    closingParen =
      context.sourceCode
      .getTokenAfter(
        openingParen);

    if (
      !closingParen
      || closingParen.type
         !== 'Punctuator'
      || closingParen.value !== ')'
    ) {
      return true;
    }

    if (!closingParen) {
      return true;
    }

    const closingParenStartLine =
      closingParen.loc.start.line;

    if (
      openingParenEndLine
      === closingParenStartLine
    ) {
      return false;
    }
  }

  const closingParenIndent =
    baseIndent.increase();

  const actualClosingParenIndent =
    getIndentation(
      context.sourceCode,
      closingParen);

  if (
    closingParenIndent.value
    !== actualClosingParenIndent.value
  ) {
    return false;
  }

  return true;
}
