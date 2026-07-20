export type KeyRecord = { [key: string]: any; };

export type KeyPath<R extends KeyRecord> =
  | (string & keyof R)[]
  | (string & keyof R);

function keyPathItemValid(
    keyPathItem: string
  ): boolean
{
  return typeof keyPathItem === 'string'
    && keyPathItem.length > 0;
}

export function keyPathValid(
    keyPath: string | string[]
  ): boolean
{
  if (Array.isArray(keyPath)) {
    if (keyPath.length < 1) {
      return false;
    }

    return keyPath.every(
      keyPathItemValid);
  }

  return keyPathItemValid(keyPath);
}

export function keyPathAssert(
    keyPath: string | string[]
  ): asserts keyPath is string | string[]
{
  if (!keyPathValid(keyPath)) {
    throw new TypeError(
      'Key path must be a non-empty string or an array of non-empty strings.'
    );
  }
}

export function keyValueValid(
    value: any
  ): boolean
{
  if (
    value === null
    || value === undefined
  ) {
    return false;
  }

  if (typeof value === 'string') {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (value instanceof Date) {
    return !Number.isNaN(
      value.getTime());
  }

  if (value instanceof ArrayBuffer) {
    return true;
  }

  if (ArrayBuffer.isView(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!(i in value)) {
        return false;
      }

      if (
        !keyValueValid(
          value[i])
      ) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function keyValueAssert(
    value: any
  ): asserts value is IDBValidKey
{
  if (!keyValueValid(value)) {
    throw new TypeError(
      'Value is not a valid IndexedDB key value.'
    );
  }
}

export function keyValid(
    keyPath: string | string[],
    key: IDBValidKey
  ): boolean
{
  if (!Array.isArray(keyPath)) {
    return !Array.isArray(key)
      && keyValueValid(key);
  }

  if (keyPath.length === 1) {
    return !Array.isArray(key)
      && keyValueValid(key);
  }

  return Array.isArray(key)
    && key.length === keyPath.length
    && key.every(keyValueValid);
}

export function keyAssert(
    keyPath: string | string[],
    key: IDBValidKey
  ): asserts key is IDBValidKey
{
  const keyPathLength =
    Array.isArray(keyPath)
    ? keyPath.length
    : 1;

  if (
    !keyValid(
      keyPath,
      key)
  ) {
    throw new TypeError(
      keyPathLength === 1
        ? 'Key must be a single value.'
        : `Key must be an array of length ${keyPathLength}.`
    );
  }
}

export function keyEqual(
    a: IDBValidKey,
    b: IDBValidKey
  ): boolean
{
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length
      && a.every(
        (v, i) =>
          keyEqual(
            v,
            (b as IDBValidKey[])[i]!));
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  return a === b;
}

export function keyGet<R extends KeyRecord>(
    keyPath: KeyPath<R>,
    record: R
  ): IDBValidKey
{
  if (!Array.isArray(keyPath)) {
    const keyValue =
      record[keyPath];

    keyValueAssert(keyValue);

    return keyValue;
  }

  if (keyPath.length === 1) {
    const keyValue =
      record[keyPath[0]];

    keyValueAssert(keyValue);

    return keyValue;
  }

  const key =
    new Array<IDBValidKey>(
    keyPath.length
  );

  for (let i = 0; i < keyPath.length; i++) {
    const keyValue =
      record[keyPath[i]];

    keyValueAssert(keyValue);

    key[i] = keyValue;
  }

  return key;
}
