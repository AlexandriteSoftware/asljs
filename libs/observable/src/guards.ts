export function isFunction(
    value: any
  ): value is Function
{
  return typeof value === 'function';
}

export function isObject(
    value: any
  ): value is object
{
  return typeof value === 'object'
    && value !== null;
}

export function functionTypeGuard(
    value: any
  ): asserts value is Function
{
  if (!isFunction(value)) {
    throw new TypeError(
      'Expect a function.');
  }
}

const objectSource =
  Function.prototype.toString.call(Object);

/**
 * Whether a prototype is some realm's `Object.prototype`.
 *
 * Each realm (iframe, `vm` context) has its own `Object.prototype`, so an
 * identity check refuses a literal created in another one. That realm's
 * prototype sits at the top of its chain and is owned by a native `Object`.
 */
function isObjectPrototype(
    prototype: any
  ): boolean
{
  if (prototype === Object.prototype) {
    return true;
  }

  if (
    Object.getPrototypeOf(prototype)
    !== null
  ) {
    return false;
  }

  const constructor =
    Object.getOwnPropertyDescriptor(
      prototype,
      'constructor')
      ?.value;

  return isFunction(constructor)
    && constructor.prototype === prototype
    && Function.prototype.toString.call(constructor) === objectSource;
}

export function isPlainObject(
    value: any
  ): value is Record<PropertyKey, unknown>
{
  if (!isObject(value)) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(value);

  return prototype === null
    || isObjectPrototype(prototype);
}
