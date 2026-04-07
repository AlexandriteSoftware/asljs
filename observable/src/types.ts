import type {
    EventMap,
    Eventful,
    EventfulFactory as DefaultEventfulFactory
  } from 'asljs-eventful';

export interface EventfulFactory {
  <T extends object | Function | undefined,
   E extends EventMap = Record<string | symbol, any[]>>(
    object?: T
  ): (T extends undefined ? {} : T) & Eventful<E>;
}

/**
 * Options for observable().
 */
export interface ObservableOptions {
  /**
   * Custom factory to augment the target with eventful API (defaults to
   * imported `asljs-eventful`).
   */
  eventful?: EventfulFactory | DefaultEventfulFactory;

  /**
   * Optional trace hook: `(object, action, payload)` invoked on 'new', 'set',
   * 'delete', 'define'.
   */
  trace?: ((
    object: object | Function,
    action: 'new' | 'set' | 'delete' | 'define',
    payload?: any
  ) => void) | null;

  /**
   * Controls nested conversion for object/array inputs.
   *
   * - `false` (default): recursively converts nested objects and arrays.
   * - `true`: converts only the top-level value.
   */
  shallow?: boolean;
}

/** Arrays: no 'define' events */
export type ArrayIndex = number;

export type ArraySetPayload<T extends readonly any[]> =
  | { index: ArrayIndex;
      value: ArrayElement<T>;
      previous: ArrayElement<T> | undefined }
  | { property: 'length';
      value: number;
      previous: number }
  | { property: string;
      value: unknown;
      previous: unknown };

export type ArrayDeletePayload<T extends readonly any[]> =
  | { index: ArrayIndex;
      previous: ArrayElement<T> | undefined }
  | { property: string;
      previous: unknown };

export type KeyedArraySetEvents<T extends readonly any[]> =
  { [K in ArrayIndex as `set:${PropString<K>}`]:
      [{ index: K;
         value: ArrayElement<T>;
         previous: ArrayElement<T> | undefined }] }
  & { 'set:length': [{ property: 'length';
                       value: number;
                       previous: number }] };

export type KeyedArrayDeleteEvents<T extends readonly any[]> =
  { [K in ArrayIndex as `delete:${PropString<K>}`]:
      [{ index: K;
         previous: ArrayElement<T> | undefined }] };

export type PropString<K> =
  K extends string
  ? K
  : K extends number
    ? `${K}`
    : never;

export type KeyableObject<T> =
  Extract<keyof T, string | number>;

export type ArrayElement<T extends readonly any[]> =
  T[number];

// Payloads for objects

export type SetPayloadFor<T, K extends keyof T> =
  { property: K;
    value: T[K];
    previous: T[K] | undefined; };

export type DeletePayloadFor<T, K extends keyof T> =
  { property: K;
    previous: T[K] | undefined; };

export type DefinePayloadFor<T, K extends keyof T> =
  { property: K;
    descriptor: PropertyDescriptor;
    previous: PropertyDescriptor | null; };

// Unkeyed payload unions (objects)

export type SetPayload<T> =
  { [K in keyof T]:
      SetPayloadFor<T, K> }[keyof T];

export type DeletePayload<T> =
  { [K in keyof T]:
      DeletePayloadFor<T, K> }[keyof T];

export type DefinePayload<T> =
  { [K in keyof T]:
      DefinePayloadFor<T, K> }[keyof T];

// Keyed events for objects

export type KeyedSetEvents<T> =
  { [K in KeyableObject<T> as `set:${PropString<K>}`]:
      [SetPayloadFor<T, Extract<K, keyof T>>]; };

export type KeyedDeleteEvents<T> =
  { [K in KeyableObject<T> as `delete:${PropString<K>}`]:
      [DeletePayloadFor<T, Extract<K, keyof T>>]; };

export type KeyedDefineEvents<T> =
  { [K in KeyableObject<T> as `define:${PropString<K>}`]:
      [DefinePayloadFor<T, Extract<K, keyof T>>]; };

/** Event map for plain objects (include 'define') */
export type ObservableEventsObject<T extends object> =
  & { 'set': [SetPayload<T>] }
  & { 'delete': [DeletePayload<T>] }
  & { 'define': [DefinePayload<T>] }
  & KeyedSetEvents<T>
  & KeyedDeleteEvents<T>
  & KeyedDefineEvents<T>;

/** Primitives: boxed as { value } and only 'set' events exist */
export type ObservableEventsPrimitive<T> =
  { 'set': [{ property: 'value'; value: T; previous: T }];
    'set:value': [{ property: 'value'; value: T; previous: T }]; };

export type ObservableTraceFn =
  (
    object: object | Function,
    action: 'new' | 'set' | 'delete' | 'define',
    payload?: any
  ) => void;

export interface ObservableGlobalOptions {
  trace: ObservableTraceFn | null;
}

export type WatchedValues<
    T,
    K extends readonly (keyof T)[]
  > =
  { [I in keyof K]:
      K[I] extends keyof T
        ? T[K[I]]
        : never; };

export type ObservableWatchFn =
  {
    <
        T extends object
      >(
        target: T,
        property: string,
        callback: (value: any) => void
      ): () => boolean;

    <
        T extends object,
        K extends readonly string[]
      >(
        target: T,
        properties: K,
        callback: (...values: any[]) => void
      ): () => boolean;
  };

export type WatchMethod<T extends Eventful> =
  {
    watch:
      {
        <K extends Extract<keyof T, string>>(
            property: K,
            callback: (value: T[K]) => void
          ): () => boolean;

        <K extends readonly (Extract<keyof T, string>)[]>(
            properties: K,
            callback: (...values: WatchedValues<T, K>) => void
          ): () => boolean;
      };
  };

export type ObservableArray<T extends readonly any[]> =
  T
  & Eventful<ObservableEventsArray<T>>
  & WatchMethod<T & Eventful<ObservableEventsArray<T>>>;

export type ObservableObject<T extends object> =
  T
  & Eventful<ObservableEventsObject<T>>
  & WatchMethod<T & Eventful<ObservableEventsObject<T>>>;

export type ObservablePrimitive<T> =
  { value: T }
  & Eventful<ObservableEventsPrimitive<T>>;

/**
 * Public observable composition type.
 *
 * - objects/arrays include Eventful API and a `watch()` helper.
 * - primitives are boxed into `{ value }` and include Eventful API.
 */
export type Observable<T> =
  T extends readonly any[]
    ? ObservableArray<T>
    : T extends object
      ? ObservableObject<T>
      : ObservablePrimitive<T>;

export type ObservableEventsArray<T extends readonly any[]> =
  & { 'set': [ArraySetPayload<T>] }
  & { 'delete': [ArrayDeletePayload<T>] }
  & KeyedArraySetEvents<T>
  & KeyedArrayDeleteEvents<T>;

export type ObservableFn = {
  /** Array overload */
  <T extends readonly any[]>(
    value: T,
    options?: ObservableOptions
  ): ObservableArray<T>;

  /** Object overload */
  <T extends object>(
    value: T,
    options?: ObservableOptions
  ): ObservableObject<T>;

  /** Primitive overload (boxed as { value }) */
  <T>(
    value: T,
    options?: ObservableOptions
  ): ObservablePrimitive<T>;

  /** Primitive overload without initial value */
  (): ObservablePrimitive<undefined>;

  watch: ObservableWatchFn;

  options: ObservableGlobalOptions;
};
