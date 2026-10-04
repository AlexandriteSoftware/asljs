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

/**
 * Whether a value is an array whose prototype is some realm's
 * `Array.prototype`.
 *
 * Every realm's `Array.prototype` is itself an array, while the prototype of a
 * subclass instance is not, so the check needs no identity comparison.
 */
export function isPlainArray(
    value: any
  ): value is unknown[]
{
  return Array.isArray(value)
    && Array.isArray(
      Object.getPrototypeOf(value));
}

const getTime =
  Date.prototype.getTime;

const regExpSource =
  Object.getOwnPropertyDescriptor(
    RegExp.prototype,
    'source')!.get!;

/**
 * Whether a value is a `Date` from any realm.
 *
 * `instanceof` only recognises this realm's `Date`. `getTime` throws for
 * anything without a `Date`'s internal slot, so calling it is a brand check.
 */
export function isDateValue(
    value: any
  ): value is Date
{
  if (!isObject(value)) {
    return false;
  }

  if (value instanceof Date) {
    return true;
  }

  try {
    getTime.call(value);

    return true;
  } catch {
    return false;
  }
}

/** Whether a value is a `RegExp` from any realm, by the same kind of check. */
export function isRegExpValue(
    value: any
  ): value is RegExp
{
  if (!isObject(value)) {
    return false;
  }

  if (value instanceof RegExp) {
    return true;
  }

  try {
    regExpSource.call(value);

    return true;
  } catch {
    return false;
  }
}
