import { asEventfulLike,
         eventful,
         EventfulLike }
  from 'asljs-eventful';
import { functionTypeGuard,
         isFunction,
         isObject }
  from './guards.js';
import { ObservableFn,
         ObservableOptions }
  from './types.js';
import { ensureWatchMethod,
         watchImpl }
  from './watch.js';

function hasOwn(
    object: object,
    key: PropertyKey
  ): boolean
{
  return Object.prototype
    .hasOwnProperty
    .call(
      object,
      key
    );
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

  if (
    !Number.isInteger(numeric)
    || numeric < 0
    || numeric >= 4294967295
  ) {
    return false;
  }

  return typeof key === 'number'
    || key === String(numeric);
}

function isEventfulObject(
    value: any
  ): boolean
{
  const eventfulLike =
    asEventfulLike(value);

  if (!eventfulLike) {
    return false;
  }

  return isFunction(
    (value as EventfulLike & { emit?: unknown; }).emit
  );
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
    trace = null,
    shallow = false
  } = options;

  functionTypeGuard(eventfulFn);

  const globalOptions =
    observable.options;

  const conversionCache =
    new WeakMap<object, any>();

  const convertNestedValue =
    (
    input: any
  ): any =>
  {
    if (shallow) {
      return input;
    }

    if (
      !isObject(input)
      || isEventfulObject(input)
    ) {
      return input;
    }

    if (conversionCache.has(input)) {
      return conversionCache.get(input);
    }

    const converted =
      observableImpl(
        input,
        {
        eventful: eventfulFn,
        trace,
        shallow
      });

    conversionCache.set(
      input,
      converted
    );

    return converted;
  };

  const convertNestedMembers =
    (
    target: any
  ): void =>
  {
    if (shallow) {
      return;
    }

    if (Array.isArray(target)) {
      for (let i = 0; i < target.length; i++) {
        target[i] = convertNestedValue(
          target[i]
        );
      }

      return;
    }

    for (const key of Reflect.ownKeys(target)) {
      if (
        !hasOwn(
          target,
          key
        )
      ) {
        continue;
      }

      target[key] = convertNestedValue(
        target[key]
      );
    }
  };

  const makeProxy =
    (
    target: any
  ): any =>
  {
    const isArrayTarget =
      Array.isArray(target);

    convertNestedMembers(target);

    ensureWatchMethod(
      target,
      watchImpl
    );

    let proxy: any = null;

    const proxiedTarget =
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
              convertNestedValue(newValue),
              receiver);

          if (
            proxy
            && ok
          ) {
            const current =
              Reflect.get(
                tgt,
                property,
                receiver);

            if (
              !Object.is(
                previous,
                current
              )
            ) {
              const payload =
                isArrayIndex
                ? { index: Number(property), value: current, previous }
                : { property, value: current, previous };

              const traceFn =
                trace
                || globalOptions.trace;

              proxy.emit(
                `set:${String(property)}`,
                payload
              );

              if (isFunction(traceFn)) {
                traceFn(
                  proxy,
                  'set',
                  payload
                );
              }

              proxy.emit(
                'set',
                payload
              );
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
            hasOwn(
              tgt,
              property);

          const previous =
            had
            ? tgt[property]
            : undefined;

          const ok =
            Reflect.deleteProperty(
              tgt,
              property);

          if (
            proxy
            && ok
            && had
          ) {
            const payload =
              isArrayIndex
              ? { index: Number(property), previous }
              : { property, previous };

            const traceFn =
              trace
              || globalOptions.trace;

            proxy.emit(
              `delete:${String(property)}`,
              payload
            );

            if (isFunction(traceFn)) {
              traceFn(
                proxy,
                'delete',
                payload
              );
            }

            proxy.emit(
              'delete',
              payload
            );
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

          const descriptorToDefine =
            Object.prototype
              .hasOwnProperty
              .call(
                descriptor,
                'value'
              )
            ? {
              ...descriptor,
              value: convertNestedValue(
                descriptor.value
              )
            }
            : descriptor;

          const ok =
            Reflect.defineProperty(
              tgt,
              property,
              descriptorToDefine);

          const skipArrayDefine =
            isArrayTarget
            && (property === 'length'
              || isArrayIndexProperty(property));

          if (
            proxy
            && !skipArrayDefine
            && ok
          ) {
            const payload =
              {
              property,
              descriptor: descriptorToDefine,
              previous
            };

            const traceFn =
              trace
              || globalOptions.trace;

            proxy.emit(
              `define:${String(property)}`,
              payload
            );

            if (isFunction(traceFn)) {
              traceFn(
                proxy,
                'define',
                payload
              );
            }

            proxy.emit(
              'define',
              payload
            );
          }

          return ok;
        }
      }
    );

    proxy = isFunction(
      target?.emit)
      ? proxiedTarget
      : eventfulFn(proxiedTarget);

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
        'new'
      );
    }

    return proxy;
  }

  // Objects
  if (
    value !== null
    && typeof value === 'object'
  ) {
    const proxy =
      makeProxy(
        value);

    if (isFunction(traceFn)) {
      traceFn(
        proxy,
        'new',
        { object: proxy }
      );
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
        if (
          Object.is(
            v,
            value
          )
        ) {
          return;
        }

        const previous = value;

        value = v;

        const payload =
          { property: 'value', value, previous };

        (boxed as any).emit(
          'set:value',
          payload
        );

        if (isFunction(traceFn)) {
          traceFn(
            boxed,
            'set',
            payload
          );
        }

        (boxed as any).emit(
          'set',
          payload
        );
      }
    });

  if (isFunction(traceFn)) {
    traceFn(
      boxed,
      'new',
      { object: boxed }
    );
  }

  return boxed;
};

export const observable =
  observableImpl as ObservableFn;

observable.options = { trace: null };

observable.watch = watchImpl;
