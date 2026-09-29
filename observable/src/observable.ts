import { asEventfulLike,
         eventful,
         EventfulLike }
  from 'asljs-eventful';
import { functionTypeGuard,
         isFunction,
         isObject,
         isPlainObject }
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
      key);
}

function isArrayIndexProperty(
    key: PropertyKey
  ): boolean
{
  if (
    typeof key
    === 'symbol'
  ) {
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

/**
 * Elements that a `length` assignment is about to drop, furthest index first.
 *
 * Holes have nothing to report. Indices that `pop`, `shift` and `splice`
 * already deleted before assigning `length` are no longer own properties, so
 * they are skipped and never reported twice.
 */
function collectTruncatedElements(
    target: any,
    nextLength: unknown
  ): Array<{ index: number; previous: unknown; }>
{
  const previousLength = target.length;

  const length =
    Number(nextLength);

  if (
    !Number.isInteger(length)
    || length < 0
    || length >= previousLength
  ) {
    return [ ];
  }

  const removed: Array<{ index: number; previous: unknown; }> = [ ];

  for (
    let index = previousLength - 1;
    index >= length;
    index--
  ) {
    if (
      !hasOwn(
        target,
        index)
    ) {
      continue;
    }

    removed.push(
      { index,
        previous: target[index] });
  }

  return removed;
}

function describeInextensibility(
    object: object
  ): string
{
  if (Object.isFrozen(object)) {
    return 'frozen';
  }

  if (Object.isSealed(object)) {
    return 'sealed';
  }

  return 'not extensible';
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
    (value as EventfulLike & { emit?: unknown; }).emit);
}

/**
 * Values that observable converts into proxies: plain objects (`{}` literals
 * and null-prototype objects) and arrays. Everything else -- `Date`, `Map`,
 * `Set`, `RegExp`, typed arrays, class instances -- is treated as an opaque
 * value, because a proxy cannot forward access to internal slots or private
 * fields. Already-eventful values are left alone so they keep their own wiring.
 *
 * Non-extensible values are opaque too: the eventful API cannot be attached to
 * them, and a frozen value has no changes to report in the first place.
 */
function isConvertible(
    value: any
  ): boolean
{
  if (isEventfulObject(value)) {
    return false;
  }

  if (
    !isPlainObject(value)
    && !Array.isArray(value)
  ) {
    return false;
  }

  return Object.isExtensible(value);
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
/**
 * One wrapper per target, for the lifetime of the process.
 *
 * Conversion grafts the Eventful API onto the target itself, so a given
 * object can only belong to one observable. Keeping the map here rather than
 * per call means a target reached twice resolves to the same observable even
 * across separate `observable(...)` calls, which is what a model assembled
 * from several pieces needs. It also carries repeated and cyclic references
 * within a single conversion.
 *
 * A target already in the map is returned as it is, so the options of a later
 * call are not applied to it.
 */
const wrappers =
  new WeakMap<object, any>();

const observableImpl =
  (
      value: any,
      options: ObservableOptions = {}
    ): any =>
  {
  const {
    eventful: eventfulFn = eventful,
    trace = null,
    shallow = false,
    convert = null
  } = options;

  functionTypeGuard(eventfulFn);

  const globalOptions = observable.options;

  const convertNestedValue =
    (
        input: any
      ): any =>
    {
    if (shallow) {
      return input;
    }

    if (!isObject(input)) {
      return input;
    }

    if (wrappers.has(input)) {
      return wrappers.get(input);
    }

    // The hook sees every object, including the ones that would otherwise be
    // opaque, and it decides before the built-in rule does.
    if (isFunction(convert)) {
      const custom =
        convert(input);

      if (custom !== undefined) {
        wrappers.set(
          input,
          custom);

        return custom;
      }
    }

    if (!isConvertible(input)) {
      return input;
    }

    const converted =
      observableImpl(
        input,
        { eventful: eventfulFn,
          trace,
          shallow,
          convert });

    wrappers.set(
      input,
      converted);

    return converted;
  };

  /**
   * Converts a single own member in place.
   *
   * Only writable data properties are touched. Accessors are left alone,
   * because reading one to convert it would run the getter and writing the
   * result back would replace the accessor with a plain value. Non-writable
   * members, and array holes, have no descriptor to rewrite and are skipped.
   */
  const convertNestedMember =
    (
        target: any,
        key: PropertyKey
      ): void =>
    {
    const descriptor =
      Object.getOwnPropertyDescriptor(
        target,
        key);

    if (
      !descriptor
      || !descriptor.writable
    ) {
      return;
    }

    const converted =
      convertNestedValue(
        descriptor.value);

    if (
      Object.is(
        converted,
        descriptor.value)
    ) {
      return;
    }

    target[key] = converted;
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
      for (
        let i = 0;
        i < target.length;
        i++
      ) {
        convertNestedMember(
          target,
          i);
      }

      return;
    }

    for (const key of Reflect.ownKeys(target)) {
      convertNestedMember(
        target,
        key);
    }
  };

  const makeProxy =
    (
        target: any
      ): any =>
    {
    const isArrayTarget =
      Array.isArray(target);

    let proxy: any = null;

    const emitDelete =
      (
          key: PropertyKey,
          payload: object
        ): void =>
      {
      const traceFn =
        trace
        || globalOptions.trace;

      proxy.emit(
        `delete:${String(key)}`,
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
    };

    const proxiedTarget =
      new Proxy(
        target,
        { set(
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

          // Truncating an array drops elements without going through the
          // delete trap, so the dropped values are collected before the
          // write and reported afterwards.
          const removed =
            isArrayTarget
              && property === 'length'
            ? collectTruncatedElements(
              tgt,
              newValue)
            : [ ];

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
            for (const { index, previous: removedValue } of removed) {
              emitDelete(
                index,
                { index,
                  previous: removedValue });
            }

            const current =
              Reflect.get(
                tgt,
                property,
                receiver);

            if (
              !Object.is(
                previous,
                current)
            ) {
              const payload =
                isArrayIndex
                ? { index:
                      Number(property),
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
              ? { index:
                    Number(property),
                  previous }
              : { property,
                  previous };

            emitDelete(
              property,
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

          const descriptorToDefine =
            Object.prototype
              .hasOwnProperty
              .call(
                descriptor,
                'value')
            ? { ...descriptor,
                value:
                  convertNestedValue(
                    descriptor.value) }
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
              { property,
                descriptor: descriptorToDefine,
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
        } });

    proxy =
      isFunction(
        target?.emit)
      ? proxiedTarget
      : eventfulFn(proxiedTarget);

    // Register before descending so that cyclic and repeated references
    // resolve to this wrapper instead of recursing into it again.
    wrappers.set(
      target,
      proxy);

    convertNestedMembers(target);

    ensureWatchMethod(
      target,
      watchImpl);

    return proxy;
  };

  if (
    isObject(value)
    && wrappers.has(value)
  ) {
    return wrappers.get(value);
  }

  if (
    isFunction(convert)
    && isObject(value)
  ) {
    const custom =
      convert(value);

    if (custom !== undefined) {
      return custom;
    }
  }

  // Checked before the dispatch so that a frozen array is refused here
  // rather than deeper down by eventful.
  if (
    (isObject(value)
     || isFunction(value))
     && !Object.isExtensible(
       value as object)
  ) {
    throw new TypeError(
      `Expect an extensible object or array, but the object is ${
        describeInextensibility(
          value as object)
      }.`);
  }

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

  // Plain objects, and any object that already carries the eventful API
  if (
    isConvertible(value)
    || isEventfulObject(value)
  ) {
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

  // Opaque objects cannot be observed directly. Boxing them silently would
  // hand back something whose properties all read as undefined, so refuse,
  // the way eventful refuses a target it cannot augment.
  if (
    isObject(value)
    || isFunction(value)
  ) {
    throw new TypeError(
      'Expect a plain object, an array, or a primitive, but the value is '
        + 'opaque. Hold it in a plain object, or take it over with the '
        + 'convert option.');
  }

  // Primitives → boxed with a single 'value' slot
  const boxed =
    eventfulFn(
      { get value() {
        return value;
      },
        set value(v) {
        if (
          Object.is(
            v,
            value)
        ) {
          return;
        }

        const previous = value;

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
      } });

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

observable.watch = watchImpl;
