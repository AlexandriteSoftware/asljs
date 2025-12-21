export function isFunction(
    value: any
  ) : value is Function 
{
  return typeof value === 'function';
}

export function isObject(
    value: any
  ) : value is object 
{
  return typeof value === 'object'
    && value !== null;
}

export function functionTypeGuard(
    value: any
  ) : asserts value is Function 
{
  if (!isFunction(value)) {
    throw new TypeError(
      'Expect a function.');
  }
}
