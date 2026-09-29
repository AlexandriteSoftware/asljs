import { asFunction,
         eventNameTypeGuard,
         functionTypeGuard,
         isFunction,
         isObject }
  from './guards.js';
import { instanceId,
         nextMessageContext,
         runInMessageContext }
  from './message-context.js';
import { ErrorFn,
         Eventful,
         EventfulFn,
         EventfulOptions,
         EventName,
         ListenerError,
         ListenerErrorArgs,
         TraceFn }
  from './types.js';

const ONCE_LISTENER =
  Symbol(
    'eventful.once.listener');

const EMPTY_LISTENERS: readonly Function[] =
  Object.freeze([ ]);

const eventfulImpl =
  <T extends object | Function | undefined>(
      object: T = Object.create(null),
      options: EventfulOptions = {}
    ):
  & (T extends undefined ? {} : T)
  & Eventful =>
  {
  if (
    !isObject(object)
    && !isFunction(object)
  ) {
    throw new TypeError(
      'Expect an object or a function.');
  }

  if (
    !Object.isExtensible(
      object as object)
  ) {
    throw new TypeError(
      `Expect an extensible object or function, but the object is ${
        describeInextensibility(
          object as object)
      }.`);
  }

  for (
    const method of [ 'on',
                      'once',
                      'off',
                      'emit',
                      'emitAsync',
                      'has',
                      'removeAllListeners',
                      'getListeners' ]
  ) {
    if (
      method
      in (object as object)
    ) {
      throw new Error(
        `Method "${method}" already exists.`);
    }
  }

  const {
    strict = false,
    trace = null,
    error = null
  } = options;

  const traceHook: TraceFn | null =
    (asFunction(trace) as TraceFn | undefined)
    ?? null;

  const errorHook: ErrorFn | null =
    (asFunction(error) as ErrorFn | undefined)
    ?? null;

  const enhanced =
    (object as unknown) !== eventful;

  const isTraced =
    (
        action: Parameters<TraceFn>[0]
      ): boolean =>
    {
    return traceHook !== null
      || (enhanced
        && eventful.has(action));
  };

  const traceFn: TraceFn =
    (
        action: Parameters<TraceFn>[0],
        payload: Parameters<TraceFn>[1]
      ): void =>
    {
    traceHook?.(
      action,
      payload
    );

    if (enhanced) {
      eventful.emit(
        action,
        payload);
    }
  };

  if (isTraced('new')) {
    traceFn(
      'new',
      { object,
        id:
          instanceId(object) });
  }

  const map = new Map<EventName, Set<Function>>();

  const properties =
    { enumerable: false,
      configurable: true,
      writable: true };

  Object.defineProperties(
    object as object,
    { on:
        Object.assign(
          { value: on },
          properties),
      once:
        Object.assign(
          { value: once },
          properties),
      off:
        Object.assign(
          { value: off },
          properties),
      emit:
        Object.assign(
          { value: emit },
          properties),
      emitAsync:
        Object.assign(
          { value: emitAsync },
          properties),
      has:
        Object.assign(
          { value: has },
          properties),
      removeAllListeners:
        Object.assign(
          { value: removeAllListeners },
          properties),
      getListeners:
        Object.assign(
          { value: getListeners },
          properties) });

  return object as (T extends undefined ? {} : T) & Eventful;

  function add(
      event: EventName,
      listener: Function
    ): void
  {
    let listeners =
      map.get(event);

    if (!listeners) {
      map.set(
        event,
        listeners = new Set());
    }

    listeners.add(listener);
  }

  function remove(
      event: EventName,
      listener: Function
    ): boolean
  {
    const listeners =
      map.get(event);

    if (!listeners) {
      return false;
    }

    let deleted =
      listeners.delete(listener);

    if (!deleted) {
      for (const candidate of listeners) {
        if (
          (candidate as { [ONCE_LISTENER]?: Function; })[ONCE_LISTENER]
          === listener
        ) {
          deleted =
            listeners.delete(candidate);

          break;
        }
      }
    }

    if (listeners.size === 0) {
      map.delete(event);
    }

    return deleted;
  }

  /**
   * Removes a listener and reports the removal, so that every path out of a
   * subscription reaches the trace: the `off` methods, the unsubscribe closure
   * `on` returns, and the automatic removal of a `once` listener.
   *
   * Only an actual removal is reported. A path that removes nothing, such as a
   * second call to an unsubscribe closure, stays silent so that a count of
   * `on` against `off` stays balanced.
   */
  function removeAndReport(
      event: EventName,
      listener: Function
    ): boolean
  {
    const removed =
      remove(
        event,
        listener);

    if (
      removed
      && isTraced('off')
    ) {
      traceFn(
        'off',
        { object,
          id:
            instanceId(object),
          event,
          listener });
    }

    return removed;
  }

  function reportListenerError(
      event: EventName,
      listener: Function,
      err: unknown
    ): void
  {
    const errorArgs: ListenerErrorArgs =
      { error: err,
        object:
          object as object | Function,
        event,
        listener };

    errorHook?.(errorArgs);

    if (
      object as unknown
      === eventful
      && event === 'error'
    ) {
      throw new ListenerError(
        'Error in a global error listener.',
        err,
        object as object | Function,
        event,
        listener);
    }

    // An error nobody consumed would otherwise vanish. Rethrowing it from a
    // microtask leaves this dispatch intact and hands the error to the
    // platform's unhandled-error channel instead of discarding it.
    const consumed =
      errorHook !== null
      || strict
      || eventful.has('error');

    eventful.emit(
      'error',
      errorArgs);

    if (!consumed) {
      void Promise.resolve().then(
        () =>
        {
          throw err;
        });
    }
  }

  function on(
      event: EventName,
      listener: Function
    ): () => boolean
  {
    eventNameTypeGuard(event);
    functionTypeGuard(listener);

    if (isTraced('on')) {
      traceFn(
        'on',
        { object,
          id:
            instanceId(object),
          event,
          listener });
    }

    add(
      event,
      listener);

    let active = true;

    return () =>
      active
        ? ((active = false),
          removeAndReport(
            event,
            listener))
        : false;
  }

  function once(
      event: EventName,
      listener: Function
    ): () => boolean
  {
    eventNameTypeGuard(event);
    functionTypeGuard(listener);

    const wrapper =
      (
          ...args: unknown[]
        ): void =>
      {
      off();

      listener(
        ...args);
    };

    Object.defineProperty(
      wrapper,
      ONCE_LISTENER,
      { value: listener });

    const off =
      on(
        event,
        wrapper);

    return off;
  }

  function off(
      event: EventName,
      listener?: Function
    ): boolean
  {
    eventNameTypeGuard(event);

    if (listener === undefined) {
      return removeEvent(event);
    }

    functionTypeGuard(listener);

    return removeAndReport(
      event,
      listener);
  }

  /**
   * Returns what is currently subscribed, as a snapshot.
   *
   * The map and its arrays are copies, so changing them does not change the
   * subscriptions. A `once` listener is reported as the function that was
   * passed to `once`, not as the wrapper that removes it.
   *
   * The snapshot holds every listener, and therefore everything the listener
   * closures hold. Read it and let it go; keeping it alive keeps them alive.
   */
  function getListeners(
    ): Map<EventName, Function[]>
  {
    const snapshot = new Map<EventName, Function[]>();

    for (const [event, listeners] of map) {
      snapshot.set(
        event,
        [ ...listeners ].map(
          listener =>
            (listener as { [ONCE_LISTENER]?: Function; })[ONCE_LISTENER]
              ?? listener));
    }

    return snapshot;
  }

  /**
   * Removes every listener of every event.
   *
   * Intended for an object you own and are discarding. Calling it on an object
   * you were handed removes other subscribers' listeners as well as your own.
   */
  function removeAllListeners(
    ): boolean
  {
    let removed = false;

    for (const event of [ ...map.keys() ]) {
      removed =
        removeEvent(event)
        || removed;
    }

    return removed;
  }

  /**
   * Removes every listener of one event, reporting each removal so that a
   * trace of subscriptions stays balanced.
   */
  function removeEvent(
      event: EventName
    ): boolean
  {
    const listeners =
      map.get(event);

    if (!listeners) {
      return false;
    }

    let removed = false;

    for (const listener of [ ...listeners ]) {
      removed =
        removeAndReport(
          event,
          listener)
        || removed;
    }

    return removed;
  }

  function has(
      event: EventName
    ): boolean
  {
    eventNameTypeGuard(event);

    return (map.get(event)?.size ?? 0) > 0;
  }

  function emit(
      event: EventName,
      ...args: unknown[]
    ): boolean
  {
    eventNameTypeGuard(event);

    const listeners =
      map.get(event);

    // The set is copied so that listeners added or removed by a listener take
    // effect on the next emit, not on this one.
    const snapshot: readonly Function[] =
      listeners
      ? [ ...listeners ]
      : EMPTY_LISTENERS;

    const context =
      nextMessageContext();

    if (isTraced('emit')) {
      traceFn(
        'emit',
        { object,
          id:
            instanceId(object),
          listeners:
            [ ...snapshot ],
          event,
          args,
          ...context });
    }

    if (snapshot.length === 0) {
      return false;
    }

    runInMessageContext(
      context,
      (): void =>
      {
        for (const listener of snapshot) {
          try {
            listener(
              ...args);
          } catch (err) {
            reportListenerError(
              event,
              listener,
              err);

            if (strict) {
              throw err;
            }
          }
        }
      });

    return true;
  }

  async function emitAsync(
      event: EventName,
      ...args: unknown[]
    ): Promise<boolean>
  {
    eventNameTypeGuard(event);

    const listeners =
      map.get(event);

    const snapshot: readonly Function[] =
      listeners
      ? [ ...listeners ]
      : EMPTY_LISTENERS;

    const context =
      nextMessageContext();

    if (isTraced('emitAsync')) {
      traceFn(
        'emitAsync',
        { object,
          id:
            instanceId(object),
          listeners:
            [ ...snapshot ],
          event,
          args,
          ...context });
    }

    if (snapshot.length === 0) {
      return false;
    }

    const calls =
      snapshot.map(
        async (
            listener
          ) =>
        {
        try {
          await runInMessageContext(
            context,
            () =>
              listener(
                ...args));
        } catch (err) {
          reportListenerError(
            event,
            listener,
            err);

          if (strict) {
            throw err;
          }
        }
      });

    await (strict
      ? Promise.all(calls)
      : Promise.allSettled(calls));

    return true;
  }
};

/**
 * Names the reason an object cannot take new properties. Freezing an object
 * with no properties also seals it, so the most specific true description is
 * reported first.
 */
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

  return 'not extensible';
}

export const eventful =
  eventfulImpl as EventfulFn;

eventful(eventful);
