
export type Listener<Args extends any[] = any[]> =
  (...args: Args) => any;

export type EventMap =
  Record<string | symbol, any[]>;

export interface Eventful<E extends EventMap =
  Record<string | symbol, any[]>> {
    /** Subscribe to an event. Returns an unsubscribe function. */
    on<K extends keyof E>(
      event: K,
      listener: Listener<E[K]>
    ): () => boolean;

    /** Subscribe once to an event. Returns an unsubscribe function (called automatically). */
    once<K extends keyof E>(
      event: K,
      listener: Listener<E[K]>
    ): () => boolean;

    /** Unsubscribe a previously registered listener. */
    off<K extends keyof E>(
      event: K,
      listener: Listener<E[K]>
    ): boolean;

    /** Emit an event synchronously. */
    emit<K extends keyof E>(
      event: K,
      ...args: E[K]
    ): void;

    /** Emit an event and wait for all listeners (run in parallel, errors isolated unless strict). */
    emitAsync<K extends keyof E>(
      event: K,
      ...args: E[K]
    ): Promise<void>;

    /** Returns true if there is at least one listener for the event. */
    has<K extends keyof E>(
      event: K
    ): boolean;
  }


export interface ErrorContext {
  object: object | Function;
  event: string | symbol;
  listener: Function;
}

type TracePayload =
  | {
      event: string | symbol;
      args: any[];
      listeners?: Function[];
    }
  | {
      object: object | Function;
    };

export interface EventfulOptions {
  /** If true, exceptions from listeners are propagated. Otherwise they are swallowed after calling `error`. */
  strict?: boolean;

  /** Optional tracing hook; defaults to `eventful.trace`. */
  trace?: ((
    object: object | Function,
    action: string,
    payload: TracePayload
  ) => void) | null;

  /** Optional error hook; defaults to `eventful.error`. */
  error?: ((
    err: unknown,
    context: ErrorContext
  ) => void) | null;
}


export interface EventfulFactory {
  <T extends object | Function | undefined,
   E extends EventMap = Record<string | symbol, any[]>>(
    object?: T,
    options?: EventfulOptions
  ): (T extends undefined ? {} : T) & Eventful<E>;

  /** Global hooks you can override. */
  options: {
    /** Default tracer. Replace to integrate with your logger. */
    trace: (
      object: object | Function,
      action: string,
      payload: TracePayload
    ) => void | null;

    /** Default error handler. Replace to integrate with your logger. */
    error: (
      err: unknown,
      context: ErrorContext
    ) => void | null;
  };
}

export const eventful: EventfulFactory;
