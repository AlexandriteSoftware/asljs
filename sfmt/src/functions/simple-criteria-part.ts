import { type TSESTree }
  from '@typescript-eslint/typescript-estree';

export interface CriteriaPartFormattingOptions
{
  getText: (
    expression: TSESTree.Expression
  ) => string;
}

export function criteriaPartIsSimple(
    expression: TSESTree.Expression | TSESTree.PrivateIdentifier,
    options: CriteriaPartFormattingOptions
  ): boolean
{
  if (expression.type === 'PrivateIdentifier') {
    return false;
  }

  if (isSingleCharacterStringLiteral(expression)) {
    return true;
  }

  const text =
    options.getText(
      expression)
    .trim();

  return /^-?\d+$/.test(
    text)
    && text.length <= 3;
}

function isSingleCharacterStringLiteral(
    expression: TSESTree.Expression
  ): boolean
{
  if (expression.type !== 'Literal') {
    return false;
  }

  if (
    typeof expression.value
    !== 'string'
  ) {
    return false;
  }

  return [ ...expression.value ].length === 1;
}
