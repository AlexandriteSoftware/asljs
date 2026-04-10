import {
    type BindingTarget,
    type EventBindingSpec,
    type PipeSpec,
    type ValueBindingSpec
  } from './types.js';

/**
 * Parses a data-bind value expression.
 *
 * @example
 * ```ts
 * parseValueBindingExpression(
 *   { kind: 'text' },
 *   'name | upper');
 * ```
 */
export function parseValueBindingExpression(
    target: BindingTarget,
    expression: string
  ): ValueBindingSpec
{
  const segments =
    expression
      .split('|')
      .map(segment => segment.trim())
      .filter(segment => segment !== '');

  const path =
    segments[0] ?? '';

  const pipes =
    segments
      .slice(1)
      .map(parsePipe)
      .filter((pipe): pipe is PipeSpec => pipe !== null);

  return {
    kind: 'value',
    target,
    path,
    pipes
  };
}

/**
 * Parses a data-bind event expression.
 *
 * @example
 * ```ts
 * parseEventBindingExpression(
 *   'click',
 *   'activate');
 * ```
 */
export function parseEventBindingExpression(
    eventName: string,
    expression: string
  ): EventBindingSpec
{
  const actionPath =
    expression.trim();

  return {
    kind: 'event',
    eventName,
    actionPath
  };
}

function parsePipe(
    text: string
  ): PipeSpec | null
{
  const tokens =
    splitPipeTokens(text);

  const name =
    (tokens[0] ?? '').trim();

  if (name === '') {
    return null;
  }

  return {
    name,
    args: tokens
      .slice(1)
      .map(token => token.trim())
  };
}

function splitPipeTokens(
    text: string
  ): string[]
{
  const tokens: string[] = [];

  let current = '';
  let quote: '\'' | '"' | null = null;

  for (let index = 0; index < text.length; index++) {
    const char =
      text[index];

    if (quote !== null) {
      if (char === quote) {
        quote = null;
        continue;
      }

      current += char;
      continue;
    }

    if (char === '\'' || char === '"') {
      quote = char;
      continue;
    }

    if (char === ':') {
      tokens.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  tokens.push(current);

  return tokens;
}
