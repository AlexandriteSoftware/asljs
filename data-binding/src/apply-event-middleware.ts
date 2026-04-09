import {
    type DataModel,
    type EventMiddlewareFn,
    type EventMiddlewareSpec
  } from './types.js';

export type EventMiddlewareWarning =
  | { type: 'unknown';
      middlewareName: string; }
  | { type: 'error';
      middlewareName: string;
      error: unknown; };

/**
 * Event middleware executes from right to left so the rightmost modifier
 * runs first on dispatch.
 */
export function applyEventMiddleware(
    event: Event,
    middleware: EventMiddlewareSpec[],
    registry: Record<string, EventMiddlewareFn>,
    context: { model: DataModel; element: Element; },
    onWarning: ((warning: EventMiddlewareWarning) => void) | null = null
  ): void
{
  for (let i = middleware.length - 1; i >= 0; i--) {
    const spec =
      middleware[i];

    const handler =
      registry[spec.name];

    if (!handler) {
      onWarning?.({
        type: 'unknown',
        middlewareName: spec.name
      });

      continue;
    }

    try {
      handler(
        event,
        spec.args,
        context);
    } catch (error) {
      onWarning?.({
        type: 'error',
        middlewareName: spec.name,
        error
      });
    }
  }
}
