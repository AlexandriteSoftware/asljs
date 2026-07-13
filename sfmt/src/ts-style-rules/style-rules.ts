import { FormatterDefinition }
  from '../formatter.js';
import { callExpressionFormatter }
  from './call-expression.js';
import { conditionalExpressionFormatter }
  from './conditional-expression.js';
import { functionDeclarationFormatter }
  from './function-declaration.js';
import { importFormatter }
  from './import.js';
import { statementSpacingFormatter }
  from './statement-spacing.js';
import { variableDeclarationFormatter }
  from './variable-declaration.js';

export const tsStyleFormatters: FormatterDefinition[] =
  [
  importFormatter,
  functionDeclarationFormatter,
  conditionalExpressionFormatter,
  callExpressionFormatter,
  variableDeclarationFormatter,
  statementSpacingFormatter
];
