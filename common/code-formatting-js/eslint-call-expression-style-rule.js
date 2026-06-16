const LONG_IDENTIFIER_LENGTH = 15;

export default {
  meta:
    { type: 'layout',
      fixable: 'code',
      schema: [] },
  create(context) {
    return {
      CallExpression(node) {
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
            message: 'Use asljs call expression style.',
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
                buildCallExpression(
                  node,
                  sourceCode,
                  formattingContext);

              return fixer.replaceText(
                node,
                replacement);
            }
          });
      },
    };
  },
};

/**
 * Checks that:
 * 
 * - Complex function call expressions are on a separate line. Complex is:
 *   - single variable or literal that is longer than 15 characters, or
 *   - expression that is not a single variable or literal.
 * - Multiple function call parameters are on separate lines
 */
function checkLayout(
  node,
  context)
{
  const argumentsList =
    node.arguments;

  if (argumentsList.length === 0) {
    return true;
  }

  const openingParenthesis =
    context.sourceCode.getTokenAfter(
      node.callee,
      token => token.value === '(');

  const indent =
    getIndentation(
      context.sourceCode,
      openingParenthesis);

  const requiredArgumentIndent =
    indent + '  ';

  if (argumentsList.length === 1) {
    const argument =
      argumentsList[0];

    const isShortParameter =
      argumentIsShortEnoughToStayOnSameLine(argument);

    if (isShortParameter
        && openingParenthesis.loc.end.line === argument.loc.start.line)
    {
        return true;
    }

    const argumentIndent =
      getIndentation(
        context.sourceCode,
        argument);

    return requiredArgumentIndent === argumentIndent;
  }

  // Multiple arguments: each argument must start
  // on a separate line.
  for (
    let index = 0;
    index < argumentsList.length;
    index++)
  {
    const argument =
      argumentsList[index];

    if (index === 0) {
      if (openingParenthesis.loc.end.line === argument.loc.start.line) {
        return false;
      }
    } else {
      const previousArgument =
        argumentsList[index - 1];

      if (previousArgument.loc.end.line === argument.loc.start.line) {
        return false;
      }
    }

    const argumentIndent =
      getIndentation(
        context.sourceCode,
        argument);

    if (requiredArgumentIndent !== argumentIndent) {
      return false;
    }
  }

  return true;
}

function argumentIsShortEnoughToStayOnSameLine(
  argument)
{
  if (argument.type === 'Identifier') {
    return argument.name.length < LONG_IDENTIFIER_LENGTH;
  }

  if (argument.type === 'Literal') {
    return argument.raw.length < LONG_IDENTIFIER_LENGTH;
  }

  return false;
}

function buildCallExpression(
  node,
  sourceCode,
  formattingContext)
{
  const openingParenthesis =
    sourceCode.getTokenAfter(
      node.callee,
      token => token.value === '(');

  const indent =
    getIndentation(
      sourceCode,
      openingParenthesis);

  const requiredArgumentIndent =
    indent + '  ';

  const code =
    [ ];

  const callee =
    sourceCode.getText(
      node.callee);

  code.push(callee);
  code.push('(');

  if (node.arguments.length === 1) {
    const argument =
      node.arguments[0];

    const argumentText =
      sourceCode.getText(argument);

    if (argumentIsShortEnoughToStayOnSameLine(argument)) {
      if (openingParenthesis.loc.end.line !== argument.loc.start.line) {
        code.push(
          formattingContext.newLine);

        code.push(
          requiredArgumentIndent);
      }

      code.push(
        argumentText);
    } else {
      code.push(
        formattingContext.newLine);

      code.push(
        requiredArgumentIndent);

      code.push(argumentText);
    }
  } else if (node.arguments.length > 1) {
    for (
      let index = 0;
      index < node.arguments.length;
      index++)
    {
      if (index > 0) {
        code.push(',');
      }

      const argument =
        node.arguments[index];

      const argumentText =
        sourceCode.getText(argument);

      code.push(
        formattingContext.newLine);

      code.push(
        requiredArgumentIndent);

      code.push(argumentText);
    }
  }

  code.push(')');

  return code.join('');
}

function getIndentation(
  sourceCode,
  node)
{
  const line =
    sourceCode.lines[node.loc.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}