export default {
  meta: {
    type: 'layout',
    fixable: 'code',
    schema: [],
  },

  create(context) {
    return {
      FunctionDeclaration(node) {
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
            message: 'Use asljs function declaration style.',
            fix(fixer) {
              const newLine =
                context.sourceCode.text.includes('\r\n')
                  ? '\r\n'
                  : '\n';

              const formattingContext =
                { newLine };

              const replacement =
                buildFunctionDeclaration(
                  node,
                  context,
                  formattingContext);

              return fixer.replaceText(
                node,
                replacement);
            },
          });
      }
    };
  },
};

/**
 * Checks that function parameters are on separate lines and the opening brace
 * is on a new line.
 */
function checkLayout(
  node,
  context)
{
  const parameters =
    node.params;

  if (parameters.length > 1) {
    for (let index = 1;
          index < parameters.length;
          index++)
    {
      const previousParameter =
        parameters[index - 1];

      const currentParameter =
        parameters[index];

      if (
        previousParameter.loc.end.line
        === currentParameter.loc.start.line
      ) {
        return false;
      }
    }
  }

  const closingParen =
    context.sourceCode.getTokenBefore(node.body);

  if (
    closingParen
    && closingParen.loc.end.line
      === node.body.loc.start.line
  ) {
    return false;
  }

  return true;
}

function buildFunctionDeclaration(
  node,
  context,
  formattingContext)
{
  const name =
    node.id?.name ?? '';

  const body =
    node.body;

  const parameters =
    node.params.map(
      parameter =>
        context.sourceCode.getText(parameter));

  const code =
    [ ];

  if (node.async) {
    code.push('async ');
  }

  code.push('function ');

  if (name) {
    code.push(name);
  }

  code.push('(');

  if (parameters.length === 0) {
    code.push(')');
  } else {
    code.push(
      formattingContext.newLine);

    for (let index = 0;
          index < parameters.length;
          index++)
    {
      code.push(
        `  ${parameters[index]}`);
      if (index < parameters.length - 1) {
        code.push(',');
      }
      if (index < parameters.length - 1) {
        code.push(
          formattingContext.newLine);
      }
    }

    code.push(')');
  }

  code.push(
    formattingContext.newLine);

  code.push(
    context.sourceCode.getText(body));
 
  return code.join('');
}