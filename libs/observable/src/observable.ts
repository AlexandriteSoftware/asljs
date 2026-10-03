import { eventful }
  from 'asljs-eventful';
import { batch,
         Change,
         isObservable,
         reportChange,
         setChangeTrace,
         withSplice }
  from './contract.js';
import { functionTypeGuard,
         isFunction,
         isObject,
         isPlainObject }
  from './guards.js';
import { ObservableFn,
         ObservableOptions,
         ObservableTraceFn }
  from './types.js';

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

function isIndexLike(
    key: string
  ): boolean
{
  return /^\d+$/.test(key);
}

/** Where a value sits in the model, for the message of a refusal. */
function memberPath(
    base: string,
    key: PropertyKey
  ): string
{
  if (
    typeof key
    === 'symbol'
  ) {
    return `${base}[${String(key)}]`;
  }

  const text =
    String(key);

  return isIndexLike(text)
    ? `${base}[${text}]`
    : `${base}.${text}`;
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

function describeUnsupportedValue(
    value: object
  ): string
{
  if (!Object.isExtensible(value)) {
    return `a ${describeInextensibility(value)} object`;
  }

  const prototype =
    Object.getPrototypeOf(value);

  const name =
    prototype === null
    ? undefined
    : (value as { constructor?: { name?: string; }; }).constructor?.name;

  return name
    ? name
    : 'the value';
}

/**
 * A nested value observable cannot make observable, named with the path at
 * which it was found.
 *
 * `observable(model)` failing with "unsupported value" on a large model is not
 * debuggable; naming the path is.
 */
function unsupportedValueError(
    path: string,
    value: object
  ): TypeError
{
  return new TypeError(
    `at ${path}: ${
      describeUnsupportedValue(value)
    } is not supported. Hold it in a plain object, or take it over with the `
      + 'convert option.');
}

/**
 * Whether a value already carries the whole Eventful API.
 *
 * Both the conversion rule and the wiring step ask this one question, so an
 * object with `emit` and no `on` cannot take the already-wired branch and then
 * lose every trap emit into its own `emit`.
 */
function hasEventfulApi(
    value: any
  ): boolean
{
  return isObservable(value)
    && isFunction(
      (value as { emit?: unknown; }).emit);
}

/**
 * Values observable converts into proxies: plain objects (`{}` literals and
 * null-prototype objects) and arrays.
 */
function isConvertible(
    value: any
  ): boolean
{
  if (
    !isPlainObject(value)
    && !Array.isArray(value)
  ) {
    return false;
  }

  return Object.isExtensible(value);
}

/** The five array methods whose arguments are the description of a splice. */
const SPLICING_METHODS: readonly string[] =
  [ 'push',
    'pop',
    'shift',
    'unshift',
    'splice' ];

/**
 * Mutating array methods that report `set` entries rather than a splice.
 *
 * `sort` and `reverse` are permutations: nothing is inserted or removed, and
 * the wrapper cannot know what moved without snapshotting the array beforehand
 * and matching it afterwards. `fill` and `copyWithin` are range overwrites, and
 * the per-index entries are already exact. A producer emits the most specific
 * description it has, and for these it does not have a splice.
 */
const BATCHING_METHODS: readonly string[] =
  [ 'sort',
    'reverse',
    'fill',
    'copyWithin' ];

function toInteger(
    value: unknown
  ): number
{
  const numeric =
    Number(value);

  if (Number.isNaN(numeric)) {
    return 0;
  }

  return Math.trunc(numeric);
}

/** `splice`'s resolved start index, which is not what the caller passed. */
function resolveStart(
    start: unknown,
    length: number
  ): number
{
  const relative =
    toInteger(start);

  return relative < 0
    ? Math.max(
      length + relative,
      0)
    : Math.min(
      relative,
      length);
}

/**
 * Elements a `length` assignment is about to drop, in index order.
 *
 * Reported as one splice rather than N sets: clearing an array is the common
 * idiom and a raw assignment, so it would otherwise stay the fan-out the list
 * exists to remove, for the operation most likely to be large.
 */
function truncation(
    target: any,
    nextLength: unknown
  ): { index: number; removed: unknown[]; } | null
{
  const previousLength = target.length;

  const length =
    Number(nextLength);

  if (
    !Number.isInteger(length)
    || length < 0
    || length >= previousLength
  ) {
    return null;
  }

  const removed: unknown[] = [ ];

  for (
    let index = length;
    index < previousLength;
    index++
  ) {
    removed.push(target[index]);
  }

  return { index: length,
           removed };
}

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

/**
 * Creates an observable object, array, or primitive box.
 *
 * What it produces emits `change` like any other participant; it has no
 * private event vocabulary of its own. Emission is synchronous, and `batch(fn)`
 * groups everything that changes during `fn` into one notification per emitter.
 */
const observableImpl =
  (
      value: any,
      options: ObservableOptions = {},
      path: string = 'value'
    ): any =>
  {
  const {
    eventful: eventfulFn = eventful,
    trace = null,
    deep = false,
    convert = null
  } = options;

  functionTypeGuard(eventfulFn);

  const globalOptions = observable.options;

  const traceOf =
    (): ObservableTraceFn | null =>
    {
    const traceFn =
      trace
      || globalOptions.trace;

    return isFunction(traceFn)
      ? traceFn
      : null;
  };

  const convertNestedValue =
    (
        input: any,
        valuePath: string
      ): any =>
    {
    if (!deep) {
      return input;
    }

    // Primitives and functions are leaves: stored as they are.
    if (!isObject(input)) {
      return input;
    }

    if (wrappers.has(input)) {
      return wrappers.get(input);
    }

    // The hook sees every object, including the ones that would otherwise be
    // refused, and it decides before the built-in rule does.
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

    // A value that already conforms is stitched in as it is. This is how a
    // hand-written or EventEmitter-based object joins a converted model.
    if (isObservable(input)) {
      return input;
    }

    if (!isConvertible(input)) {
      throw unsupportedValueError(
        valuePath,
        input);
    }

    const converted =
      observableImpl(
        input,
        { eventful: eventfulFn,
          trace,
          deep,
          convert },
        valuePath);

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
        descriptor.value,
        memberPath(
          path,
          key));

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
    if (!deep) {
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

    /**
     * Raised while the `set` trap performs its `Reflect.set`.
     *
     * `[[Set]]` performs `[[DefineOwnProperty]]`, so a plain assignment trips
     * both traps. The guard is what stops one write being reported twice.
     * Synchronous and single-threaded, so it is reliable.
     */
    let settingThrough = 0;

    const report =
      (
          change: Change
        ): void =>
      {
      if (!proxy) {
        return;
      }

      reportChange(
        proxy,
        change);
    };

    /** Symbol keys have no place in a contract whose property is a string. */
    const reportable =
      (
      property: PropertyKey
    ): property is string => typeof property === 'string';

    const handler: ProxyHandler<any> =
      { set(
        tgt,
        property,
        newValue,
        receiver
      ): boolean
      {
        const previous =
          Reflect.get(
            tgt,
            property,
            receiver);

        // Truncating an array drops elements without going through the delete
        // trap, so the dropped values are collected before the write.
        const removed =
          isArrayTarget
            && property === 'length'
          ? truncation(
            tgt,
            newValue)
          : null;

        const converted =
          convertNestedValue(
            newValue,
            memberPath(
              path,
              property));

        settingThrough++;

        let ok: boolean;

        try {
          ok =
            Reflect.set(
              tgt,
              property,
              converted,
              receiver);
        } finally {
          settingThrough--;
        }

        if (
          !ok
          || !reportable(property)
        ) {
          return ok;
        }

        // The splice covers every dropped index and `length`, so the length
        // set is not reported alongside it.
        if (removed) {
          report(
            { kind: 'splice',
              index: removed.index,
              removed: removed.removed,
              added: [ ] });

          return ok;
        }

        const current =
          Reflect.get(
            tgt,
            property,
            receiver);

        report(
          { kind: 'set',
            property,
            value: current,
            previous });

        return ok;
      },
        deleteProperty(
        tgt,
        property
      ): boolean
      {
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
          ok
          && had
          && reportable(property)
        ) {
          // Removal is a set to `undefined`. There is no delete event, so a
          // consumer cannot tell a removed key from one present and undefined.
          report(
            { kind: 'set',
              property,
              value: undefined,
              previous });
        }

        return ok;
      },
        defineProperty(
        tgt,
        property,
        descriptor
      ): boolean
      {
        const descriptorToDefine =
          hasOwn(
            descriptor,
            'value')
          ? { ...descriptor,
              value:
                convertNestedValue(
                  descriptor.value,
                  memberPath(
                    path,
                    property)) }
          : descriptor;

        const reporting =
          settingThrough === 0
          && reportable(property);

        // A definition is reported by whether the observed value changed, not
        // by what the descriptor says, so the value is read on both sides.
        // Installing a getter therefore runs it.
        const previous =
          reporting
          ? Reflect.get(
            tgt,
            property)
          : undefined;

        const ok =
          Reflect.defineProperty(
            tgt,
            property,
            descriptorToDefine);

        if (
          ok
          && reporting
        ) {
          report(
            { kind: 'set',
              property:
                property as string,
              value:
                Reflect.get(
                  tgt,
                  property),
              previous });
        }

        return ok;
      } };

    if (isArrayTarget) {
      const wrapped = new Map<string, Function>();

      const readRange =
        (
        index: number,
        count: number
      ): unknown[] =>
        Array.prototype
          .slice
          .call(
            target,
            index,
            index + count);

      const splicing: Record<string, Function> =
        { push(
          ...items: unknown[]
        ): number
        {
          const index = target.length;

          return withSplice(
            proxy,
            () =>
              Array.prototype
                .push
                .apply(
                  proxy,
                  items),
            () =>
              items.length === 0
                ? null
                : { kind: 'splice',
                    index,
                    removed: [ ],
                    added:
                      readRange(
                        index,
                        items.length) });
        },
          pop(): unknown
        {
          const length = target.length;

          if (length === 0) {
            return Array.prototype
              .pop
              .call(proxy);
          }

          return withSplice(
            proxy,
            () =>
              Array.prototype
                .pop
                .call(proxy),
            removedValue => ({ kind: 'splice',
                               index: length - 1,
                               removed:
                                 [ removedValue ],
                               added: [ ] }));
        },
          shift(): unknown
        {
          if (target.length === 0) {
            return Array.prototype
              .shift
              .call(proxy);
          }

          return withSplice(
            proxy,
            () =>
              Array.prototype
                .shift
                .call(proxy),
            removedValue => ({ kind: 'splice',
                               index: 0,
                               removed:
                                 [ removedValue ],
                               added: [ ] }));
        },
          unshift(
          ...items: unknown[]
        ): number
        {
          if (items.length === 0) {
            return Array.prototype
              .unshift
              .apply(
                proxy,
                items);
          }

          return withSplice(
            proxy,
            () =>
              Array.prototype
                .unshift
                .apply(
                  proxy,
                  items),
            () => ({ kind: 'splice',
                     index: 0,
                     removed: [ ],
                     added:
                       readRange(
                         0,
                         items.length) }));
        },
          splice(
          ...args: unknown[]
        ): unknown[]
        {
          const length = target.length;

          const start =
            resolveStart(
              args.length === 0
              ? 0
              : args[0],
              length);

          const deleteCount =
            args.length === 0
            ? 0
            : args.length === 1
            ? length - start
            : Math.min(
              Math.max(
                toInteger(args[1]),
                0),
              length - start);

          const items =
            args.slice(2);

          if (
            deleteCount === 0
            && items.length === 0
          ) {
            return Array.prototype
              .splice
              .apply(
                proxy,
                args as any);
          }

          return withSplice(
            proxy,
            () =>
              Array.prototype
                .splice
                .apply(
                  proxy,
                  args as any),
            removedValues => ({ kind: 'splice',
                                index: start,
                                removed: removedValues,
                                added:
                                  readRange(
                                    start,
                                    items.length) }));
        } };

      const batching =
        (
        method: string
      ): Function =>
      (
        ...args: unknown[]
      ): unknown =>
        batch(
          () =>
            (Array.prototype as any)[method].apply(
              proxy,
              args));

      for (const method of SPLICING_METHODS) {
        wrapped.set(
          method,
          splicing[method]);
      }

      for (const method of BATCHING_METHODS) {
        wrapped.set(
          method,
          batching(method));
      }

      // The trap runs on every read, so it does nothing but a `Map` lookup for
      // anything but the wrapped methods, and it steps aside for an own
      // override rather than replacing it.
      handler.get =
        (
            tgt,
            property,
            receiver
          ): unknown =>
        {
        if (
          typeof property
          === 'string'
        ) {
          const wrapper =
            wrapped.get(property);

          if (
            wrapper
            && Reflect.get(
              tgt,
              property,
              receiver)
               === (Array.prototype as any)[property]
          ) {
            return wrapper;
          }
        }

        return Reflect.get(
          tgt,
          property,
          receiver);
      };
    }

    const proxiedTarget =
      new Proxy(
        target,
        handler);

    proxy =
      hasEventfulApi(target)
      ? proxiedTarget
      : eventfulFn(proxiedTarget);

    setChangeTrace(
      proxy,
      changes =>
        traceOf()?.(
          proxy,
          'change',
          changes
        ));

    // Register before descending so that cyclic and repeated references
    // resolve to this wrapper instead of recursing into it again.
    wrappers.set(
      target,
      proxy);

    convertNestedMembers(target);

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
      // Registered like a nested wrapper, so that one target still resolves
      // to one wrapper however it is reached.
      wrappers.set(
        value,
        custom);

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

  // Plain objects, arrays, and any object that already carries the eventful
  // API
  if (
    isConvertible(value)
    || hasEventfulApi(value)
  ) {
    const proxy =
      makeProxy(value);

    traceOf()?.(
      proxy,
      'new',
      { object: proxy }
    );

    return proxy;
  }

  // Everything else cannot be observed directly. Boxing it silently would hand
  // back something whose properties all read as undefined, so refuse, the way
  // eventful refuses a target it cannot augment.
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
        const previous = value;

        value = v;

        reportChange(
          boxed as any,
          { kind: 'set',
            property: 'value',
            value,
            previous });
      } });

  setChangeTrace(
    boxed as any,
    changes =>
      traceOf()?.(
        boxed,
        'change',
        changes
      ));

  traceOf()?.(
    boxed,
    'new',
    { object: boxed }
  );

  return boxed;
};

export const observable =
  observableImpl as ObservableFn;

observable.options =
  { trace: null };
