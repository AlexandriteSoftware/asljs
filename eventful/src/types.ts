export type EventName = string | symbol;

export type EventMap = Record<EventName, unknown[]>;

export type Listener<Args extends unknown[] = unknown[]> =
  (
    ...args: Args
  ) =>
    unknown;

export interface ListenerErrorArgs
{
  error: unknown;
  object: object | Function;
  event: EventName;
  listener: Function;
}

export class ListenerError extends Error implements ListenerErrorArgs
{
  error: unknown;
  object: object | Function;
  event: EventName;
  listener: Function;

  constructor(
    message: string,
    error: unknown,
    object: object | Function,
    event: EventName,
    listener: Function
  )
  {
    super(message);

    this.name = 'ListenerError';

    this.error = error;
    this.object = object;
    this.event = event;
    this.listener = listener;
  }
}

/**
 * Identity of a single message, and its place in the chain that produced it.
 *
 * `correlationId` is shared by every message in one interaction.
 * `causationId` is the message whose dispatch caused this one, and is null for
 * a message that starts an interaction.
 */
export interface MessageContext
{
  messageId: string;
  correlationId: string;
  causationId: string | null;
}

type TraceAction =
  | 'new'
  | 'on'
  | 'off'
  | 'emit'
  | 'emitAsync';

type TracePayloadByAction = {
  new: {
    object: object | Function;
    id: string;
  };

  on: {
    object: object | Function;
    id: string;
    event: EventName;
    listener: Function;
  };

  off: {
    object: object | Function;
    id: string;
    event: EventName;
    listener: Function;
  };

  emit:
    & {
      object: object | Function;
      id: string;
      listeners: Function[];
      event: EventName;
      args: unknown[];
    }
    & MessageContext;

  emitAsync:
    & {
      object: object | Function;
      id: string;
      listeners: Function[];
      event: EventName;
      args: unknown[];
    }
    & MessageContext;
};

export type TraceFn =
  <A extends TraceAction>(
    action: A,
    args: TracePayloadByAction[A]
  ) =>
    void;

export type ErrorFn =
  (
    error: ListenerErrorArgs
  ) =>
    void;

export type EventfulFn =
  & EventfulFactory
  & Eventful;

export interface EventfulFactory
{
  <T extends object | Function | undefined, E extends EventMap = EventMap>(
    object?: T,
    options?: EventfulOptions
  ): (T extends undefined ? {} : T) & Eventful<E>;
}

export interface EventfulOptions
{
  /**
   * If true, exceptions from listeners are propagated (fail fast).
   * When false, errors are isolated: the remaining listeners still run, and
   * the error is offered to the `error` hook and to the package-level
   * `error` event. An error that neither consumes is rethrown from a
   * microtask, so it reaches the platform's unhandled-error channel rather
   * than being discarded.
   */
  strict?: boolean;

  /**
   * Optional tracing hook. Receives action name and a safe payload.
   * Actions include: 'new', 'on', 'off', 'emit', 'emitAsync'.
   * Use to integrate with your logger without exposing internals.
   */
  trace?: TraceFn;

  /**
   * Optional error hook. Receives structured context of listener failures
   * (error, object, event, listener). Called for sync and async errors.
   * Providing it counts as consuming the error, which suppresses the
   * microtask rethrow described on `strict`.
   */
  error?: ErrorFn;
}

export interface Eventful<E extends EventMap = EventMap>
{
  /**
   * Subscribe to an event. Returns an unsubscribe function.
   */
  on<K extends keyof E & EventName>(
    event: K,
    listener: Listener<E[K]>
  ): () => boolean;

  /**
   * Subscribe once to an event. Returns an unsubscribe function
   * (called automatically).
   */
  once<K extends keyof E & EventName>(
    event: K,
    listener: Listener<E[K]>
  ): () => boolean;

  /**
   * Unsubscribe a previously registered listener. Returns true if removed.
   *
   * Called without a listener, removes every listener of that event and
   * returns true if any were removed. The bulk form removes other
   * subscribers' listeners too, so use it only on an object you own.
   */
  off<K extends keyof E & EventName>(
    event: K,
    listener?: Listener<E[K]>
  ): boolean;

  /**
   * Remove every listener of every event. Returns true if any were removed.
   *
   * Intended for an object you own and are discarding, where dropping the
   * listeners in one step releases what their closures hold and stops a late
   * emit from reaching a torn down subscriber. On an object you were handed,
   * unsubscribe your own listeners instead: this removes everyone's.
   */
  removeAllListeners(): boolean;

  /**
   * Emit an event synchronously. All listeners run in order.
   * Errors are isolated (ignored) unless `strict` is true.
   * Returns true if the event had at least one listener.
   */
  emit<K extends keyof E & EventName>(
    event: K,
    ...args: E[K]
  ): boolean;

  /**
   * Emit an event and wait for all listeners (run in parallel).
   * Errors are isolated (ignored) unless `strict` is true.
   * Resolves to true if the event had at least one listener.
   */
  emitAsync<K extends keyof E & EventName>(
    event: K,
    ...args: E[K]
  ): Promise<boolean>;

  /**
   * Returns true if there is at least one listener for the event.
   */
  has<K extends keyof E & EventName>(
    event: K
  ): boolean;
}
