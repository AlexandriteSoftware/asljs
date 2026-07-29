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
  from '../logging.js';
import { fmtTypeAliasDeclaration }
  from '../ts-fmt/fmt-type-alias-declaration.js';

const messages: Record<string, string> =
  { 'use-asljs-type-alias-declaration-style':
      'Use asljs type alias declaration style.' };

const formatterDefinitionFactory: FormatterDefinitionFactory =
  tsFormatterFactory(
    'type-alias-declaration',
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
      { TSTypeAliasDeclaration: listener };

    return ruleListener;

    function listener(
        node: TSESTree.TSTypeAliasDeclaration
      ): void
    {
      processTypeAliasDeclaration(
        logger,
        context,
        node);
    }
  };

  return listenerFactory;
}

function processTypeAliasDeclaration(
    logger: Logger,
    context: TSESLint.RuleContext<string, readonly unknown[]>,
    node: TSESTree.TSTypeAliasDeclaration
  ): void
{
  if (
    node.typeAnnotation.type
    !== 'TSFunctionType'
  ) {
    return;
  }

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
        'use-asljs-type-alias-declaration-style',
      fix:
        (
        fixer: TSESLint.RuleFixer
      ): TSESLint.RuleFix =>
      {
        const replacement =
          fmtTypeAliasDeclaration(
            node,
            fmtCtx);

        return fixer.replaceText(
          node,
          replacement);
      } });
}

function checkLayout(
    node: TSESTree.TSTypeAliasDeclaration,
    context: FormattingContext
  ): boolean
{
  const functionType = node.typeAnnotation;

  if (functionType.type !== 'TSFunctionType') {
    return true;
  }

  const baseIndent =
    getIndentation(
      context.sourceCode,
      node);

  const openingParenIndent =
    baseIndent.increase();

  const parametersIndent =
    baseIndent.increase(2);

  const equalsToken =
    context.sourceCode.getTokenBefore(
      functionType,
      token => token.value === '=');

  const equalsLocation = equalsToken?.loc;

  if (!equalsLocation) {
    return true;
  }

  let openingParen: TSESTree.Token | null = null;

  if (functionType.typeParameters) {
    openingParen =
      context.sourceCode.getTokenAfter(
        functionType.typeParameters);
  } else {
    openingParen =
      context.sourceCode.getFirstToken(
        functionType);
  }

  if (
    !openingParen
    || openingParen.type !== 'Punctuator'
    || openingParen.value !== '('
  ) {
    return true;
  }

  const openingParenLocation = openingParen.loc;

  if (!openingParenLocation) {
    return true;
  }

  if (
    equalsLocation.end.line
    === openingParenLocation.start.line
  ) {
    return false;
  }

  const actualOpeningParenIndent =
    getIndentation(
      context.sourceCode,
      openingParen);

  if (
    actualOpeningParenIndent.value
    !== openingParenIndent.value
  ) {
    return false;
  }

  const parameters = functionType.params;

  if (
    parameters.length
    > 0
  ) {
    const firstParameter = parameters[0];

    const firstParameterLocation = firstParameter?.loc;

    if (!firstParameterLocation) {
      return true;
    }

    if (
      openingParenLocation.end.line
      === firstParameterLocation.start.line
    ) {
      return false;
    }

    const firstParameterIndent =
      getIndentation(
        context.sourceCode,
        firstParameter);

    if (
      firstParameterIndent.value
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

    if (
      previousParameterLocation.end.line
      === currentParameterLocation.start.line
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

  if (
    parameters.length
    > 0
  ) {
    const lastParameter =
      parameters[parameters.length - 1];

    const lastParameterLocation = lastParameter?.loc;

    if (!lastParameterLocation) {
      return true;
    }

    closingParen =
      context.sourceCode.getTokenAfter(
        lastParameter);

    if (
      !closingParen
      || closingParen.type !== 'Punctuator'
      || closingParen.value !== ')'
    ) {
      return true;
    }

    const closingParenLocation = closingParen.loc;

    if (!closingParenLocation) {
      return true;
    }

    if (
      lastParameterLocation.end.line
      === closingParenLocation.start.line
    ) {
      return false;
    }
  } else {
    closingParen =
      context.sourceCode.getTokenAfter(
        openingParen as unknown as TSESTree.Node);

    if (
      !closingParen
      || closingParen.type !== 'Punctuator'
      || closingParen.value !== ')'
    ) {
      return true;
    }

    const closingParenLocation = closingParen.loc;

    if (!closingParenLocation) {
      return true;
    }

    if (
      openingParenLocation.end.line
      === closingParenLocation.start.line
    ) {
      return false;
    }
  }

  const closingParenIndent =
    getIndentation(
      context.sourceCode,
      closingParen);

  if (
    closingParenIndent.value
    !== openingParenIndent.value
  ) {
    return false;
  }

  const arrowToken =
    context.sourceCode.getTokenAfter(
      closingParen as unknown as TSESTree.Node);

  if (
    !arrowToken
    || arrowToken.type !== 'Punctuator'
    || arrowToken.value !== '=>'
  ) {
    return true;
  }

  const arrowLocation = arrowToken.loc;

  if (!arrowLocation) {
    return true;
  }

  if (
    arrowLocation.start.line
    !== closingParen.loc?.start.line
  ) {
    return false;
  }

  const returnType =
    functionType.returnType;

  if (!returnType) {
    return true;
  }

  const returnTypeNode =
    returnType.typeAnnotation;

  const returnTypeLocation = returnTypeNode.loc;

  if (!returnTypeLocation) {
    return true;
  }

  if (
    returnTypeLocation.start.line
    === arrowLocation.end.line
  ) {
    return false;
  }

  const returnTypeIndent =
    getIndentation(
      context.sourceCode,
      returnTypeNode);

  if (
    returnTypeIndent.value
    !== parametersIndent.value
  ) {
    return false;
  }

  return true;
}
