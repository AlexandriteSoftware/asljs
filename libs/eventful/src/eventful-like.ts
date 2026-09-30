import { isFunction,
         isObject }
  from './guards.js';
import { EventName,
         Listener }
  from './types.js';

export interface EventfulLike
{
  on(
    event: EventName,
    listener: Listener
  ): () => boolean;
}

export function isEventfulLike(
    value: unknown
  ): value is EventfulLike
{
  if (
    !isObject(value)
    && !isFunction(value)
  ) {
    return false;
  }

  return typeof (value as { on?: unknown; }).on === 'function';
}

export function asEventfulLike(
    value: unknown
  ): EventfulLike | undefined
{
  if (isEventfulLike(value)) {
    return value;
  }

  return undefined;
}
