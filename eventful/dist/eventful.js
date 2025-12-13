import { ListenerError } from './types.js';
import { eventTypeGuard, functionTypeGuard, isFunction, isObject, } from './guards.js';
const eventfulImpl = (object = Object.create(null), options = {}) => {
    if (!isObject(object)
        && !isFunction(object)) {
        throw new TypeError('Expect an object or a function.');
    }
    for (const method of ['on', 'once', 'off', 'emit', 'emitAsync', 'has']) {
        if (object[method] !== undefined) {
            throw new Error(`Method "${method}" already exists.`);
        }
    }
    const { strict = false, trace = null, error = null } = options;
    const traceHook = typeof trace === 'function'
        ? trace
        : null;
    const errorHook = typeof error === 'function'
        ? error
        : null;
    const enhanced = object !== eventful;
    const traceFn = (action, payload) => {
        traceHook?.(action, payload);
        if (enhanced) {
            eventful.emit(action, payload);
        }
    };
    traceFn('new', { object });
    const emptySet = new Set();
    const map = new Map();
    const properties = { enumerable: false,
        configurable: true,
        writable: true };
    Object.defineProperties(object, { on: Object.assign({ value: on }, properties),
        once: Object.assign({ value: once }, properties),
        off: Object.assign({ value: off }, properties),
        emit: Object.assign({ value: emit }, properties),
        emitAsync: Object.assign({ value: emitAsync }, properties),
        has: Object.assign({ value: has }, properties) });
    return object;
    function add(event, listener) {
        let listeners = map.get(event);
        if (!listeners) {
            map.set(event, listeners = new Set());
        }
        listeners.add(listener);
    }
    function remove(event, listener) {
        const listeners = map.get(event);
        if (!listeners)
            return false;
        const deleted = listeners.delete(listener);
        if (listeners.size === 0)
            map.delete(event);
        return deleted;
    }
    function reportListenerError(event, listener, err) {
        const errorArgs = { error: err,
            object: object,
            event,
            listener };
        errorHook?.(errorArgs);
        if (object === eventful
            && event === 'error') {
            throw new ListenerError('Error in a global error listener.', err, object, event, listener);
        }
        eventful.emit('error', errorArgs);
    }
    function on(event, listener) {
        eventTypeGuard(event);
        functionTypeGuard(listener);
        traceFn('on', { object,
            event,
            listener });
        add(event, listener);
        let active = true;
        return () => (active
            ? ((active = false), remove(event, listener))
            : false);
    }
    function once(event, listener) {
        eventTypeGuard(event);
        functionTypeGuard(listener);
        const off = on(event, (...args) => {
            off();
            listener(...args);
        });
        return off;
    }
    function off(event, listener) {
        eventTypeGuard(event);
        functionTypeGuard(listener);
        traceFn('off', { object,
            event,
            listener });
        return remove(event, listener);
    }
    function has(event) {
        eventTypeGuard(event);
        return (map.get(event)?.size ?? 0) > 0;
    }
    function emit(event, ...args) {
        eventTypeGuard(event);
        const listeners = map.get(event)
            || emptySet;
        traceFn('emit', { object,
            listeners: [...listeners],
            event,
            args });
        if (listeners.size === 0)
            return;
        for (const listener of listeners) {
            try {
                listener(...args);
            }
            catch (err) {
                reportListenerError(event, listener, err);
                if (strict)
                    throw err;
            }
        }
    }
    async function emitAsync(event, ...args) {
        eventTypeGuard(event);
        const listeners = map.get(event)
            || emptySet;
        traceFn('emitAsync', { object,
            listeners: [...listeners],
            event,
            args });
        if (listeners.size === 0)
            return;
        const calls = [...listeners].map(async (listener) => {
            try {
                await listener(...args);
            }
            catch (err) {
                reportListenerError(event, listener, err);
                if (strict)
                    throw err;
            }
        });
        await (strict
            ? Promise.all(calls)
            : Promise.allSettled(calls));
    }
};
export const eventful = eventfulImpl;
eventful(eventful);
