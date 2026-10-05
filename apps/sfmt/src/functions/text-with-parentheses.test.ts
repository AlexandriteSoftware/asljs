import tsParser
  from '@typescript-eslint/parser';
import { type TSESLint,
         type TSESTree }
  from '@typescript-eslint/utils';
import { Linter,
         type Rule }
  from 'eslint';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { getLocationWithParentheses,
         getTextWithParentheses }
  from './text-with-parentheses.js';

test(
  'getTextWithParentheses: returns the text of a node without parentheses as it is',
  (): void =>
  {
    assert.deepEqual(
      collect(
        'a = x;',
        getTextWithParentheses),
      [ 'x' ]);
  });

test(
  'getTextWithParentheses: includes every pair of parentheses around the node',
  (): void =>
  {
    assert.deepEqual(
      collect(
        'a = (x);\nb = ( (x) );',
        getTextWithParentheses),
      [ '(x)',
        '( (x) )' ]);
  });

test(
  'getTextWithParentheses: leaves out the parentheses of the parent syntax',
  (): void =>
  {
    assert.deepEqual(
      collect(
        'fn(x);\nfn((x));\nif ((x)) { }',
        getTextWithParentheses),
      [ 'x',
        '(x)',
        '(x)' ]);
  });

test(
  'getLocationWithParentheses: starts at the opening and ends after the closing parenthesis',
  (): void =>
  {
    assert.deepEqual(
      collect(
        'a = x;\na = ( x );',
        getLocationWithParentheses),
      [ { start:
            { line: 1,
              column: 4 },
          end:
            { line: 1,
              column: 5 } },
        { start:
            { line: 2,
              column: 4 },
          end:
            { line: 2,
              column: 9 } } ]);
  });

/**
 * Lints `code` and applies `read` to every identifier named `x` in it.
 */
function collect<T>(
    code: string,
    read: (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.Node
  ) => T
  ): T[]
{
  const results: T[] = [ ];

  const rule =
    { create:
        (context: TSESLint.RuleContext<string, readonly unknown[]>) => ({ 'Identifier[name="x"]':
                                                                            (
                                                                                node: TSESTree.Identifier
                                                                              ) =>
                                                                            {
        results.push(
          read(
            context.sourceCode,
            node));
      } }) };

  const messages =
    new Linter().verify(
      code,
      { languageOptions:
          { parser: tsParser },
        plugins:
          { test:
              { rules:
                  { collect:
                      rule as unknown as Rule.RuleModule } } },
        rules:
          { 'test/collect': 'error' } });

  assert.deepEqual(
    messages,
    [ ]);

  return results;
}
