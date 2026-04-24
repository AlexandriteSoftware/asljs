import { type BindingTarget, type EventBindingSpec, type ValueBindingSpec } from './types.js';
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
export declare function parseValueBindingExpression(target: BindingTarget, expression: string): ValueBindingSpec;
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
export declare function parseEventBindingExpression(eventName: string, expression: string): EventBindingSpec;
