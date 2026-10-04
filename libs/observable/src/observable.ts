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
         isDateValue,
         isFunction,
         isObject,
         isPlainArray,
         isPlainObject,
         isRegExpValue }
  from './guards.js';
import { ObservableConvertFn,
         ObservableFactory,
         ObservableFn,
         ObservableOptions,
         ObservableTraceFn }
  from './types.js';

/** The methods the default `eventful` factory adds, which a value must not own. */
const EVENTFUL_METHOD_NAMES: readonly string[] =
  Object.freeze(
    [ 'on',
      'once',
      'off',
      'emit',
      'emitAsync',
      'has',
      'removeAllListeners',
      'getListeners' ]);

/** What every factory must add, and so all a custom factory is known to add. */
const REQUIRED_METHOD_NAMES: readonly string[] =
  Object.freeze(
    [ 'on',
      'off' ]);

/** The five array methods whose arguments are the description of a splice. */
const SPLICING_METHODS: readonly string[] =
  Object.freeze(
    [ 'push',
      'pop',
      'shift',
      'unshift',
      'splice' ]);

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
  Object.freeze(
    [ 'sort',
      'reverse',
      'fill',
      'copyWithin' ]);

/** The largest valid array index, `2 ** 32 - 2`. */
const MAX_ARRAY_INDEX = 4294967294;

/**
 * The state of one call to `observable`.
 *
 * Repeated references and cycles are resolved per call (D7, D8): separate
 * calls produce separate observables, so nothing here outlives the call.
 */
type Conversion = {
  deep: boolean;
  convert: ObservableConvertFn | null;
  factory: ObservableFactory;
  reserved: readonly string[];
  traceOf: () => ObservableTraceFn | null;
  /** Objects being converted, by the path they were reached at. */
  ancestors: Map<object, string>;
  /** What each object reached in this call became. */
  converted: Map<object, unknown>;
};

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

/** Whether a key is a canonical array index: `'0'`, `'1'`, never `'01'`. */
function isArrayIndex(
    key: string
  ): boolean
{
  return /^(?:0|[1-9]\d*)$/.test(key)
    && Number(key) <= MAX_ARRAY_INDEX;
}

/**
 * Where a value sits, for an error message (D17): `.name` for a property that
 * reads as an identifier, `[0]` for an index of an array, `["first name"]`
 * otherwise, which covers a numeric key of a plain object.
 */
function memberPath(
    base: string,
    key: string,
    inArray: boolean
  ): string
{
  if (
    inArray
    && isArrayIndex(key)
  ) {
    return `${base}[${key}]`;
  }

  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `${base}.${key}`
    : `${base}[${JSON.stringify(key)}]`;
}

function refusal(
    path: string,
    reason: string
  ): TypeError
{
  return new TypeError(
    `at ${path}: ${reason}`);
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

  return 'non-extensible';
}

/** Names a value observable cannot convert, by its class where it has one. */
function describeValue(
    value: object
  ): string
{
  const prototype =
    Object.getPrototypeOf(value);

  const name =
    prototype === null
    ? undefined
    : (value as { constructor?: { name?: unknown; }; }).constructor?.name;

  return typeof name === 'string'
    && name !== ''
    ? name
    : 'the value';
}

function unsupported(
    path: string,
    value: object
  ): TypeError
{
  return refusal(
    path,
    `${describeValue(value)} is not supported. Hold it in a plain object, or `
      + 'take it over with the convert option.');
}

/** Values in the sense of D4: never converted, kept or boxed as they are. */
function isValue(
    value: unknown
  ): boolean
{
  return !isObject(value)
    || isDateValue(value)
    || isRegExpValue(value);
}

function isPlainData(
    value: object
  ): boolean
{
  return isPlainObject(value)
    || isPlainArray(value);
}

/**
 * Checks that a plain object or array holds plain data (D16).
 *
 * Every own property must be a string-keyed data property that is enumerable,
 * writable and configurable, and the container must be extensible. An array
 * owns only its indices and `length`, and has no holes.
 */
function checkPlainData(
    source: object,
    path: string
  ): void
{
  if (!Object.isExtensible(source)) {
    throw refusal(
      path,
      `a ${describeInextensibility(source)} object is not supported`);
  }

  const isArraySource =
    Array.isArray(source);

  let indices = 0;

  for (const key of Reflect.ownKeys(source)) {
    if (
      typeof key
      === 'symbol'
    ) {
      throw refusal(
        path,
        `the symbol key ${String(key)} is not supported`);
    }

    if (isArraySource) {
      if (key === 'length') {
        continue;
      }

      if (!isArrayIndex(key)) {
        throw refusal(
          memberPath(
            path,
            key,
            isArraySource),
          'an array property other than an index is not supported');
      }

      indices++;
    }

    const descriptor =
      Object.getOwnPropertyDescriptor(
        source,
        key)!;

    if (
      !hasOwn(
        descriptor,
        'value')
    ) {
      throw refusal(
        memberPath(
          path,
          key,
          isArraySource),
        'an accessor property is not supported');
    }

    if (!descriptor.writable) {
      throw refusal(
        memberPath(
          path,
          key,
          isArraySource),
        'a read-only property is not supported');
    }

    if (!descriptor.enumerable) {
      throw refusal(
        memberPath(
          path,
          key,
          isArraySource),
        'a non-enumerable property is not supported');
    }

    if (!descriptor.configurable) {
      throw refusal(
        memberPath(
          path,
          key,
          isArraySource),
        'a non-configurable property is not supported');
    }
  }

  if (
    isArraySource
    && indices
       !== (source as unknown[]).length
  ) {
    throw refusal(
      path,
      'an array with holes is not supported');
  }
}

/**
 * Throws when a value owns a property named like a method the factory adds
 * (D10, D11).
 *
 * Own properties only: plain data inherits none of these names, and an
 * inherited one, such as `has` on a `Map`, belongs to an object that is
 * refused for what it is.
 */
function checkReservedNames(
    value: object,
    path: string,
    conversion: Conversion
  ): void
{
  for (const name of conversion.reserved) {
    if (
      hasOwn(
        value,
        name)
    ) {
      throw refusal(
        path,
        `the property "${name}" has the name of a method the observable adds`);
    }
  }
}

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

/** Wraps an error a hook threw, so that it names where it happened (D17). */
function hookError(
    path: string,
    error: unknown
  ): TypeError
{
  return new TypeError(
    `at ${path}: ${
      error instanceof Error
        ? error.message
        : String(error)
    }`,
    { cause: error });
}

/** Asks `convert` about an object, naming the path if it throws (D9, D17). */
function askConvert(
    object: object,
    path: string,
    conversion: Conversion
  ): unknown
{
  try {
    return conversion.convert!(object);
  } catch (error) {
    throw hookError(
      path,
      error);
  }
}

/**
 * Gives a target its methods through the factory (D18).
 *
 * The factory adds the methods to the object it is given, so that object is
 * the observable whatever the factory returns. It must leave it able to
 * subscribe (`on`, `off`) and able to deliver `change`, which the contract does
 * through `emit`.
 */
function attachMethods(
    target: object,
    path: string,
    conversion: Conversion
  ): any
{
  try {
    conversion.factory(target);
  } catch (error) {
    throw hookError(
      path,
      error);
  }

  if (
    !isObservable(target)
    || !isFunction(
      (target as { emit?: unknown; }).emit)
  ) {
    throw refusal(
      path,
      'the eventful factory must add on, off and emit');
  }

  return target;
}

function traceNew(
    object: object,
    conversion: Conversion
  ): void
{
  setChangeTrace(
    object as any,
    changes =>
      conversion.traceOf()?.(
        object,
        'change',
        changes));

  conversion.traceOf()?.(
    object,
    'new',
    { object });
}

/**
 * Wraps a converted copy in a proxy that reports its changes.
 *
 * Values written later are stored as they are (D13); only the write is
 * reported.
 */
function makeObservable(
    target: any,
    path: string,
    conversion: Conversion
  ): any
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

  /**
   * Reports one change. Nothing is reported until the methods are attached,
   * which is what keeps the factory's own definitions out of the reports.
   */
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

  /**
   * Reports the growth of an array's `length` that an index write caused.
   *
   * A splice implies its length change, but an index written past the end has
   * no splice to imply it, so the `set` for `length` is the only entry that
   * describes it (D15).
   */
  const reportGrowth =
    (
        tgt: any,
        property: string,
        previousLength: number
      ): void =>
    {
    if (
      isArrayTarget
      && property !== 'length'
      && tgt.length !== previousLength
    ) {
      report(
        { kind: 'set',
          property: 'length',
          value: tgt.length,
          previous: previousLength });
    }
  };

  /** Symbol keys are not data, and a reported property is a string (D15). */
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

      const previousLength =
        isArrayTarget
        ? tgt.length
        : 0;

      settingThrough++;

      let ok: boolean;

      try {
        ok =
          Reflect.set(
            tgt,
            property,
            newValue,
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

      // The splice covers every dropped index and `length`.
      if (removed) {
        report(
          { kind: 'splice',
            index: removed.index,
            removed: removed.removed,
            added: [ ] });

        return ok;
      }

      report(
        { kind: 'set',
          property,
          value:
            Reflect.get(
              tgt,
              property,
              receiver),
          previous });

      reportGrowth(
        tgt,
        property,
        previousLength);

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
      const reporting =
        settingThrough === 0
        && reportable(property);

      // A definition is reported by the value the property reads as, before
      // and after, so installing a getter runs it (D15).
      const previous =
        reporting
        ? Reflect.get(
          tgt,
          property)
        : undefined;

      const previousLength =
        isArrayTarget
        ? tgt.length
        : 0;

      // Defining `length` drops elements just as assigning it does.
      const removed =
        reporting
          && isArrayTarget
          && property === 'length'
          && hasOwn(
            descriptor,
            'value')
        ? truncation(
          tgt,
          descriptor.value)
        : null;

      const ok =
        Reflect.defineProperty(
          tgt,
          property,
          descriptor);

      if (
        ok
        && removed
      ) {
        report(
          { kind: 'splice',
            index: removed.index,
            removed: removed.removed,
            added: [ ] });

        return ok;
      }

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

      if (
        ok
        && reporting
      ) {
        reportGrowth(
          tgt,
          property as string,
          previousLength);
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

  const result =
    attachMethods(
      new Proxy(
        target,
        handler),
      path,
      conversion);

  proxy = result;

  traceNew(
    result,
    conversion);

  return result;
}

/**
 * Converts a plain object or plain array that holds plain data into a new
 * observable, applying D11 to each of its values.
 */
function convertPlain(
    source: object,
    path: string,
    conversion: Conversion
  ): any
{
  checkPlainData(
    source,
    path);

  conversion.ancestors.set(
    source,
    path);

  try {
    const isArraySource =
      Array.isArray(source);

    const target: any =
      isArraySource
      ? [ ]
      : Object.getPrototypeOf(source) === null
      ? Object.create(null)
      : {};

    for (const key of Object.keys(source)) {
      // Defined rather than assigned, so a key named `__proto__` is a property
      // of the copy and not a change of its prototype.
      Object.defineProperty(
        target,
        key,
        { value:
            convertNested(
              (source as any)[key],
              memberPath(
                path,
                key,
                isArraySource),
              conversion),
          writable: true,
          enumerable: true,
          configurable: true });
    }

    const result =
      makeObservable(
        target,
        path,
        conversion);

    conversion.converted.set(
      source,
      result);

    return result;
  } finally {
    conversion.ancestors.delete(source);
  }
}

/** The rules for a value nested in the data, in order (D11). */
function convertNested(
    value: unknown,
    path: string,
    conversion: Conversion
  ): unknown
{
  // Rules 1 and 2: primitives, functions, dates and regular expressions, and
  // frozen plain data are values (D4).
  if (
    isFunction(value)
    || isValue(value)
  ) {
    return value;
  }

  const object =
    value as object;

  if (
    Object.isFrozen(object)
    && isPlainData(object)
  ) {
    return object;
  }

  // Rule 3.
  if (!conversion.deep) {
    return object;
  }

  // D7 and D8 come before convert.
  const ancestorPath =
    conversion.ancestors.get(object);

  if (ancestorPath !== undefined) {
    throw refusal(
      path,
      `circular reference to ${ancestorPath}`);
  }

  if (conversion.converted.has(object)) {
    return conversion.converted.get(object);
  }

  // Rule 4.
  if (conversion.convert) {
    const custom =
      askConvert(
        object,
        path,
        conversion);

    if (
      custom !== null
      && custom !== undefined
    ) {
      conversion.converted.set(
        object,
        custom);

      return custom;
    }
  }

  // Rule 5. Recorded, so that convert is not asked again about it (D8, D9).
  if (isObservable(object)) {
    conversion.converted.set(
      object,
      object);

    return object;
  }

  // Rule 6.
  checkReservedNames(
    object,
    path,
    conversion);

  // Rule 7.
  if (isPlainData(object)) {
    return convertPlain(
      object,
      path,
      conversion);
  }

  // Rule 8.
  throw unsupported(
    path,
    object);
}

/**
 * Boxes a value as `{ value }` (D10, rule 1).
 *
 * The box is an observable object like any other, so writes, definitions and
 * deletions of `value` are reported the same way (D15).
 */
function box(
    initial: unknown,
    conversion: Conversion
  ): any
{
  return makeObservable(
    { value: initial },
    'value',
    conversion);
}

/** The rules for the value given to `observable`, in order (D10). */
function convertTop(
    value: unknown,
    conversion: Conversion
  ): any
{
  const path = 'value';

  // Rule 1.
  if (
    isFunction(value)
    || isValue(value)
  ) {
    return box(
      value,
      conversion);
  }

  const object =
    value as object;

  // Rule 2.
  if (conversion.convert) {
    const custom =
      askConvert(
        object,
        path,
        conversion);

    if (
      custom !== null
      && custom !== undefined
    ) {
      if (
        !isObservable(custom)
        || custom === object
      ) {
        throw refusal(
          path,
          'convert must return a new observable, with on and off, for the '
            + 'top-level value');
      }

      return custom;
    }
  }

  // Rule 3.
  if (isObservable(object)) {
    throw refusal(
      path,
      'the value is already observable, and observing it again would return '
        + 'the original itself');
  }

  // Rule 4.
  checkReservedNames(
    object,
    path,
    conversion);

  // Rule 5. A frozen object cannot change, so there is nothing to observe.
  if (isPlainData(object)) {
    if (Object.isFrozen(object)) {
      throw refusal(
        path,
        'a frozen object cannot change, so there is nothing to observe');
    }

    return convertPlain(
      object,
      path,
      conversion);
  }

  // Rule 6.
  throw unsupported(
    path,
    object);
}

/**
 * Creates an observable version of plain data: a new object, array or box that
 * reports its own changes through `on('change', listener)`. See `DESIGN.md`.
 */
const observableImpl =
  (
      ...args: [ value?: unknown, options?: ObservableOptions ]
    ): any =>
  {
  const [ value, options ] = args;

  const {
    eventful: factory = eventful,
    trace = null,
    deep = false,
    convert = null
  } =
    options ?? {};

  functionTypeGuard(factory);

  if (
    trace !== null
    && trace !== undefined
  ) {
    functionTypeGuard(trace);
  }

  if (
    convert !== null
    && convert !== undefined
  ) {
    functionTypeGuard(convert);
  }

  const conversion: Conversion =
    { deep: deep === true,
      convert: convert ?? null,
      factory,
      reserved:
        factory === eventful
        ? EVENTFUL_METHOD_NAMES
        : REQUIRED_METHOD_NAMES,
      traceOf:
        () =>
        {
        const traceFn =
          trace
          || observable.options.trace;

        return isFunction(traceFn)
          ? traceFn
          : null;
      },
      ancestors: new Map(),
      converted: new Map() };

  return convertTop(
    value,
    conversion);
};

export const observable =
  observableImpl as ObservableFn;

observable.options =
  { trace: null };
