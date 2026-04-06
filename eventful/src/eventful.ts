import {
    ListenerError,
  type ErrorFn,
    type EventName,
    type Eventful,
    type EventfulFn,
    type EventfulOptions,
    type ListenerErrorArgs,
  type TraceFn,
  } from './types.js';

import {
    asFunction,
    eventNameTypeGuard,
    functionTypeGuard,
    isFunction,
    isObject,
  } from './guards.js';

const eventfulImpl =
  <T extends object | Function | undefined>(
      object: T = Object.create(null),
      options: EventfulOptions = {},
    ): (T extends undefined ? {} : T)
       & Eventful => 
  {
    if (!isObject(object)
        && !isFunction(object))
    {
      throw new TypeError(
        'Expect an object or a function.');
    }

    for (const method of ['on', 'once', 'off', 'emit', 'emitAsync', 'has']) {
      if (method in (object as object)) {
        throw new Error(
          `Method "${method}" already exists.`);
      }
    }

    const {
        strict = false,
        trace = null,
        error = null,
      } = options;

    const traceHook: TraceFn | null =
      (asFunction(trace) as TraceFn | undefined)
      ?? null;

    const errorHook: ErrorFn | null =
      (asFunction(error) as ErrorFn | undefined)
      ?? null;

    const enhanced =
      (object as unknown) !== eventful;

    const traceFn: TraceFn =
      (
          action: Parameters<TraceFn>[0],
          payload: Parameters<TraceFn>[1]
        ): void =>
      {
        traceHook?.(
          action,
          payload);

        if (enhanced) {
          eventful.emit(
            action,
            payload);
        }
      };

    traceFn(
      'new',
      { object });

    const emptySet =
      new Set<Function>();

    const map =
      new Map<EventName, Set<Function>>();

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

      if (!listeners)
        return false;

      const deleted =
        listeners.delete(listener);

      if (listeners.size === 0)
        map.delete(event);

      return deleted;
    }

    function reportListenerError(
        event: EventName,
        listener: Function,
        err: unknown
      ): void
    {
      const errorArgs: ListenerErrorArgs =
        { error: err,
          object: object as object | Function,
          event,
          listener };

      errorHook?.(errorArgs);

      if ((object as unknown) === eventful
          && event === 'error') 
      {
        throw new ListenerError(
          'Error in a global error listener.',
          err,
          object as object | Function,
          event,
          listener);
      }

      eventful.emit(
        'error',
        errorArgs);
    }

    function on(
        event: EventName,
        listener: Function
      ): () => boolean
    {
      eventNameTypeGuard(event);
      functionTypeGuard(listener);

      traceFn(
        'on',
        { object,
          event,
          listener });

      add(
        event,
        listener);

      let active = true;

      return () =>
        active
          ? ((active = false), remove(event, listener))
          : false;
    }

    function once(
        event: EventName,
        listener: Function
      ): () => boolean
    {
      eventNameTypeGuard(event);
      functionTypeGuard(listener);

      const off =
        on(
          event,
          (...args: unknown[]) => {
            off();
            listener(...args);
          });

      return off;
    }

    function off(
        event: EventName,
        listener: Function
      ): boolean
    {
      eventNameTypeGuard(event);
      functionTypeGuard(listener);

      traceFn(
        'off',
        { object,
          event,
          listener });

      return remove(
        event,
        listener);
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
      ): void
    {
      eventNameTypeGuard(event);

      const listeners =
          map.get(event)
          || emptySet;

      traceFn(
        'emit',
        { object,
          listeners: [...listeners],
          event,
          args });

      if (listeners.size === 0)
        return;

      for (const listener of listeners) {
        try {
          listener(...args);
        } catch (err) {
          reportListenerError(
            event,
            listener,
            err);

          if (strict)
            throw err;
        }
      }
    }

    async function emitAsync(
        event: EventName,
        ...args: unknown[]
      ): Promise<void>
    {
      eventNameTypeGuard(event);

      const listeners =
          map.get(event)
          || emptySet;

      traceFn(
        'emitAsync',
        { object,
          listeners: [...listeners],
          event,
          args });

      if (listeners.size === 0)
        return;

      const calls =
          [...listeners].map(
            async listener => {
              try {
                await listener(...args);
              } catch (err) {
                reportListenerError(
                  event,
                  listener,
                  err);

                if (strict)
                  throw err;
              }
            });

      await (strict
        ? Promise.all(calls)
        : Promise.allSettled(calls));
    }
  };

export const eventful =
  eventfulImpl as EventfulFn;

eventful(eventful);
