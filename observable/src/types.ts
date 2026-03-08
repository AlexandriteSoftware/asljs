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
}

/** Arrays: no 'define' events */
type ArrayIndex = number;

type ArraySetPayload<T extends readonly any[]> =
  | { index: ArrayIndex;
      value: ArrayElement<T>;
      previous: ArrayElement<T> | undefined }
  | { property: 'length';
      value: number;
      previous: number }
  | { property: string;
      value: unknown;
      previous: unknown };

type ArrayDeletePayload<T extends readonly any[]> =
  | { index: ArrayIndex;
      previous: ArrayElement<T> | undefined }
  | { property: string;
      previous: unknown };

type KeyedArraySetEvents<T extends readonly any[]> =
  { [K in ArrayIndex as `set:${PropString<K>}`]:
      [{ index: K;
         value: ArrayElement<T>;
         previous: ArrayElement<T> | undefined }] }
  & { 'set:length': [{ property: 'length';
                       value: number;
                       previous: number }] };

type KeyedArrayDeleteEvents<T extends readonly any[]> =
  { [K in ArrayIndex as `delete:${PropString<K>}`]:
      [{ index: K;
         previous: ArrayElement<T> | undefined }] };

type PropString<K> =
  K extends string
  ? K
  : K extends number
    ? `${K}`
    : never;

type KeyableObject<T> =
  Extract<keyof T, string | number>;

type ArrayElement<T extends readonly any[]> =
  T[number];

// Payloads for objects

type SetPayloadFor<T, K extends keyof T> =
  { property: K;
    value: T[K];
    previous: T[K] | undefined; };

type DeletePayloadFor<T, K extends keyof T> =
  { property: K;
    previous: T[K] | undefined; };

type DefinePayloadFor<T, K extends keyof T> =
  { property: K;
    descriptor: PropertyDescriptor;
    previous: PropertyDescriptor | null; };

// Unkeyed payload unions (objects)

type SetPayload<T> =
  { [K in keyof T]:
      SetPayloadFor<T, K> }[keyof T];

type DeletePayload<T> =
  { [K in keyof T]:
      DeletePayloadFor<T, K> }[keyof T];

type DefinePayload<T> =
  { [K in keyof T]:
      DefinePayloadFor<T, K> }[keyof T];

// Keyed events for objects

type KeyedSetEvents<T> =
  { [K in KeyableObject<T> as `set:${PropString<K>}`]:
      [SetPayloadFor<T, Extract<K, keyof T>>]; };

type KeyedDeleteEvents<T> =
  { [K in KeyableObject<T> as `delete:${PropString<K>}`]:
      [DeletePayloadFor<T, Extract<K, keyof T>>]; };

type KeyedDefineEvents<T> =
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
  <
      T extends Eventful,
      K extends readonly (Extract<keyof T, string>)[]
    >(
      target: T,
      properties: K,
      callback: (...values: WatchedValues<T, K>) => void
    ) => void;

type WatchMethod<T extends Eventful> =
  {
    watch:
      <K extends readonly (Extract<keyof T, string>)[]>(
          properties: K,
          callback: (...values: WatchedValues<T, K>) => void
        ) => void;
  };

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
  ): T
    & Eventful<ObservableEventsArray<T>>
    & WatchMethod<T & Eventful<ObservableEventsArray<T>>>;

  /** Object overload */
  <T extends object>(
    value: T,
    options?: ObservableOptions
  ): T
    & Eventful<ObservableEventsObject<T>>
    & WatchMethod<T & Eventful<ObservableEventsObject<T>>>;

  /** Primitive overload (boxed as { value }) */
  <T>(
    value: T,
    options?: ObservableOptions
  ): { value: T } & Eventful<ObservableEventsPrimitive<T>>;

  /** Primitive overload without initial value */
  (): { value: undefined } & Eventful<ObservableEventsPrimitive<undefined>>;

  watch: ObservableWatchFn;

  options: ObservableGlobalOptions;
};
