import { Eventful }
  from 'asljs-eventful';
import { Change }
  from './contract.js';

/**
 * The event map every producer in this package carries.
 *
 * One event, one payload shape, whatever the target is. The payload describes
 * what changed rather than encoding it in the event name, so a subscriber
 * writes one listener instead of constructing N event names.
 */
export type ObservableEvents = {
  change: [readonly Change[]];
};

/**
 * Names the default `eventful` factory adds to every observable.
 *
 * Excluded from path descent, so the methods conversion adds are not offered
 * as properties to observe.
 */
export type EventfulMethodName =
  | 'on'
  | 'once'
  | 'off'
  | 'emit'
  | 'emitAsync'
  | 'has'
  | 'removeAllListeners'
  | 'getListeners';

/**
 * Options for observable().
 */
export interface ObservableOptions
{
  /**
   * The factory that adds the methods to every observable a call creates
   * (defaults to `eventful` from `asljs-eventful`). It must add at least `on`,
   * `off` and `emit`; anything more is its choice.
   *
   * The factory is also how its own settings are passed:
   *
   * ```js
   * observable(model, { eventful: v => eventful(v, { strict: true }) });
   * ```
   */
  eventful?: ObservableFactory;

  /**
   * Optional trace hook: `(object, action, payload)` invoked on `'new'` with
   * `{ object }` for every observable the call creates, and on `'change'` with
   * the entry list of one delivery.
   */
  trace?: ObservableTraceFn | null;

  /**
   * Controls nested conversion for object/array inputs.
   *
   * - `false` (default): converts only the top-level value; nested objects and
   *   arrays are kept by reference.
   * - `true`: recursively converts nested plain objects and arrays.
   *
   * The return type is the same either way: only the top-level value is
   * guaranteed to be converted, and members keep their declared type.
   */
  deep?: boolean;

  /**
   * Optional hook asked about objects before observable applies its own
   * rules. See `ObservableConvertFn`.
   */
  convert?: ObservableConvertFn | null;
}

/**
 * Replaces one object with another during conversion.
 *
 * Asked about the top-level value when it is an object, and, under
 * `deep: true`, about every nested object not kept by reference first. Never
 * asked about primitives, functions, dates, regular expressions, or nested
 * frozen plain data: those are values.
 *
 * - Return `null` or `undefined` to let observable decide.
 * - Return anything else to use it in place of the object. No other rule
 *   applies to it and it is not traversed. A nested object reached twice in
 *   one call is asked about once, and the result is used in both places.
 * - At the top level the result is what `observable` returns, so it must be a
 *   new observable, with `on` and `off`, and not the object itself; otherwise
 *   `observable` throws. A nested result is not checked, and returning the
 *   object itself keeps it by reference.
 */
export type ObservableConvertFn =
  (
    value: object
  ) =>
    unknown;

/**
 * Adds the methods to a new observable: at least `on`, `off` and `emit`.
 * `eventful` from `asljs-eventful` is one, and the default.
 */
export type ObservableFactory =
  (
    target: object
  ) =>
    object;

export type ObservableTraceFn =
  (
    object: object | Function,
    action: 'new' | 'change',
    payload?: any
  ) =>
    void;

export interface ObservableGlobalOptions
{
  trace: ObservableTraceFn | null;
}

/**
 * How deep `ObservablePath` descends. The cap is what stops a self-referential
 * model from expanding forever, so it cannot be removed, only tuned.
 */
type ObservablePathDepthLimit = 5;

/** Keys of `T` a path may name. */
type ModelKey<T> = Exclude<
  Extract<keyof T, string>,
  EventfulMethodName
>;

/**
 * Every dotted path that can be read out of `T`, as a union of string
 * literals: `'user' | 'user.name' | 'active'` and so on.
 *
 * Array indices are ordinary string keys, so an array is descended through
 * `${number}` rather than treated as a leaf. Descent stops at values the
 * converter refuses and at values it keeps as they are, so a path can only
 * name something that is actually there.
 */
export type ObservablePath<
  T,
  Depth extends readonly unknown[] = []
> = Depth['length'] extends ObservablePathDepthLimit ? never
  : T extends UnsupportedValue ? never
  : T extends ObservableValue ? never
  : T extends readonly (infer Element)[] ?
      | `${number}`
      | 'length'
      | (ObservablePath<Element, [...Depth, unknown]> extends
        infer Rest extends string ? `${number}.${Rest}`
        : never)
  : T extends object ? {
      [K in ModelKey<T>]:
        | K
        | (ObservablePath<T[K], [...Depth, unknown]> extends
          infer Rest extends string ? `${K}.${Rest}`
          : never);
    }[ModelKey<T>]
  : never;

/** The value one path segment resolves to. */
type SegmentValue<T, K extends string> = T extends readonly (infer Element)[]
  ? K extends 'length' ? number
  : Element
  : K extends keyof T ? T[K]
  : never;

/** The type of the value an `ObservablePath` resolves to. */
export type ObservablePathValue<T, P extends string> = P extends
  `${infer Head}.${infer Rest}`
  ? ObservablePathValue<SegmentValue<T, Head>, Rest>
  : SegmentValue<T, P>;

/** Values a combined query reports, one per path, in order. */
export type ObservablePathValues<T, P extends readonly string[]> = {
  [I in keyof P]: ObservablePathValue<T, P[I] & string>;
};

/**
 * A converted array: the array itself carries the Eventful API.
 *
 * Only the top-level value is guaranteed to be converted, so elements keep
 * their declared type, with or without `deep`. Under `deep: true` the runtime
 * converts nested plain objects and arrays too, but an element may still hold
 * either the plain value or its observable, and the type does not claim more.
 */
export type ConvertedArray<T extends readonly any[]> =
  & T
  & Eventful<ObservableEvents>;

/**
 * A converted plain object: the object itself carries the Eventful API.
 *
 * Only the top-level value is guaranteed to be converted, so members keep their
 * declared type, with or without `deep`. Under `deep: true` the runtime
 * converts nested plain objects and arrays too, but a member may still hold
 * either the plain value or its observable, and the type does not claim more.
 */
export type ConvertedObject<T extends object> =
  & T
  & Eventful<ObservableEvents>;

export type ConvertedPrimitive<T> =
  & { value: T; }
  & Eventful<ObservableEvents>;

/**
 * Objects observable treats as values: never converted, boxed at the top
 * level and kept by reference when nested.
 */
export type ObservableValue =
  | Date
  | RegExp
  | Function;

/**
 * Values the converter refuses unless `convert` takes them over, because
 * their state lives in internal slots a copy cannot carry.
 *
 * Class instances are refused at runtime too, but TypeScript cannot tell an
 * instance type from a structurally identical plain object, so they are not
 * listed here.
 */
export type UnsupportedValue =
  | Error
  | Promise<unknown>
  | Map<any, any>
  | Set<any>
  | WeakMap<object, any>
  | WeakSet<object>
  | ArrayBuffer
  | ArrayBufferView;

/**
 * What `observable()` returns.
 *
 * - plain objects and arrays carry the Eventful API and emit `change`. Their
 *   members keep their declared type, whatever the `deep` option.
 * - primitives, dates, regular expressions and functions are boxed into
 *   `{ value }`.
 * - unsupported values resolve to `never`: converting one throws, so there is
 *   no result to describe.
 */
export type Converted<T> = T extends readonly any[] ? ConvertedArray<T>
  : T extends UnsupportedValue ? never
  : T extends ObservableValue ? ConvertedPrimitive<T>
  : T extends object ? ConvertedObject<T>
  : ConvertedPrimitive<T>;

export type ObservableFn = {
  /** Array overload */
  <T extends readonly any[]>(
    value: T,
    options?: ObservableOptions
  ): ConvertedArray<T>;

  /**
   * Unsupported value overload. Converting one of these throws a `TypeError`,
   * so the call resolves to `never`. Hold the value in a plain object, or take
   * it over with the `convert` option.
   */
  <T extends UnsupportedValue>(
    value: T,
    options?: ObservableOptions
  ): never;

  /** Value overload: a date, regular expression or function is boxed. */
  <T extends ObservableValue>(
    value: T,
    options?: ObservableOptions
  ): ConvertedPrimitive<T>;

  /** Plain object overload */
  <T extends object>(
    value: T,
    options?: ObservableOptions
  ): ConvertedObject<T>;

  /** Primitive overload (boxed as { value }) */
  <T>(
    value: T,
    options?: ObservableOptions
  ): ConvertedPrimitive<T>;

  /** Primitive overload without initial value */
  (): ConvertedPrimitive<undefined>;

  options: ObservableGlobalOptions;
};
