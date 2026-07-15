import { EventName }
  from './types.js';

export function eventNameTypeGuard(
  value: unknown
): asserts value is EventName
{
  if (
    typeof value !== 'string'
    && typeof value !== 'symbol'
  ) {
    throw new TypeError(
      'Expect event to be a string or symbol.'
    );
  }
}

export function isFunction(
  value: unknown
): value is Function
{
  return typeof value === 'function';
}

export function asFunction(
  value: unknown
): Function | undefined
{
  if (isFunction(value)) {
    return value;
  }

  return undefined;
}

export function isObject(
  value: unknown
): value is object
{
  return typeof value === 'object'
    && value !== null;
}

export function functionTypeGuard(
  value: unknown
): asserts value is Function
{
  if (!isFunction(value)) {
    throw new TypeError(
      'Expect a function.'
    );
  }
}
