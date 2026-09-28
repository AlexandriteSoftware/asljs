import { type TSESTree }
  from '@typescript-eslint/typescript-estree';
import { criteriaPartIsSimple }
  from '../functions/simple-criteria-part.js';
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

type OperandSide =
  | 'left'
  | 'right';

/**
 * Binds looser than every operator in getOperatorPriority.
 */
const LOOSEST_PRIORITY =
  0;

/**
 * Priority of the relational operators, which `as` and `satisfies` share.
 */
const RELATIONAL_PRIORITY =
  8;

/**
 * Binds tighter than every operator in getOperatorPriority.
 */
const ATOMIC_PRIORITY =
  13;

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
      expression.operator,
      'left',
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
      expression.operator,
      'right',
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
    && hasSimpleCriteriaPartOperand(
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
    parentOperator: string,
    side: OperandSide,
    options: CriteriaExpressionFormattingOptions
  ): string
{
  const operandPriority =
    getOperandPriority(
      expression);

  const formatted =
    isOperationExpression(expression)
    ? formatOperationExpression(
      expression,
      options)
    : options.getText(expression);

  // Source parentheses are not part of the operand node, so an operand that
  // binds looser than its parent has to be parenthesised again here. Equal
  // priority needs them too, on the side the operator does not associate
  // towards, as in `a - (b - c)`.
  const needsParentheses =
    operandPriority < parentPriority
    || (operandPriority === parentPriority
      && side === getNonAssociativeSide(parentOperator));

  if (needsParentheses) {
    return `(${formatted})`;
  }

  return formatted;
}

function getNonAssociativeSide(
    operator: string
  ): OperandSide
{
  return operator === '**'
    ? 'left'
    : 'right';
}

/**
 * Returns the priority of an operand, on the scale of getOperatorPriority.
 *
 * Operands that bind tighter than every operator on that scale, such as
 * identifiers, member accesses, calls and unary expressions, never need
 * parentheses and get ATOMIC_PRIORITY.
 */
function getOperandPriority(
    expression: TSESTree.Expression | TSESTree.PrivateIdentifier
  ): number
{
  if (isOperationExpression(expression)) {
    return getOperationPriority(
      expression);
  }

  switch (expression.type) {
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
      return RELATIONAL_PRIORITY;

    case 'ConditionalExpression':
    case 'AssignmentExpression':
    case 'ArrowFunctionExpression':
    case 'YieldExpression':
    case 'SequenceExpression':
      return LOOSEST_PRIORITY;

    default:
      return ATOMIC_PRIORITY;
  }
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

function hasSimpleCriteriaPartOperand(
    expression: OperationExpression,
    options: CriteriaExpressionFormattingOptions
  ): boolean
{
  return criteriaPartIsSimple(
    expression.left,
    options)
    || criteriaPartIsSimple(
      expression.right,
      options);
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
