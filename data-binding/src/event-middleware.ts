import {
    type BindDataModelOptions,
    type EventMiddlewareFn
  } from './types.js';

/**
 * Creates the built-in event middleware registry.
 *
 * Built-ins:
 * - `preventDefault`
 * - `stopPropagation`
 *
 * Middleware is executed from right to left by event binding runtime.
 *
 * @example
 * ```ts
 * const middleware = createBuiltInEventMiddleware();
 * middleware.preventDefault(event, [], { model, element });
 * ```
 */
export function createBuiltInEventMiddleware(
  ): Record<string, EventMiddlewareFn>
{
  return {
    preventDefault: event => {
      event.preventDefault();
    },
    stopPropagation: event => {
      event.stopPropagation();
    }
  };
}

/**
 * Merges built-in event middleware with user middleware.
 * User middleware overrides built-ins with the same name.
 *
 * @example
 * ```ts
 * const middleware = mergeEventMiddleware({
 *   eventMiddleware: {
 *     log: (event) => console.debug(event.type)
 *   }
 * });
 * ```
 */
export function mergeEventMiddleware(
    options: BindDataModelOptions | undefined
  ): Record<string, EventMiddlewareFn>
{
  const builtIns =
    createBuiltInEventMiddleware();

  return {
    ...builtIns,
    ...(options?.eventMiddleware ?? {})
  };
}
