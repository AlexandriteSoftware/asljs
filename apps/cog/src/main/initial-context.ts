import { existsSync,
         readFileSync,
         writeFileSync }
  from 'node:fs';
import { Context,
         type ContextDataItem }
  from '../context.js';

interface InitialContextItem
{
  name?: string;
  type: string;
  data: unknown;
}

export function loadInitialContext(
    context: Context,
    path: string | undefined
  ): void
{
  if (path === undefined) {
    return;
  }

  const value =
    JSON.parse(
      readFileSync(
        path,
        'utf8')) as unknown;

  if (!Array.isArray(value)) {
    throw new Error(
      'Initial context must be a JSON array');
  }

  for (const item of value) {
    validateInitialContextItem(
      item);

    context.setData(
      item.name
        ?? item.type,
      item.data,
      item.type);
  }
}

export function loadPersistedContext(
    context: Context,
    path: string | undefined
  ): void
{
  if (
    path !== undefined
    && existsSync(
      path)
  ) {
    loadInitialContext(
      context,
      path);
  }
}

export function saveContext(
    context: Context,
    path: string
  ): void
{
  const items =
    context.dataItems()
    .map(
      toInitialContextItem);

  writeFileSync(
    path,
    `${
      JSON.stringify(
        items,
        null,
        2)
    }\n`);
}

function toInitialContextItem(
    item: ContextDataItem
  ): InitialContextItem
{
  return item.name === item.type
    ? { type: item.type,
        data: item.data }
    : { name: item.name,
        type: item.type,
        data: item.data };
}

function validateInitialContextItem(
    value: unknown
  ): asserts value is InitialContextItem
{
  const item =
    value as Record<string, unknown>;

  if (
    typeof value
    !== 'object'
    || value === null
    || Array.isArray(value)
    || typeof item.type
       !== 'string'
    || item.type === ''
    || item.name !== undefined
       && (typeof item.name
           !== 'string'
           || item.name === '')
    || !Object.hasOwn(
      item,
      'data')
  ) {
    throw new Error(
      'Each initial context item must have type and data, with an optional name');
  }
}
