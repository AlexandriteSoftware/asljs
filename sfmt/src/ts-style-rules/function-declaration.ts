import { AST,
         Rule }
  from 'eslint';
import { FunctionDeclaration,
         Node }
  from 'estree';
import { FormatterDefinitionFactory,
         formatterFactory,
         RuleListenerFactory }
  from '../formatter.js';
import { FormattingContext }
  from '../formatting-context.js';
import { getIndentation }
  from '../functions/indentations.js';
import { tryGetLocation,
         WithLocation }
  from '../functions/location.js';
import { Logger }
  from '../logging.js';
import { fmtFunctionDeclaration }
  from '../ts-fmt/fmt-function-declaration.js';

const formatterDefinitionFactory: FormatterDefinitionFactory =
  formatterFactory(
    'function-declaration',
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
      { FunctionDeclaration: listener };

    return ruleListener;

    function listener(
        node: FunctionDeclaration
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
    context: Rule.RuleContext,
    node: FunctionDeclaration
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
      message:
        'Use asljs function declaration style.',
      fix:
        (fixer: Rule.RuleFixer): Rule.Fix =>
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
    node: FunctionDeclaration,
    context: FormattingContext
  ): boolean
{
  const baseIndent =
    getIndentation(
      context.sourceCode,
      node as unknown as WithLocation);

  const parametersIndent =
    baseIndent.increase(2);

  const id =
    node.id;

  const typeParameters =
    (node as unknown as { typeParameters: Node | null; }).typeParameters;

  let openingParen: AST.Token | null = null;

  if (typeParameters) {
    openingParen =
      context.sourceCode.getTokenAfter(
        typeParameters as unknown as Node);
  } else {
    openingParen =
      context.sourceCode.getTokenAfter(
        id as unknown as Node);
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
        firstParameter as unknown as WithLocation);

    if (parameterIndent.value !== parametersIndent.value) {
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
        currentParameter as unknown as WithLocation);

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

    closingParen =
      context.sourceCode
      .getTokenAfter(
        lastParameter as unknown as Node);

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

    closingParen =
      context.sourceCode
      .getTokenAfter(
        openingParen as unknown as Node);

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
