import { ListenerError } from './types.js';

import type {
  EventName,
  Eventful,
  EventfulFn,
  EventfulOptions,
  ListenerErrorArgs,
} from './types.js';

import {
  eventTypeGuard,
  functionTypeGuard,
  isFunction,
  isObject,
} from './guards.js';

const eventfulImpl =
  <T extends object | Function | undefined>(
    object: T = Object.create(null),
    options: EventfulOptions = {},
  ): (T extends undefined ? {} : T) & Eventful => 
  {
    if (!isObject(object)
      && !isFunction(object))
    {
      throw new TypeError(
        'Expect an object or a function.');
    }

    for (const method of ['on', 'once', 'off', 'emit', 'emitAsync', 'has']) {
      if ((object as any)[method] !== undefined) {
        throw new Error(
          `Method "${method}" already exists.`);
      }
    }

    const {
      strict = false,
      trace = null,
      error = null
    } = options;

    const traceHook =
      isFunction(trace)
        ? trace
        : null;

    const errorHook =
      isFunction(error)
        ? error
        : null;

    const enhanced =
      (object as any) !== eventful;

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
      object as any,
      { on: Object.assign({ value: on }, properties),
        once: Object.assign({ value: once }, properties),
        off: Object.assign({ value: off }, properties),
        emit: Object.assign({ value: emit }, properties),
        emitAsync: Object.assign({ value: emitAsync }, properties),
        has: Object.assign({ value: has }, properties) });

    return object as any;

    function traceFn(
      action: string,
      payload: any)
    {
      traceHook?.(
        action,
        payload);

      if (enhanced) {
        eventful.emit(
          action,
          payload);
      }
    }

    function add(
      event: EventName,
      listener: Function)
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
      listener: Function)
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
      err: any)
    {
      const errorArgs: ListenerErrorArgs =
        { error: err,
          object: object as any,
          event,
          listener };

      errorHook?.(errorArgs);

      if ((object as any) === eventful
        && event === 'error') 
      {
        throw new ListenerError(
          'Error in a global error listener.',
          err,
          object as any,
          event,
          listener);
      }

      eventful.emit(
        'error',
        errorArgs);
    }

    function on (
      event: EventName,
      listener: Function)
    {
      eventTypeGuard(event);
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
      return () => (active
        ? ((active = false), remove(event, listener))
        : false);
    }

    function once(
      event: EventName,
      listener: Function)
    {
      eventTypeGuard(event);
      functionTypeGuard(listener);

      const off =
        on(
          event,
          (...args: any[]) => {
            off();
            listener(...args);
          });

      return off;
    }

    function off(
      event: EventName,
      listener: Function)
    {
      eventTypeGuard(event);
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
      event: EventName)
    {
      eventTypeGuard(event);
      return (map.get(event)?.size ?? 0) > 0;
    }

    function emit(
      event: EventName,
      ...args: any[])
    {
      eventTypeGuard(event);

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
      ...args: any[])
    {
      eventTypeGuard(event);

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

(eventful as any)(eventful);
