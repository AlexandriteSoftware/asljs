const LONG_IDENTIFIER_LENGTH = 15;

export default {
  meta:
    { type: 'layout',
      fixable: 'code',
      schema: [] },
  create(context)
  {
    return {
      VariableDeclarator(node) {
        if (!node.init) {
          return;
        }

        const correctLayout =
          checkLayout(
            node,
            context);

        if (correctLayout) {
          return;
        }

        context.report(
          {
            node,
            message:
              'Use asljs variable declaration style.',

            fix(fixer) {
              const sourceCode =
                context.sourceCode;

              const newLine =
                sourceCode.text.includes('\r\n')
                  ? '\r\n'
                  : '\n';

              const formattingContext =
                { newLine };

              const replacement =
                buildVariableDeclarator(
                  node,
                  sourceCode,
                  formattingContext);

              return fixer.replaceText(
                node,
                replacement);
            },
          });
      },
    };
  },
};

function checkLayout(
  node,
  context)
{
  if (
    initializerIsShortEnoughToStayOnSameLine(
      node.init)
  ) {
    return true;
  }

  const equalsToken =
    context.sourceCode.getTokenBefore(
      node.init,
      token => token.value === '=');

  return equalsToken.loc.end.line
         < node.init.loc.start.line;
}

function initializerIsShortEnoughToStayOnSameLine(
  initializer)
{
  if (initializer.type === 'Identifier') {
    return initializer.name.length < LONG_IDENTIFIER_LENGTH;
  }

  if (initializer.type === 'Literal') {
    return initializer.raw.length < LONG_IDENTIFIER_LENGTH;
  }

  if (initializer.type === 'ObjectExpression') {
    return initializer.properties.length === 0;
  }

  if (initializer.type === 'ArrayExpression') {
    return initializer.elements.length === 0;
  }

  if (initializer.type === 'UnaryExpression') {
    return initializerIsShortEnoughToStayOnSameLine(
      initializer.argument);
  }

  return false;
}

function buildVariableDeclarator(
  node,
  sourceCode,
  formattingContext)
{
  const code =
    [ ];

  const idText =
    sourceCode.getText(
      node.id);

  const initText =
    sourceCode.getText(
      node.init);

  code.push(idText);
  code.push(' =');

  if (
    initializerIsShortEnoughToStayOnSameLine(
      node.init)
  ) {
    code.push(' ');
    code.push(initText);
  } else {
    const indentation =
      getIndentation(
        sourceCode,
        node);

    code.push(
      formattingContext.newLine);

    code.push(indentation);
    code.push('  ');
    code.push(initText);
  }

  return code.join('');
}

function getIndentation(
  sourceCode,
  node)
{
  const equalsToken =
    sourceCode.getTokenBefore(
      node.init,
      token => token.value === '=');

  const line =
    sourceCode.lines[
      equalsToken.loc.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}