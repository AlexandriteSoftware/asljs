import {
    ObservableWatchFn
  } from './types.js';
import {
    functionTypeGuard,
    isFunction,
    isObject,
  } from './guards.js';

function splitPath(
    path: string
  ): string[]
{
  return path
    .split('.')
    .map(segment => segment.trim())
    .filter(segment => segment !== '');
}

function readPathValue(
    source: any,
    path: string
  ): any
{
  const segments =
    splitPath(path);

  if (segments.length === 0) {
    return undefined;
  }

  let current = source;

  for (const segment of segments) {
    if (!isObject(current)
      || !(segment in current))
    {
      return undefined;
    }

    current = (current as any)[segment];
  }

  return current;
}

export const watchImpl: ObservableWatchFn =
  (
      target,
      properties,
      callback
    ): () => boolean =>
  {
    if (Array.isArray(target)) {
      throw new TypeError(
        'Watching arrays is not supported.');
    }

    functionTypeGuard(callback);

    if (!isFunction((target as any).on)) {
      throw new TypeError(
        'Expect an eventful object with on().');
    }

    if (!Array.isArray(properties)) {
      throw new TypeError(
        'Expect properties to be an array.');
    }

    for (const property of properties) {
      if (typeof property !== 'string') {
        throw new TypeError(
          'Expect properties to be an array of strings.');
      }
    }

    const getValues =
      (): any =>
        properties.map(
          property =>
            readPathValue(
              target,
              property)) as any;

    const unwatchers: Array<() => boolean> = [];

    for (const property of properties) {
      const segments =
        splitPath(property);

      if (segments.length === 0) {
        continue;
      }

      let unwatchPath: (() => boolean) | null = null;

      const bindPath =
        (): (() => boolean) =>
      {
        const localUnwatchers: Array<() => boolean> = [];

        const bindFrom =
          (
            current: any,
            index: number
          ): void =>
        {
          if (!isObject(current)
            || !isFunction((current as { on?: unknown; }).on)
            || index >= segments.length)
          {
            return;
          }

          const segment =
            segments[index];

          const unwatch =
            (current as { on: (event: string, listener: () => void) => () => boolean; }).on(
              `set:${segment}`,
              () => {
                callback(...getValues());

                if (index < segments.length - 1
                  && unwatchPath)
                {
                  unwatchPath();
                  unwatchPath = bindPath();
                }
              });

          localUnwatchers.push(unwatch);

          if (index < segments.length - 1) {
            bindFrom(
              (current as Record<string, unknown>)[segment],
              index + 1);
          }
        };

        bindFrom(
          target,
          0);

        return () : boolean =>
          localUnwatchers.reduce(
            (result, unwatch) =>
              unwatch() || result,
            false);
      };

      unwatchPath = bindPath();

      unwatchers.push(
        () => unwatchPath
          ? unwatchPath()
          : false);
    }

    callback(...getValues());

    return () : boolean =>
      unwatchers.reduce(
        (result, unwatch) =>
          unwatch() || result,
        false);
  };

export function ensureWatchMethod(
    target: any,
    watchFn: ObservableWatchFn
  ): void
{
  if ('watch' in target)
    return;

  Object.defineProperty(
    target,
    'watch',
    { configurable: true,
      writable: true,
      enumerable: false,
      value(
          properties: readonly string[],
          callback: (...values: any[]) => void
        ): () => boolean
      {
        return watchFn(
          this as any,
          properties,
          callback);
      } });
}
