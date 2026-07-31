import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { expressionIsSimple }
  from '../functions/simple-expression.js';

export interface CriteriaExpressionFormattingOptions
{
  getText: (
    expression: TSESTree.Node
  ) => string;

  newLine: string;
}

type OperationExpression =
  | TSESTree.BinaryExpression
  | TSESTree.LogicalExpression;

export function fmtCriteriaExpression(
    expression: TSESTree.Expression,
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

function formatOperationExpression(
    expression: OperationExpression,
    options: CriteriaExpressionFormattingOptions
  ): string
{
  const operatorPriority =
    getOperationPriority(
      expression);

  const isSimple =
    expressionIsSimple(
      expression);

  const shouldBreakBeforeOperator =
    shouldBreakBeforeBinaryOperator(
      expression,
      operatorPriority,
      isSimple,
      options);

  const left =
    formatOperand(
      expression.left,
      operatorPriority,
      options);

  const indentation =
    ' '.repeat(
      expression.left.loc?.start.column
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

function shouldBreakBeforeBinaryOperator(
    expression: OperationExpression,
    operatorPriority: number,
    isSimple: boolean,
    options: CriteriaExpressionFormattingOptions
  ): boolean
{
  if (
    isComparisonOperator(
      expression.operator)
    && hasShortNumericOperand(
      expression,
      options)
  ) {
    return false;
  }

  return !isSimple
    || operatorPriority < 7;
}

function formatOperand(
    expression: TSESTree.Expression | TSESTree.PrivateIdentifier,
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

  if (
    operatorPriority
    < parentPriority
  ) {
    return `(${formatted})`;
  }

  return formatted;
}

function isOperationExpression(
    expression: TSESTree.Expression | TSESTree.PrivateIdentifier
  ): expression is OperationExpression
{
  return expression.type === 'BinaryExpression'
    || expression.type === 'LogicalExpression';
}

function isComparisonOperator(
    operator: string
  ): boolean
{
  return [ '==',
           '!=',
           '===',
           '!==',
           '<',
           '<=',
           '>',
           '>=' ]
    .includes(
      operator);
}

function hasShortNumericOperand(
    expression: OperationExpression,
    options: CriteriaExpressionFormattingOptions
  ): boolean
{
  return isShortNumericExpression(
    expression.left,
    options)
    || isShortNumericExpression(
      expression.right,
      options);
}

function isShortNumericExpression(
    expression: TSESTree.Expression | TSESTree.PrivateIdentifier,
    options: CriteriaExpressionFormattingOptions
  ): boolean
{
  if (expression.type === 'PrivateIdentifier') {
    return false;
  }

  const text =
    options.getText(
      expression)
    .trim();

  return /^-?\d+$/.test(
    text)
    && text.length <= 3;
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
