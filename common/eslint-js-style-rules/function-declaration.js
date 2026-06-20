/**
 * @typedef
 *   { import('eslint')
 *       .JSRuleDefinition }
 *   JSRuleDefinition
 * @typedef
 *     { import('eslint')
 *        .Rule.RuleListener }
 *  RuleListener
 * @typedef
 *   { import('eslint')
 *       .Rule.RuleContext }
 *  RuleContext
 * @typedef
 *   { import('estree')
 *       .FunctionDeclaration }
 *   FunctionDeclaration
 */

/**
 * @typedef {object} FormattingContext
 * @property {string} newLine
 */

/** @type {JSRuleDefinition} */
export default {
  meta:
    { type: 'layout',
      fixable: 'code',
      schema: [] },
  create(
    context)
  {
    /** @type {RuleListener} */
    return {
      FunctionDeclaration(
        node)
      {
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
 * 
 * @param {FunctionDeclaration} node
 * @param {RuleContext} context
 * @returns {boolean} true if the layout is correct, false otherwise
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

      const previousParameterEndLine =
        previousParameter.loc?.end.line;

      if (previousParameterEndLine === undefined) {
        // If we can't determine the line number, assume it's correct
        return true;
      }

      const currentParameterStartLine =
        currentParameter.loc?.start.line;

      if (currentParameterStartLine === undefined) {
        // If we can't determine the line number, assume it's correct
        return true;
      }

      if (previousParameterEndLine === currentParameterStartLine) {
        return false;
      }
    }
  }

  const closingParen =
    context.sourceCode
      .getTokenBefore(
        node.body);

  if (closingParen === null) {
    // If we can't find the closing parenthesis, assume it's correct
    return true;
  }

  const nodeBodyStartLine =
    node.body.loc?.start.line;

  if (nodeBodyStartLine === undefined) {
    // If we can't determine the line number, assume it's correct
    return true;
  }

  if (closingParen.loc.end.line === nodeBodyStartLine) {
    return false;
  }

  return true;
}

/**
 * 
 * @param {FunctionDeclaration} node 
 * @param {RuleContext} context 
 * @param {FormattingContext} formattingContext 
 * @returns {string}
 */
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