import { Eventful,
         EventfulFactory as DefaultEventfulFactory,
         EventMap }
  from 'asljs-eventful';

export interface EventfulFactory
{
  <
    T extends object | Function | undefined,
    E extends EventMap = Record<string | symbol, any[]>
  >(
    object?: T
  ): (T extends undefined ? {} : T) & Eventful<E>;
}

/**
 * Options for observable().
 */
export interface ObservableOptions
{
  /**
   * Custom factory to augment the target with eventful API (defaults to
   * imported `asljs-eventful`).
   */
  eventful?: EventfulFactory | DefaultEventfulFactory;

  /**
   * Optional trace hook: `(object, action, payload)` invoked on 'new', 'set',
   * 'delete', 'define'.
   */
  trace?:
    | ((
      object: object | Function,
      action: 'new' | 'set' | 'delete' | 'define',
      payload?: any
    ) => void)
    | null;

  /**
   * Controls nested conversion for object/array inputs.
   *
   * - `false` (default): recursively converts nested objects and arrays.
   * - `true`: converts only the top-level value.
   */
  shallow?: boolean;

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
 * otherwise treat as opaque, and before its own rule is applied.
 *
 * - Return a wrapper to take over that value. It is stored in place of the
 *   original and, like anything else observable converts, one wrapper is
 *   reused for every reference to the same target.
 * - Return the value itself to keep it as it is, even if observable would
 *   normally convert it.
 * - Return `undefined` to let observable decide.
 *
 * A wrapper should carry the Eventful API and emit `set:<property>` so that
 * `watch(...)` can bind to it along a path. Observable does not check this,
 * and it does not emit `new` for a wrapper it did not create.
 *
 * Primitives are never passed to the hook: they have nothing to observe.
 */
export type ObservableConvertFn =
  (
    value: object
  ) =>
    unknown;

/** Arrays: no 'define' events */
export type ArrayIndex = number;

export type ArraySetPayload<T extends readonly any[]> =
  | {
    index: ArrayIndex;
    value: ArrayElement<T>;
    previous: ArrayElement<T> | undefined;
  }
  | { property: 'length'; value: number; previous: number; }
  | { property: string; value: unknown; previous: unknown; };

export type ArrayDeletePayload<T extends readonly any[]> =
  | { index: ArrayIndex; previous: ArrayElement<T> | undefined; }
  | { property: string; previous: unknown; };

export type KeyedArraySetEvents<T extends readonly any[]> =
  & {
    [K in ArrayIndex as `set:${PropString<K>}`]: [
      {
        index: K;
        value: ArrayElement<T>;
        previous: ArrayElement<T> | undefined;
      }
    ];
  }
  & {
    'set:length': [{ property: 'length'; value: number; previous: number; }];
  };

export type KeyedArrayDeleteEvents<T extends readonly any[]> = {
  [K in ArrayIndex as `delete:${PropString<K>}`]: [
    { index: K; previous: ArrayElement<T> | undefined; }
  ];
};

export type PropString<K> = K extends string ? K
  : K extends number ? `${K}`
  : never;

export type KeyableObject<T> = Extract<keyof T, string | number>;

export type ArrayElement<T extends readonly any[]> = T[number];

// Payloads for objects

export type SetPayloadFor<T, K extends keyof T> = {
  property: K;
  value: T[K];
  previous: T[K] | undefined;
};

export type DeletePayloadFor<T, K extends keyof T> = {
  property: K;
  previous: T[K] | undefined;
};

export type DefinePayloadFor<T, K extends keyof T> = {
  property: K;
  descriptor: PropertyDescriptor;
  previous: PropertyDescriptor | null;
};

// Unkeyed payload unions (objects)

export type SetPayload<T> = { [K in keyof T]: SetPayloadFor<T, K>; }[keyof T];

export type DeletePayload<T> = {
  [K in keyof T]: DeletePayloadFor<T, K>;
}[keyof T];

export type DefinePayload<T> = {
  [K in keyof T]: DefinePayloadFor<T, K>;
}[keyof T];

// Keyed events for objects

export type KeyedSetEvents<T> = {
  [K in KeyableObject<T> as `set:${PropString<K>}`]: [
    SetPayloadFor<T, Extract<K, keyof T>>
  ];
};

export type KeyedDeleteEvents<T> = {
  [K in KeyableObject<T> as `delete:${PropString<K>}`]: [
    DeletePayloadFor<T, Extract<K, keyof T>>
  ];
};

export type KeyedDefineEvents<T> = {
  [K in KeyableObject<T> as `define:${PropString<K>}`]: [
    DefinePayloadFor<T, Extract<K, keyof T>>
  ];
};

/** Event map for plain objects (include 'define') */
export type ObservableEventsObject<T extends object> =
  & { set: [SetPayload<T>]; }
  & { delete: [DeletePayload<T>]; }
  & { define: [DefinePayload<T>]; }
  & KeyedSetEvents<T>
  & KeyedDeleteEvents<T>
  & KeyedDefineEvents<T>;

/** Primitives: boxed as { value } and only 'set' events exist */
export type ObservableEventsPrimitive<T> = {
  set: [{ property: 'value'; value: T; previous: T; }];
  'set:value': [{ property: 'value'; value: T; previous: T; }];
};

export type ObservableTraceFn =
  (
    object: object | Function,
    action: 'new' | 'set' | 'delete' | 'define',
    payload?: any
  ) =>
    void;

export interface ObservableGlobalOptions
{
  trace: ObservableTraceFn | null;
}

export type WatchedValues<
  T,
  K extends readonly (keyof T)[]
> = {
  [I in keyof K]: K[I] extends keyof T ? T[K[I]]
    : never;
};

export type ObservableWatchFn = {
  <
    T extends object,
    P extends WatchPath<T>
  >(
    target: T,
    path: P,
    callback: (value: WatchPathValue<T, P>) => void
  ): () => boolean;

  <
    T extends object,
    P extends readonly WatchPath<T>[] | []
  >(
    target: T,
    paths: P,
    callback: (...values: WatchPathValues<T, P>) => void
  ): () => boolean;
};

/**
 * How deep `WatchPath` descends. The cap is what stops a self-referential
 * model from expanding forever, so it cannot be removed, only tuned.
 */
type WatchPathDepthLimit = 5;

/**
 * Every dotted path that can be read out of `T`, as a union of string
 * literals: `'user' | 'user.name' | 'active'` and so on.
 *
 * Descent stops where the runtime stops converting -- arrays, opaque values,
 * and primitives are leaves -- so a path can only name something that
 * actually emits.
 */
export type WatchPath<
  T,
  Depth extends readonly unknown[] = []
> = Depth['length'] extends WatchPathDepthLimit ? never
  : T extends readonly any[] ? never
  : T extends ObservableOpaque ? never
  : T extends object ? {
      [K in Extract<keyof T, string>]:
        | K
        | (WatchPath<T[K], [...Depth, unknown]> extends
          infer Rest extends string ? `${K}.${Rest}`
          : never);
    }[Extract<keyof T, string>]
  : never;

/** The type of the value a `WatchPath` resolves to. */
export type WatchPathValue<T, P extends string> = P extends
  `${infer Head}.${infer Rest}`
  ? Head extends keyof T ? WatchPathValue<T[Head], Rest>
  : never
  : P extends keyof T ? T[P]
  : never;

/** Values a multi-path watch reports, one per requested path, in order. */
export type WatchPathValues<T, P extends readonly string[]> = {
  [I in keyof P]: WatchPathValue<T, P[I] & string>;
};

/**
 * The `watch` method observable injects.
 *
 * Parameterised on the bare model rather than on `T & Eventful<...>`, so the
 * eventful methods are not offered as watchable properties.
 */
export type WatchMethod<T> = {
  watch: {
    <P extends WatchPath<T>>(
      path: P,
      callback: (value: WatchPathValue<T, P>) => void
    ): () => boolean;

    // `| [ ]` is what makes TypeScript infer a tuple here rather than an
    // array of unions, which is what keeps the callback values positional.
    <P extends readonly WatchPath<T>[] | []>(
      paths: P,
      callback: (...values: WatchPathValues<T, P>) => void
    ): () => boolean;
  };
};

/**
 * How deep `ObservableMembers` describes the conversion. Past the cap members
 * are described as they are, which keeps a self-referential model finite.
 */
type ObservableDepthLimit = 5;

/**
 * A nested member of an observable.
 *
 * Conversion is deep, so every nested plain object and array carries the
 * Eventful API, and the type says so without hedging. That applies to
 * assignment too: a property of an observable holds an observable, so
 * assigning a plain object is rejected and the value has to be wrapped
 * first.
 *
 * ```ts
 * state.user = observable({ name: 'Bob' });
 * ```
 *
 * The runtime still converts a plain value assigned from JavaScript, and it
 * converts with the options the parent was created with, which an explicitly
 * wrapped value does not inherit.
 */
export type ObservableMember<
  T,
  Depth extends readonly unknown[] = []
> = T extends ObservableOpaque ? T
  : T extends readonly any[] ?
      & ObservableMembers<T, [...Depth, unknown]>
      & Eventful<ObservableEventsArray<T>>
  : T extends object ?
      & ObservableMembers<T, [...Depth, unknown]>
      & Eventful<ObservableEventsObject<T>>
      & WatchMethod<T>
  : T;

/** Members of `T`, each described as conversion leaves it. */
export type ObservableMembers<
  T,
  Depth extends readonly unknown[] = []
> = Depth['length'] extends ObservableDepthLimit ? T
  : { [K in keyof T]: ObservableMember<T[K], Depth>; };

/**
 * Arrays deliberately carry no `watch`: `watch(...)` throws for them at
 * runtime, so offering it would only move the failure later.
 */
export type ObservableArray<T extends readonly any[]> =
  & ObservableMembers<T>
  & Eventful<ObservableEventsArray<T>>;

export type ObservableObject<T extends object> =
  & ObservableMembers<T>
  & Eventful<ObservableEventsObject<T>>
  & WatchMethod<T>;

export type ObservablePrimitive<T> =
  & { value: T; }
  & Eventful<ObservableEventsPrimitive<T>>;

/**
 * Values observable never converts, because a proxy cannot forward access to
 * their internal slots. They are stored as-is when nested, and boxed into
 * `{ value }` when passed as the top-level target.
 *
 * Class instances are opaque at runtime too, but TypeScript cannot tell an
 * instance type from a structurally identical plain object, so they are not
 * listed here.
 */
export type ObservableOpaque =
  | Function
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
 * Public observable composition type.
 *
 * - plain objects/arrays include Eventful API and a `watch()` helper.
 * - primitives are boxed into `{ value }` and include Eventful API.
 * - opaque values resolve to `never`: observing one directly throws, so there
 *   is no result to describe.
 */
export type Observable<T> = T extends readonly any[] ? ObservableArray<T>
  : T extends ObservableOpaque ? never
  : T extends object ? ObservableObject<T>
  : ObservablePrimitive<T>;

export type ObservableEventsArray<T extends readonly any[]> =
  & { set: [ArraySetPayload<T>]; }
  & { delete: [ArrayDeletePayload<T>]; }
  & KeyedArraySetEvents<T>
  & KeyedArrayDeleteEvents<T>;

export type ObservableFn = {
  /** Array overload */
  <T extends readonly any[]>(
    value: T,
    options?: ObservableOptions
  ): ObservableArray<T>;

  /**
   * Opaque value overload. Observing one of these directly throws a
   * `TypeError`, so the call resolves to `never`. Hold the value in a plain
   * object, or take it over with the `convert` option.
   */
  <T extends ObservableOpaque>(
    value: T,
    options?: ObservableOptions
  ): never;

  /** Plain object overload */
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
