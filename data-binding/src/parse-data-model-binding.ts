import {
    type BindingTarget,
    type EventBindingSpec,
    type EventMiddlewareSpec,
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
 *   'activate | preventDefault');
 * ```
 */
export function parseEventBindingExpression(
    eventName: string,
    expression: string
  ): EventBindingSpec
{
  const segments =
    expression
      .split('|')
      .map(segment => segment.trim())
      .filter(segment => segment !== '');

  const actionPath =
    segments[0] ?? '';

  const middleware =
    segments
      .slice(1)
      .map(parseEventMiddleware)
      .filter((item): item is EventMiddlewareSpec => item !== null);

  return {
    kind: 'event',
    eventName,
    actionPath,
    middleware
  };
}

function parsePipe(
    text: string
  ): PipeSpec | null
{
  const tokens =
    text
      .split(':')
      .map(token => token.trim());

  const name =
    tokens[0] ?? '';

  if (name === '') {
    return null;
  }

  return {
    name,
    args: tokens.slice(1)
  };
}

function parseEventMiddleware(
    text: string
  ): EventMiddlewareSpec | null
{
  const tokens =
    text
      .split(':')
      .map(token => token.trim());

  const name =
    tokens[0] ?? '';

  if (name === '') {
    return null;
  }

  return {
    name,
    args: tokens.slice(1)
  };
}
