import { eventful as asljsEventful } from 'asljs-eventful';

/**
 * Creates an observable object/array/primitive that emits events on changes.
 *
 * Events:
 *   - 'set' / `set:<prop>`       payload: { property, value, oldValue }
 *   - 'delete' / `delete:<prop>` payload: { property, oldValue }
 *   - 'define' / `define:<prop>` payload: { property, descriptor, previous }
 *
 * Note: Emissions are fire-and-forget; listeners run in parallel and errors are isolated
 * by the underlying `eventful.emit`.
 *
 * @param {*} value The initial value (object, array, or primitive).
 * @returns {Object} The proxied observable (augmented by `eventful`).
 */
export function observable(value, options) {
  const { eventful = asljsEventful } =
    options || {};

  if (typeof eventful !== 'function') {
    throw new TypeError(
      `observable: 'eventful' option must be a function if provided`);
  }

  const hasOwn =
    (obj, key) =>
      Object.prototype.hasOwnProperty.call(obj, key);

  const makeProxy =
    (target, { includeDefine }) => {
      let proxy;

      proxy =
        eventful(
          new Proxy(
            target,
            {
              set(
                tgt,
                property,
                newValue,
                receiver)
              {
                const previous =
                  Reflect.get(
                    tgt,
                    property,
                    receiver);

                const ok =
                  Reflect.set(
                    tgt,
                    property,
                    newValue,
                    receiver);

                if (proxy
                    && ok)
                {
                  const current =
                    Reflect.get(
                      tgt,
                      property,
                      receiver);

                  if (!Object.is(previous, current)) {
                    const payload =
                      { property,
                        value: current,
                        previous };

                    proxy.emit(
                      'set',
                      payload);

                    proxy.emit(
                      `set:${String(property)}`,
                      payload);
                  }
                }

                return ok;
              },

              deleteProperty(
                tgt,
                property)
              {
                const had =
                  hasOwn(tgt, property);

                const previous =
                  had
                    ? tgt[property]
                    : undefined;

                const ok =
                  Reflect.deleteProperty(
                    tgt,
                    property);

                if (proxy
                    && ok
                    && had)
                {
                  const payload =
                    { property,
                      previous };

                  proxy.emit(
                    'delete',
                    payload);

                  proxy.emit(
                    `delete:${String(property)}`,
                    payload);
                }

                return ok;
              },

              defineProperty(
                tgt,
                property,
                descriptor)
              {
                if (!includeDefine) {
                  return Reflect.defineProperty(
                    tgt,
                    property,
                    descriptor);
                }

                const previous =
                  Object.getOwnPropertyDescriptor(
                      tgt,
                      property)
                    ?? null;

                const ok =
                  Reflect.defineProperty(
                    tgt,
                    property,
                    descriptor);

                if (proxy
                    && ok)
                {
                  const payload =
                    { property,
                      descriptor,
                      previous };

                  proxy.emit(
                    'define',
                    payload);

                  proxy.emit(
                    `define:${String(property)}`,
                    payload);
                }

                return ok;
              }
            }));

      return proxy;
    };

  // Arrays
  if (Array.isArray(value)) {
    return makeProxy(
      value,
      { includeDefine: false });
  }

  // Objects
  if (value !== null
      && typeof value === 'object')
  {
    return makeProxy(
      value,
      { includeDefine: true });
  }

  // Primitives → boxed with a single 'value' slot
  return eventful(
    {
      get value() {
        return value;
      },
      set value(v) {
        if (Object.is(v, value))
          return;
  
        const previous = value;
        value = v;
  
        const payload =
          { property: 'value',
            value,
            previous };
  
        this.emit(
          'set',
          payload);
  
        this.emit(
          'set:value',
          payload);
      }
    });
}
