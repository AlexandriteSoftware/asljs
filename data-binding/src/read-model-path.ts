import { DataModel }
  from './types.js';

export function readModelPath(
    model: DataModel,
    path: string
  ): unknown
{
  if (path === '')
    return null;

  if (hasGetMethod(model))
    return model.get(path);

  return readNestedPath(
    model,
    path);
}

function hasGetMethod(
    value: DataModel
  ): value is DataModel & { get: (path: string) => unknown; }
{
  return typeof (value as { get?: unknown; }).get === 'function';
}

function readNestedPath(
    source: Record<string, unknown>,
    path: string
  ): unknown
{
  const parts =
    path
      .split('.')
      .map(part => part.trim())
      .filter(part => part !== '');

  let current: unknown = source;

  for (const part of parts) {
    if (typeof current !== 'object'
      || current === null
      || !(part in current))
    {
      return null;
    }

    current =
      (current as Record<string, unknown>)[part];
  }

  return current;
}
