import { BinaryExpression,
         Expression,
         LogicalExpression }
  from 'estree';

export interface CriteriaExpressionFormattingOptions
{
  getText: (expression: Expression) => string;

  newLine: string;

  continuationIndentation: string;
}

type OperationExpression =
  BinaryExpression
  | LogicalExpression;

export function formatCriteriaExpression(
    expression: Expression,
    options: CriteriaExpressionFormattingOptions
  ): string
{
  if (!isOperationExpression(expression)) {
    return options.getText(expression);
  }

  const maxPriority =
    getMaxPriority(
      expression);

  return formatOperationExpression(
    expression,
    maxPriority,
    options);
}

function formatOperationExpression(
    expression: OperationExpression,
    maxPriority: number,
    options: CriteriaExpressionFormattingOptions
  ): string
{
  const operatorPriority =
    getOperationPriority(
      expression);

  const separator =
    operatorPriority === maxPriority
    ? ` ${expression.operator} `
    : `${options.newLine}${options.continuationIndentation}${expression.operator} `;

  const left =
    formatOperand(
      expression.left as Expression,
      operatorPriority,
      maxPriority,
      options);

  const right =
    formatOperand(
      expression.right,
      operatorPriority,
      maxPriority,
      options);

  return `${left}${separator}${right}`;
}

function formatOperand(
    expression: Expression,
    parentPriority: number,
    maxPriority: number,
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
      maxPriority,
      options);

  if (operatorPriority < parentPriority) {
    return `(${formatted})`;
  }

  return formatted;
}

function getMaxPriority(
    expression: OperationExpression
  ): number
{
  const ownPriority =
    getOperationPriority(
      expression);

  const leftPriority =
    tryGetMaxPriority(
      expression.left as Expression);

  const rightPriority =
    tryGetMaxPriority(
      expression.right);

  return Math.max(
    ownPriority,
    leftPriority ?? ownPriority,
    rightPriority ?? ownPriority);
}

function tryGetMaxPriority(
    expression: Expression
  ): number | null
{
  if (!isOperationExpression(expression)) {
    return null;
  }

  return getMaxPriority(
    expression);
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