export type EventName =
  string | symbol;

export type EventMap =
  Record<EventName, any[]>;

export type Listener<Args extends any[] = any[]> =
  (...args: Args) => any;

export interface ListenerErrorArgs {
  error: any;
  object: object | Function;
  event: EventName;
  listener: Function;
}

export class ListenerError
  extends Error
  implements ListenerErrorArgs
{
  error: any;
  object: object | Function;
  event: EventName;
  listener: Function;

  constructor(
      message: string,
      error: any,
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

type TraceAction =
  'new'
  | 'on'
  | 'off'
  | 'emit'
  | 'emitAsync';

type TracePayloadByAction = {
  new: {
    object: object | Function;
  };

  on: {
    object: object | Function;
    event: EventName;
    listener: Function;
  };

  off: {
    object: object | Function;
    event: EventName;
    listener: Function;
  };

  emit: {
    object: object | Function;
    listeners: Function[];
    event: EventName;
    args: any[];
  };

  emitAsync: {
    object: object | Function;
    listeners: Function[];
    event: EventName;
    args: any[];
  };
};

export type TraceFn =
  <A extends TraceAction>(
      action: A,
      args: TracePayloadByAction[A]
    ) => void;

export type EventfulFn =
  EventfulFactory & Eventful;

export interface EventfulFactory {
  <T extends object | Function | undefined,
   E extends EventMap = EventMap>(
    object?: T,
    options?: EventfulOptions
  ): (T extends undefined ? {} : T) & Eventful<E>;
}

export interface EventfulOptions {
  /**
   * If true, exceptions from listeners are propagated (fail fast).
   * When false, errors are isolated (ignored) after calling `error` hook.
   */
  strict?: boolean;

  /**
   * Optional tracing hook. Receives action name and a safe payload.
   * Actions include: 'new', 'on', 'off', 'emit', 'emitAsync'.
   * Use to integrate with your logger without exposing internals.
   */
  trace?: TraceFn | null;

  /**
   * Optional error hook. Receives structured context of listener failures
   * (error, object, event, listener). Called for sync and async errors.
   */
  error?: ((error: ListenerErrorArgs) => void) | null;
}

export interface Eventful<E extends EventMap = EventMap> {
  /**
   * Subscribe to an event. Returns an unsubscribe function.
   */
  on(
      event: keyof E & EventName,
      listener: Listener<E[keyof E & EventName]>
    ): () => boolean;

  /**
   * Subscribe once to an event. Returns an unsubscribe function
   * (called automatically).
   */
  once(
      event: keyof E & EventName,
      listener: Listener<E[keyof E & EventName]>
    ): () => boolean;

  /**
   * Unsubscribe a previously registered listener. Returns true if removed.
   */
  off(
      event: keyof E & EventName,
      listener: Listener<E[keyof E & EventName]>
    ): boolean;

  /**
   * Emit an event synchronously. All listeners run in order.
   * Errors are isolated (ignored) unless `strict` is true.
   */
  emit(
      event: keyof E & EventName,
      ...args: E[keyof E & EventName]
    ): void;

  /**
   * Emit an event and wait for all listeners (run in parallel).
   * Errors are isolated (ignored) unless `strict` is true.
   */
  emitAsync(
      event: keyof E & EventName,
      ...args: E[keyof E & EventName]
    ): Promise<void>;

  /**
   * Returns true if there is at least one listener for the event.
   */
  has(
      event: keyof E & EventName
    ): boolean;
}
