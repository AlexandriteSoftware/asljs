import { Eventful,
         EventfulFactory }
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
 * Names `eventful` occupies on every converted target.
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
   * Custom factory to augment the target with eventful API (defaults to
   * imported `asljs-eventful`).
   *
   * The factory itself is the seam for every `eventful` option, present and
   * future: pass a closure that supplies them.
   *
   * ```js
   * observable(model, { eventful: v => eventful(v, { strict: true }) });
   * ```
   */
  eventful?: EventfulFactory;

  /**
   * Optional trace hook: `(object, action, payload)` invoked on `'new'` with
   * `{ object }`, and on `'change'` with the entry list of one delivery.
   */
  trace?: ObservableTraceFn | null;

  /**
   * Controls nested conversion for object/array inputs.
   *
   * - `false` (default): converts only the top-level value.
   * - `true`: recursively converts nested objects and arrays.
   *
   * The return type is the same either way: only the top-level value is
   * guaranteed to be converted, and members keep their declared type.
   */
  deep?: boolean;

  /**
   * Optional hook consulted for every object reached during conversion,
   * before observable applies its own rule. See `ObservableConvertFn`.
   */
  convert?: ObservableConvertFn | null;
}

/**
 * Takes over conversion for a single value.
 *
 * Called with every object observable reaches, including the values it would
 * otherwise refuse, and before its own rule is applied. With
 * throw-by-default it is the only escape from an unsupported value.
 *
 * - Return a wrapper to take over that value. It is stored in place of the
 *   original and, like anything else observable converts, one wrapper is
 *   reused for every reference to the same target.
 * - Return the value itself to keep it as it is, even if observable would
 *   normally convert or refuse it.
 * - Return `undefined` to let observable decide.
 *
 * A wrapper should conform to the contract -- `on`, `off`, and a `change`
 * event -- so that a query can bind to it along a path. Observable does not
 * check this, and it does not emit `new` for a wrapper it did not create.
 *
 * Primitives are never passed to the hook: they have nothing to observe.
 */
export type ObservableConvertFn =
  (
    value: object
  ) =>
    unknown;

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
 * converter refuses and at leaf kinds, so a path can only name something that
 * is actually there.
 */
export type ObservablePath<
  T,
  Depth extends readonly unknown[] = []
> = Depth['length'] extends ObservablePathDepthLimit ? never
  : T extends UnsupportedValue ? never
  : T extends Function ? never
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
 * Values the converter refuses, because a proxy cannot forward access to their
 * internal slots and storing them silently would leave the model half
 * observable with no indication.
 *
 * `Date` is refused like the rest: there is no immutable `Date` in JavaScript,
 * so admitting it would carve out the one leaf that is both mutable and
 * value-like. The `convert` hook is the answer for a model that genuinely
 * holds one.
 *
 * Class instances are refused at runtime too, but TypeScript cannot tell an
 * instance type from a structurally identical plain object, so they are not
 * listed here.
 */
export type UnsupportedValue =
  | Date
  | RegExp
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
 * - primitives are boxed into `{ value }`.
 * - unsupported values resolve to `never`: converting one throws, so there is
 *   no result to describe.
 */
export type Converted<T> = T extends readonly any[] ? ConvertedArray<T>
  : T extends UnsupportedValue ? never
  : T extends Function ? never
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
  <T extends UnsupportedValue | Function>(
    value: T,
    options?: ObservableOptions
  ): never;

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
