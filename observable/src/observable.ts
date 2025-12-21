import { eventful } from 'asljs-eventful';
import {
  ObservableOptions,
  ObservableFn
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

/**
 * Creates an observable object/array/primitive that emits events on changes.
 *
 * Events:
 *   - 'set' / `set:<prop>`       payload: { property, value, previous }
 *   - 'delete' / `delete:<prop>` payload: { property, previous }
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
        (target: any, { includeDefine }: { includeDefine: boolean }) => {
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
                      receiver) {
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
                      && ok) {
                      const current =
                        Reflect.get(
                          tgt,
                          property,
                          receiver);

                      if (!Object.is(previous, current)) {
                        const payload =
                        {
                          property,
                          value: current,
                          previous
                        };

                        const traceFn =
                          trace
                          || globalOptions.trace;

                        if (isFunction(traceFn)) {
                          traceFn(
                            proxy,
                            'set',
                            payload);
                        }

                        proxy.emit(
                          'set',
                          payload);

                        proxy.emit(
                          `set:${String(property)}`,
                          payload);
                      }
                    }

                    return ok;
                  },

                  deleteProperty(
                      tgt,
                      property) {
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
                      && had) {
                      const payload =
                      {
                        property,
                        previous
                      };

                      const traceFn =
                        trace
                        || globalOptions.trace;

                      if (isFunction(traceFn)) {
                        traceFn(
                          proxy,
                          'delete',
                          payload);
                      }

                      proxy.emit(
                        'delete',
                        payload);

                      proxy.emit(
                        `delete:${String(property)}`,
                        payload);
                    }

                    return ok;
                  },

                  defineProperty(
                      tgt,
                      property,
                      descriptor) {
                    if (!includeDefine) {
                      return Reflect.defineProperty(
                        tgt,
                        property,
                        descriptor);
                    }

                    const previous =
                      Object.getOwnPropertyDescriptor(
                        tgt,
                        property) ??
                      null;

                    const ok =
                      Reflect.defineProperty(
                        tgt,
                        property,
                        descriptor);

                    if (proxy
                      && ok) {
                      const payload =
                      {
                        property,
                        descriptor,
                        previous
                      };

                      const traceFn =
                        trace
                        || globalOptions.trace;

                      if (isFunction(traceFn)) {
                        traceFn(
                          proxy,
                          'define',
                          payload);
                      }

                      proxy.emit(
                        'define',
                        payload);

                      proxy.emit(
                        `define:${String(property)}`,
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
            value,
            { includeDefine: false });

      if (isFunction(traceFn)) {
        traceFn(
          proxy,
          'new');
      }

      return proxy;
    }

    // Objects
    if (value !== null
        && typeof value === 'object') {
      const proxy =
          makeProxy(
            value,
            { includeDefine: true });

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
              {
                property: 'value',
                value,
                previous
              };

              if (isFunction(traceFn)) {
                traceFn(
                  boxed,
                  'set',
                  payload);
              }

              (boxed as any).emit(
                'set',
                payload);

              (boxed as any).emit(
                'set:value',
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
