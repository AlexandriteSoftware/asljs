import { BinaryExpression,
         Expression,
         LogicalExpression }
  from 'estree';

const LONG_EXPRESSION_LENGTH = 15;

export interface CriteriaExpressionFormattingOptions
{
  getText: (expression: Expression) => string;

  newLine: string;
}

type OperationExpression =
  | BinaryExpression
  | LogicalExpression;

export function formatCriteriaExpression(
    expression: Expression,
    options: CriteriaExpressionFormattingOptions
  ): string
{
  if (!isOperationExpression(expression)) {
    return options.getText(expression);
  }

  return formatOperationExpression(
    expression,
    options);
}

/**
 * Keep the operators with priority '===' and higher on the same line,
 * and break the lines for operators with priority '&' and lower.
 * 
 * Examples:
 * 
 * ```ts
 * a + b + c === d + e
 * && f <= g
 * ```
 */
function formatOperationExpression(
    expression: OperationExpression,
    options: CriteriaExpressionFormattingOptions
  ): string
{
  const operatorPriority =
    getOperationPriority(
      expression);

  const leftExpression =
    expression.left as Expression;

  const left =
    formatOperand(
      leftExpression,
      operatorPriority,
      options);

  const shouldBreakBeforeOperator =
    operatorPriority < 7
    || left.includes(
      options.newLine)
    || left.length >= LONG_EXPRESSION_LENGTH;

  const indentation =
    ' '.repeat(
      leftExpression.loc?.start.column
      ?? 0);

  const separator =
    shouldBreakBeforeOperator
    ? `${options.newLine}${indentation}${expression.operator} `
    : ` ${expression.operator} `;

  const right =
    formatOperand(
      expression.right,
      operatorPriority,
      options);

  return `${left}${separator}${right}`;
}

function formatOperand(
    expression: Expression,
    parentPriority: number,
    options: CriteriaExpressionFormattingOptions
  ): string
{
  if (!isOperationExpression(expression)) {
    return options.getText(expression);
  }

  const operatorPriority =
    getOperationPriority(
      expression);

  const formatted =
    formatOperationExpression(
      expression,
      options);

  if (operatorPriority < parentPriority) {
    return `(${formatted})`;
  }

  return formatted;
}

function isOperationExpression(
    expression: Expression
  ): expression is OperationExpression
{
  return expression.type === 'BinaryExpression'
    || expression.type === 'LogicalExpression';
}

function getOperationPriority(
    expression: OperationExpression
  ): number
{
  return getOperatorPriority(
    expression.operator);
}

/**
 * Returns operator priority, from 1 (lowest) to 12 (highest).
 */
function getOperatorPriority(
    operator: string
  ): number
{
  switch (operator) {
    case '??':
      return 1;

    case '||':
      return 2;

    case '&&':
      return 3;

    case '|':
      return 4;

    case '^':
      return 5;

    case '&':
      return 6;

    case '==':
    case '!=':
    case '===':
    case '!==':
      return 7;

    case '<':
    case '<=':
    case '>':
    case '>=':
    case 'in':
    case 'instanceof':
      return 8;

    case '<<':
    case '>>':
    case '>>>':
      return 9;

    case '+':
    case '-':
      return 10;

    case '*':
    case '/':
    case '%':
      return 11;

    case '**':
      return 12;

    default:
      return 0;
  }
}
