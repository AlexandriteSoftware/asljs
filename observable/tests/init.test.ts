import test from 'node:test';
import assert from 'node:assert/strict';
import { eventful } from 'asljs-eventful';
import { observable } from '../observable.js';

const CONTEXT_NAME = 'init.test';

/**
 * Starting without an initial value should still allow later assignment and
 * emit the same boxed set contract.
 */
test(
  `${CONTEXT_NAME}: observable <empty>`,
  async () => {
    const obj =
      observable<number | undefined>(undefined);

    let newValue: any;

    obj.on(
      'set',
      (v: any) => newValue = v.value);

    obj.value = 43;

    assert.strictEqual(
      newValue,
      43);
  });

/**
 * Misconfigured eventful factories must fail fast so startup issues are
 * explicit instead of silently degrading events.
 */
test(
  `${CONTEXT_NAME}: throws when eventful option is not a function`,
  async () => {
    assert.throws(
      () =>
        observable(
          { a: 1 },
          { eventful: 123 as any }),
      /Expect a function\./);
  });

/**
 * Wrapping an already-eventful object should preserve existing wiring and
 * avoid double augmentation.
 */
test(
  `${CONTEXT_NAME}: observable reuses pre-eventful object`,
  async () => {
    const source =
      eventful(
        { name: 'Alice' });

    const observed =
      observable(
        source,
        { eventful: () => {
            throw new Error('should not extend');
          } });

    let seen: string | undefined;

    observed.on(
      'set:name',
      ({ value }: any) => {
        seen = value;
      });

    observed.name = 'Bob';

    assert.equal(
      seen,
      'Bob');
  });

/**
 * Passing a per-instance trace hook should capture object lifecycle actions
 * for local diagnostics.
 */
test(
  `${CONTEXT_NAME}: per-instance trace hook captures new and set actions`,
  async () => {
    const actions: string[] = [];
    const payloads: any[] = [];

    const obj =
      observable(
        { a: 1 },
        { trace:
            (_source, action, payload) => {
              actions.push(action);
              payloads.push(payload);
            } });

    obj.a = 2;

    assert.deepEqual(
      actions,
      [ 'new', 'define', 'set' ]);

    assert.deepEqual(
      payloads[payloads.length - 1],
      { property: 'a',
        value: 2,
        previous: 1 });
  });

/**
 * A global trace hook should capture lifecycle events when a local trace is
 * not supplied on the call.
 */
test(
  `${CONTEXT_NAME}: global trace option is used when local trace is absent`,
  async () => {
    const actions: string[] = [];
    const previousTrace =
      observable.options.trace;

    observable.options.trace =
      (_source, action) => {
        actions.push(action);
      };

    try {
      const obj =
        observable(
          { a: 1 });

      obj.a = 2;
    } finally {
      observable.options.trace =
        previousTrace;
    }

    assert.deepEqual(
      actions,
      [ 'new', 'define', 'set' ]);
  });
