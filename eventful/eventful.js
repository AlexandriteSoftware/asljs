/**
 * @typedef {Object} ErrorContext
 * @property {Object|Function} object The object emitting the event.
 * @property {string|symbol} event The event name.
 * @property {Function} listener The listener function that caused the error.
 */

/**
 * @typedef {Object} EventfulOptions
 * @property {boolean} [strict] If true, exceptions from listeners are propagated.
 * @property {(object: Object|Function, action: string, payload: any) => void} [trace] Optional tracing hook.
 * @property {(err: any, context: ErrorContext) => void} [error] Optional error hook.
 */

/**
 * A mixin that adds event emitter capabilities to an object.
 *
 * The method returns the original object enhanced with the event
 * subscribing and emitting methods.
 * 
 * If no object is provided, a new empty object is created and enhanced.
 * 
 * The options can configure the behavior of the event emitter.
 * 
 * @param {Object|Function} object The object to enhance.
 * @param {EventfulOptions} options The options to configure the event emitter.
 * @returns {Object|Function} The enhanced object.
 * 
 * @throws {TypeError} If the first argument is not an object or function.
 */
const eventful =
  (object = Object.create(null),
   options = { }) =>
  {
    const emptySet =
      new Set();

    if (!isObject(object)
        && !isFunction(object))
    {
      throw new TypeError(
        'Expect an object or a function.');
    }
  
    const { strict = false,
            trace = null,
            error = null } =
      options;

    const globalOptions =
      eventful.options;

    const traceFn =
      trace || globalOptions.trace;

    if (traceFn) {
      traceFn(
        object,
        'new',
        { object });
    }

    for (const method of
        [ 'on',
          'once',
          'off',
          'emit',
          'emitAsync',
          'has' ]) {
      if (method in object) {
        throw new Error(
          `Method "${method}" already exists.`);
      }
    }
  
    /** @type {Map<string|symbol, Set<Function>>} */
    const map =
      new Map();
  
    const add =
      (event, listener) => {
        let listeners =
          map.get(event);
  
        if (!listeners) {
          listeners = new Set();
          map.set(event, listeners);
        }
  
        listeners.add(listener);
      };
  
    const remove =
      (event, listener) => {
        const listeners =
          map.get(event);
  
        if (!listeners)
          return false;
  
        const deleted =
          listeners.delete(listener);
  
        if (listeners.size === 0)
          map.delete(event);
  
        return deleted;
      };

    const getListeners =
      event =>
        map.get(event)
        || emptySet;
  
    /**
     * Subscribe to an event.
     *
     * @type {(event: string|symbol, listener: Function) => () => boolean}
     */
    const on =
      (event, listener) => {
        functionTypeGuard(listener);
  
        const traceFn =
          trace
          || globalOptions.trace;

        if (traceFn) {
          traceFn(
            object,
            'on',
            { event,
              listener });
        }
  
        add(
          event,
          listener);
  
        let active = true;
  
        return () => {
          if (!active)
            return false;
  
          active = false;
  
          return remove(
            event,
            listener);
        };
      };
  
    /**
     * Subscribe to an event for a single occurrence.
     *
     * @type {(event: string|symbol, listener: Function) => () => boolean}
     */
    const once =
      (event, listener) => {
        functionTypeGuard(listener);
  
        const off =
          on(
            event,
            (...args) => {
              off();
              listener(...args);
            });
  
        return off;
      };
  
    
    /** @type {(event: string|symbol) => boolean} */
    const has =
      event =>
        map.get(event)?.size > 0
        || false;
  
    /**
     * Emit an event synchronously.
     * All listeners run in order.
     * Errors are isolated (ignored) unless `strict` is true.
     *
     * @param {string|symbol} event
     * @param {...any} args
     */
    const emit =
      (event, ...args) => {
        const listeners =
          getListeners(event);

        const traceFn =
          trace
          || globalOptions.trace;

        if (traceFn) {
          traceFn(
            object,
            'emit',
            { listeners: [...listeners],
              event,
              args });
        }

        if (listeners.size === 0)
          return;
          
        for (const listener of listeners) {
          try {
            listener(...args);
          } catch (err) {
            const errorFn =
              error
              || globalOptions.error;

            if (errorFn) {
              const context =
                { object,
                  event,
                  listener };

              errorFn(
                err,
                context);
            }

            if (strict)
              throw err;
          }
        }
      };
    
    /**
     * Emit an event and wait for all listeners (run in parallel).
     * Errors are isolated (ignored) so all listeners run.
     *
     * @param {string|symbol} event
     * @param {...any} args
     * @returns {Promise<void>}
     */
    const emitAsync =
      async (event, ...args) => {
        const listeners =
          getListeners(event);

        const traceFn =
          trace
          || globalOptions.trace;

        if (traceFn) {
          traceFn(
            object,
            'emitAsync',
            { listeners: [...listeners],
              event,
              args });
        }

        if (listeners.size === 0)
          return;
  
        const calls =
          Array.from(listeners)
            .map(listener =>
              new Promise(
                (resolve, reject) => {
                  try {
                    Promise.resolve(listener(...args))
                      .then(resolve, err => {
                        const errorFn =
                          error
                          || globalOptions.error;
                        
                        if (errorFn) {
                          const context =
                            { object,
                              event,
                              listener };

                          errorFn(err, context);
                        }

                        reject(err);
                      });
                  } catch (err) {
                    const errorFn =
                      error
                      || globalOptions.error;
                    
                    if (errorFn) {
                      const context =
                        { object,
                          event,
                          listener };

                      errorFn(err, context);
                    }

                    reject(err);
                  }
                }));

        if (strict)
          await Promise.all(calls);
        else
          await Promise.allSettled(calls);
      };
  
    /**
     * Unsubscribe from an event.
     *
     * @param {string} event The event name.
     * @param {Function} listener The handling function.
     * @returns {boolean} True if unsubscribed, false if not found.
     */
    const off =
      (event, listener) => {
        functionTypeGuard(listener);

        const traceFn =
          trace
          || globalOptions.trace;

        if (traceFn) {
          traceFn(
            object,
            'off',
            { event,
              listener });
        }
  
        return remove(
          event,
          listener);
      };
  
    const attributes =
     { enumerable: false,
       configurable: true,
       writable: true };
  
    Object.defineProperties(
      object,
      { on: { value: on, ...attributes },
        once: { value: once, ...attributes },
        off: { value: off, ...attributes },
        emit: { value: emit, ...attributes },
        emitAsync: { value: emitAsync, ...attributes },
        has: { value: has, ...attributes } });
  
    return object;
  };

eventful.options =
  { trace: null,
    error: null };

function isFunction(value) {
  return typeof value === 'function';
}

function isObject(value) {
  return value !== null
    && typeof value === 'object';
}

function functionTypeGuard(value) {
  if (!isFunction(value)) {
    throw new TypeError(
      'Expect a function.');
  }
}

export { eventful };
