import {
    eventful
  } from 'asljs-eventful';

import {
    ObservableOptions,
    ObservableFn,
    ObservableWatchFn
  } from './types.js';

import {
    functionTypeGuard,
    isFunction,
  } from './guards.js';

function hasOwn(
    object: object,
    key: PropertyKey
  ): boolean
{
  return Object.prototype
    .hasOwnProperty
    .call(
      object,
      key);
}

function isArrayIndexProperty(
    key: PropertyKey
  ): boolean
{
  if (typeof key === 'symbol') {
    return false;
  }

  const numeric =
    typeof key === 'number'
      ? key
      : Number(key);

  if (!Number.isInteger(numeric)
    || numeric < 0
    || numeric >= 4294967295)
  {
    return false;
  }

  if (typeof key === 'number') {
    return true;
  }

  return key === String(numeric);
}

const watchImpl: ObservableWatchFn =
  (
      target,
      properties,
      callback
    ): void =>
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

    const getValues =
      (): any =>
      {
        return properties.map(
          property => (target as any)[property]) as any;
      };

    for (const property of properties) {
      if (typeof property !== 'string') {
        throw new TypeError(
          'Expect properties to be an array of strings.');
      }

      (target as any).on(
        `set:${property}`,
        () => callback(...getValues()));
    }

    callback(...getValues());
  };

function ensureWatchMethod(
    target: any
  ): void
{
  if ('watch' in target) {
    return;
  }

  Object.defineProperty(
    target,
    'watch',
    { configurable: true,
      writable: true,
      enumerable: false,
      value(
          properties: readonly string[],
          callback: (...values: any[]) => void
        ): void
      {
        observable.watch(
          this as any,
          properties,
          callback);
      } });
}

/**
 * Creates an observable object/array/primitive that emits events on changes.
 *
 * Events:
 *   - objects: 'set' / `set:<prop>`, payload: `{ property, value, previous }`
 *   - objects: 'delete' / `delete:<prop>`, payload: `{ property, previous }`
 *   - arrays index: 'set' / `set:<index>`, payload `{ index, value, previous }`
 *   - 'define' / `define:<prop>` payload: { property, descriptor, previous }
 *
 * Emissions are synchronous and errors are isolated by the underlying
 * `eventful.emit`.
 */
const observableImpl =
  (
        value: any,
        options: ObservableOptions = {}
    ): any =>
  {
    const {
      eventful: eventfulFn = eventful,
      trace = null
    } = options;

    functionTypeGuard(eventfulFn);

    const globalOptions =
        observable.options;

    const makeProxy =
        (
            target: any
          ): any =>
        {
          const isArrayTarget =
            Array.isArray(target);

          ensureWatchMethod(target);

          let proxy: any;

          proxy =
            eventfulFn(
              new Proxy(
                target,
                {
                  set(
                      tgt,
                      property,
                      newValue,
                      receiver
                    ): boolean
                  {
                    const isArrayIndex =
                      isArrayTarget
                      && isArrayIndexProperty(property);

                    const previous =
                      Reflect.get(
                        tgt,
                        property,
                        receiver);

                    const ok =
                      Reflect.set(
                        tgt,
                        property,
                        newValue,
                        receiver);

                    if (proxy
                      && ok)
                    {
                      const current =
                        Reflect.get(
                          tgt,
                          property,
                          receiver);

                      if (!Object.is(previous, current)) {
                        const payload =
                          isArrayIndex
                            ? { index: Number(property),
                                value: current,
                                previous }
                            : { property,
                                value: current,
                                previous };

                        const traceFn =
                          trace
                          || globalOptions.trace;

                        proxy.emit(
                          `set:${String(property)}`,
                          payload);

                        if (isFunction(traceFn)) {
                          traceFn(
                            proxy,
                            'set',
                            payload);
                        }

                        proxy.emit(
                          'set',
                          payload);
                      }
                    }

                    return ok;
                  },

                  deleteProperty(
                      tgt,
                      property
                    ): boolean
                  {
                    const isArrayIndex =
                      isArrayTarget
                      && isArrayIndexProperty(property);

                    const had =
                      hasOwn(tgt, property);

                    const previous =
                      had
                        ? tgt[property]
                        : undefined;

                    const ok =
                      Reflect.deleteProperty(
                        tgt,
                        property);

                    if (proxy
                      && ok
                      && had)
                    {
                      const payload =
                        isArrayIndex
                          ? { index: Number(property),
                              previous }
                          : { property,
                              previous };

                      const traceFn =
                        trace
                        || globalOptions.trace;

                      proxy.emit(
                        `delete:${String(property)}`,
                        payload);

                      if (isFunction(traceFn)) {
                        traceFn(
                          proxy,
                          'delete',
                          payload);
                      }

                      proxy.emit(
                        'delete',
                        payload);
                    }

                    return ok;
                  },

                  defineProperty(
                      tgt,
                      property,
                      descriptor
                    ): boolean
                  {
                    const previous =
                      Object.getOwnPropertyDescriptor(
                        tgt,
                        property)
                      ?? null;

                    const ok =
                      Reflect.defineProperty(
                        tgt,
                        property,
                        descriptor);

                    const skipArrayDefine =
                      isArrayTarget
                      && (property === 'length'
                          || isArrayIndexProperty(property));

                    if (proxy
                      && !skipArrayDefine
                      && ok)
                    {
                      const payload =
                        { property,
                          descriptor,
                          previous };

                      const traceFn =
                        trace
                        || globalOptions.trace;

                      proxy.emit(
                        `define:${String(property)}`,
                        payload);

                      if (isFunction(traceFn)) {
                        traceFn(
                          proxy,
                          'define',
                          payload);
                      }

                      proxy.emit(
                        'define',
                        payload);
                    }

                    return ok;
                  }
                }));

          return proxy;
        };

    const traceFn =
        trace
        || globalOptions.trace;

    // Arrays
    if (Array.isArray(value)) {
      const proxy =
          makeProxy(
            value);

      if (isFunction(traceFn)) {
        traceFn(
          proxy,
          'new');
      }

      return proxy;
    }

    // Objects
    if (value !== null
        && typeof value === 'object')
    {
      const proxy =
          makeProxy(
            value);

      if (isFunction(traceFn)) {
        traceFn(
          proxy,
          'new',
          { object: proxy });
      }

      return proxy;
    }

    // Primitives → boxed with a single 'value' slot
    const boxed =
        eventfulFn(
          {
            get value() {
              return value;
            },
            set value(v) {
              if (Object.is(v, value))
                return;

              const previous =
                value;

              value = v;

              const payload =
                { property: 'value',
                  value,
                  previous };

              (boxed as any).emit(
                'set:value',
                payload);

              if (isFunction(traceFn)) {
                traceFn(
                  boxed,
                  'set',
                  payload);
              }

              (boxed as any).emit(
                'set',
                payload);
            }
          });

    if (isFunction(traceFn)) {
      traceFn(
        boxed,
        'new',
        { object: boxed });
    }

    return boxed;
  };

export const observable =
  observableImpl as ObservableFn;

observable.options =
  { trace: null };

observable.watch =
  watchImpl;
