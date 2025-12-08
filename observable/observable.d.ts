import type { Eventful, EventfulFactory } from 'asljs-eventful';

/** Options for observable() */
export interface ObservableOptions {
  /** Custom factory to augment the target with eventful API (defaults to imported `asljsEventful`). */
  eventful?: EventfulFactory;
}

/** Utilities */
type PropString<K> = K extends string ? K : K extends number ? `${K}` : never;
type KeyableObject<T> = Extract<keyof T, string | number>;
type ArrayElement<T extends readonly any[]> = T[number];

/** Payloads for objects */
type SetPayloadFor<T, K extends keyof T> = {
  property: K;
  value: T[K];
  previous: T[K] | undefined;
};
type DeletePayloadFor<T, K extends keyof T> = {
  property: K;
  previous: T[K] | undefined;
};
type DefinePayloadFor<T, K extends keyof T> = {
  property: K;
  descriptor: PropertyDescriptor;
  previous: PropertyDescriptor | null;
};

/** Unkeyed payload unions (objects) */
type SetPayload<T> = { [K in keyof T]: SetPayloadFor<T, K> }[keyof T];
type DeletePayload<T> = { [K in keyof T]: DeletePayloadFor<T, K> }[keyof T];
type DefinePayload<T> = { [K in keyof T]: DefinePayloadFor<T, K> }[keyof T];

/** Keyed events for objects */
type KeyedSetEvents<T> = {
  [K in KeyableObject<T> as `set:${PropString<K>}`]: [SetPayloadFor<T, Extract<K, keyof T>>];
};
type KeyedDeleteEvents<T> = {
  [K in KeyableObject<T> as `delete:${PropString<K>}`]: [DeletePayloadFor<T, Extract<K, keyof T>>];
};
type KeyedDefineEvents<T> = {
  [K in KeyableObject<T> as `define:${PropString<K>}`]: [DefinePayloadFor<T, Extract<K, keyof T>>];
};

/** Full event map for plain objects (include 'define') */
export type ObservableEventsObject<T extends object> =
  & { 'set': [SetPayload<T>] }
  & { 'delete': [DeletePayload<T>] }
  & { 'define': [DefinePayload<T>] }
  & KeyedSetEvents<T>
  & KeyedDeleteEvents<T>
  & KeyedDefineEvents<T>;

/** Arrays: no 'define' events (implementation sets includeDefine = false) */
type ArrayIndex = number;
type ArraySetPayload<T extends readonly any[]> =
  | { property: ArrayIndex; value: ArrayElement<T>; previous: ArrayElement<T> | undefined }
  | { property: 'length'; value: number; previous: number };
type ArrayDeletePayload<T extends readonly any[]> =
  { property: ArrayIndex; previous: ArrayElement<T> | undefined };

type KeyedArraySetEvents<T extends readonly any[]> = {
  [K in ArrayIndex as `set:${PropString<K>}`]: [Extract<ArraySetPayload<T>, { property: K }>]
} & {
  'set:length': [Extract<ArraySetPayload<T>, { property: 'length' }>]
};

type KeyedArrayDeleteEvents<T extends readonly any[]> = {
  [K in ArrayIndex as `delete:${PropString<K>}`]: [ArrayDeletePayload<T>]
};

export type ObservableEventsArray<T extends readonly any[]> =
  & { 'set': [ArraySetPayload<T>] }
  & { 'delete': [ArrayDeletePayload<T>] }
  & KeyedArraySetEvents<T>
  & KeyedArrayDeleteEvents<T>;

/** Primitives: boxed as { value } and only 'set' events exist */
export type ObservableEventsPrimitive<T> = {
  'set': [{ property: 'value'; value: T; previous: T }];
  'set:value': [{ property: 'value'; value: T; previous: T }];
};

/**
 * Creates an observable object/array/primitive that emits events on changes.
 *
 * Events:
 *  - 'set' / `set:<prop>`       payload: { property, value, previous }
 *  - 'delete' / `delete:<prop>` payload: { property, previous }
 *  - 'define' / `define:<prop>` payload: { property, descriptor, previous }  (objects only)
 *
 * Emissions are fire-and-forget; listener errors are isolated by the underlying eventful emitter.
 */

/** Array overload (no 'define' events) */
export function observable<T extends readonly any[]>(
  value: T,
  options?: ObservableOptions
): T & Eventful<ObservableEventsArray<T>>;

/** Object overload (includes 'define' events) */
export function observable<T extends object>(
  value: T,
  options?: ObservableOptions
): T & Eventful<ObservableEventsObject<T>>;

/** Primitive overload (boxed as { value }) */
export function observable<T>(
  value: T,
  options?: ObservableOptions
): { value: T } & Eventful<ObservableEventsPrimitive<T>>;
