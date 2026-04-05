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
  if (path.trim() === '') {
    throw new TypeError(
      'Expect watch path to be a non-empty string.');
  }

  const rawSegments =
    path.split('.');

  for (const rawSegment of rawSegments) {
    if (rawSegment.trim() === '') {
      throw new TypeError(
        'Expect watch path segments to be non-empty.');
    }
  }

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
      target: any,
      properties: readonly string[] | string,
      callback: (...values: any[]) => void
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

    const propertiesList =
      typeof properties === 'string'
        ? [ properties ]
        : properties;

    if (!Array.isArray(propertiesList)) {
      throw new TypeError(
        'Expect properties to be a string or an array of strings.');
    }

    for (const property of propertiesList) {
      if (typeof property !== 'string') {
        throw new TypeError(
          'Expect properties to be a string or an array of strings.');
      }

      splitPath(property);
    }

    const getValues =
      (): any =>
        propertiesList.map(
          property =>
            readPathValue(
              target,
              property)) as any;

    const unwatchers: Array<() => boolean> = [];

    for (const property of propertiesList) {
      const segments =
        splitPath(property);

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
          properties: readonly string[] | string,
          callback: (...values: any[]) => void
        ): () => boolean
      {
        if (typeof properties === 'string') {
          return watchFn(
            this as any,
            properties,
            callback);
        }

        return watchFn(
          this as any,
          properties,
          callback);
      } });
}
