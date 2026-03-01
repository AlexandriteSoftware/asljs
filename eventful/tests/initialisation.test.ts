import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    createTracer
  } from './tracer.js';
import {
  eventful,
  EventfulBase,
  type Eventful
} from '../eventful.js';

test(
  'eventful extends an object',
  () => {
    const original = { };

    const enhanced =
      eventful(original);

    assert.equal(
      enhanced,
      original);

    assertEventfulMethods(
      enhanced);
  });

test(
  'eventful extends a function',
  () => {
    const original =
      (): void => { };

    const enhanced =
      eventful(original);

    assert.equal(
      enhanced,
      original);

    assertEventfulMethods(
      enhanced);
  });

test(
  'eventful can be called without arguments',
  () => {
    const enhanced =
      eventful();

    assert.ok(
      enhanced !== null);

    assertEventfulMethods(
      enhanced);
  });

test(
  'eventful can be extended by inheritance',
  () => {
    class MyClass extends EventfulBase {
      name: string;

      constructor(
          name: string
        )
      {
        super();

        this.name = name;
      }

      greet(
        ): void
      {
        this.emit(
          'greet',
          `Hello, ${this.name}`);
      }
    }

    const instance =
      new MyClass('Alice');

    let greeting: string | null = null;

    instance.on(
      'greet',
      message => greeting = message);

    instance.greet();

    assert.equal(
      greeting,
      'Hello, Alice');
  });

test(
  'eventful can be added during construction',
  () => {
    type MyClassEvents = {
      greet: [message: string];
    };

    class MyClass
        implements Eventful<MyClassEvents>
    {
      name: string;

      declare on: Eventful<MyClassEvents>['on'];
      declare once: Eventful<MyClassEvents>['once'];
      declare off: Eventful<MyClassEvents>['off'];
      declare emit: Eventful<MyClassEvents>['emit'];
      declare emitAsync: Eventful<MyClassEvents>['emitAsync'];
      declare has: Eventful<MyClassEvents>['has'];

      constructor(
          name: string
        )
      {
        eventful(this);

        this.name = name;
      }

      greet(
        ): void
      {
        this.emit(
          'greet',
          `Hello, ${this.name}`);
      }
    }

    const instance =
      new MyClass('Alice');

    let greeting: string | null = null;

    instance.on(
      'greet',
      message => greeting = message);

    instance.greet();

    assert.equal(
      greeting,
      'Hello, Alice');
  });

test(
  'trace is called on creation with action "new"',
  () => {
    const tracer =
      createTracer();

    const object =
      eventful(
        { },
        tracer);

    const creation =
      tracer.getFirstTraceByAction('new');

    assert.ok(creation);

    assert.equal(
      creation.payload.object,
      object);
  });

test(
  'global trace is called on creation with action "new"',
  () => {
    const tracer =
      createTracer();

    const off =
      eventful.on(
        'new',
        args => tracer.trace('new', args));

    try {
      const object =
        eventful(
          { },
          tracer);

      const creation =
        tracer.getFirstTraceByAction('new');

      assert.ok(
        creation);

      assert.equal(
        creation.payload.object,
        object);
    } finally {
      off();
    }
  });

test(
  'eventful throws when an object has one of the event emitter methods',
  () => {
    for (const method of [ 'on', 'once', 'off', 'emit', 'emitAsync', 'has']) {
      assert.throws(
        () =>
          eventful({
            [method]: () => { }
          }));
    }
  });

test(
  'exceptions in listeners are suppressed in async emit by default',
  async () => {
    const obj =
      eventful();

    obj.on(
      'test',
      () => { throw new Error('test error'); });

    await assert.doesNotReject(
      () => obj.emitAsync('test'));
  });

function assertEventfulMethods(
    object: any
  ): void
{
    assert.equal(typeof object.on, 'function');
    assert.equal(typeof object.off, 'function');
    assert.equal(typeof object.emit, 'function');
    assert.equal(typeof object.emitAsync, 'function');
    assert.equal(typeof object.has, 'function');
}
