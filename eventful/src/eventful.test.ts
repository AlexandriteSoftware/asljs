import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { EventfulBase }
  from './eventful-base.js';
import { eventful }
  from './eventful.js';
import { Eventful }
  from './types.js';

const TEST_SUITE = 'eventful';

test(
  `${TEST_SUITE}: eventful extends an object`,
  () =>
  {
    const original = {};

    const enhanced =
      eventful(original);

    assert.equal(
      enhanced,
      original
    );

    assertEventfulMethods(
      enhanced
    );
  }
);

test(
  `${TEST_SUITE}: eventful extends a function`,
  () =>
  {
    const original =
      (): void =>
    {};

    const enhanced =
      eventful(original);

    assert.equal(
      enhanced,
      original
    );

    assertEventfulMethods(
      enhanced
    );
  }
);

test(
  `${TEST_SUITE}: eventful can be called without arguments`,
  () =>
  {
    const enhanced =
      eventful();

    assert.ok(
      enhanced !== null
    );

    assertEventfulMethods(
      enhanced
    );
  }
);

test(
  `${TEST_SUITE}: eventful can be extended by inheritance`,
  () =>
  {
    type MyClassEvents = {
      greet: [message: string];
    };

    class MyClass extends EventfulBase<MyClassEvents>
    {
      name: string;

      constructor(
        name: string
      )
      {
        super();

        this.name = name;
      }

      greet(): void
      {
        this.emit(
          'greet',
          `Hello, ${this.name}`
        );
      }
    }

    const instance =
      new MyClass('Alice');

    let greeting: string | null = null;

    instance.on(
      'greet',
      message => greeting = message
    );

    instance.greet();

    assert.equal(
      greeting,
      'Hello, Alice'
    );
  }
);

test(
  `${TEST_SUITE}: eventful can be added during construction`,
  () =>
  {
    type MyClassEvents = {
      greet: [message: string];
    };

    class MyClass implements Eventful<MyClassEvents>
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
        eventful(
          this
        );

        this.name = name;
      }

      greet(): void
      {
        this.emit(
          'greet',
          `Hello, ${this.name}`
        );
      }
    }

    const instance =
      new MyClass('Alice');

    let greeting: string | null = null;

    instance.on(
      'greet',
      message => greeting = message
    );

    instance.greet();

    assert.equal(
      greeting,
      'Hello, Alice'
    );
  }
);

test(
  `${TEST_SUITE}: trace is called on creation with action "new"`,
  () =>
  {
    const recorder =
      createRecorder();

    const object =
      eventful(
        {},
        { trace: recorder.write });

    const creation =
      recorder.records().find(
        item => item.action === 'new');

    assert.ok(creation);

    assert.equal(
      creation.payload.object,
      object
    );
  }
);

test(
  `${TEST_SUITE}: global trace is called on creation with action "new"`,
  () =>
  {
    const recorder =
      createRecorder();

    const off =
      eventful.on(
        'new',
        (...args: unknown[]) =>
        recorder.write(
          'new',
          args[0] as TraceRecord['payload']
        ));

    try {
      const object =
        eventful(
          {},
          { trace: recorder.write });

      const creation =
        recorder.records().find(
          item => item.action === 'new');

      assert.ok(
        creation
      );

      assert.equal(
        creation.payload.object,
        object
      );
    } finally {
      off();
    }
  }
);

test(
  `${TEST_SUITE}: eventful throws when an object has one of the event emitter methods`,
  () =>
  {
    for (const method of ['on', 'once', 'off', 'emit', 'emitAsync', 'has']) {
      assert.throws(
        () =>
          eventful(
            {
              [method]: () =>
              {}
            }
          )
      );
    }
  }
);

test(
  `${TEST_SUITE}: exceptions in listeners are suppressed in async emit by default`,
  async () =>
  {
    const obj =
      eventful();

    obj.on(
      'test',
      () =>
      {
        throw new Error('test error');
      }
    );

    await assert.doesNotReject(
      () => obj.emitAsync('test')
    );
  }
);

function assertEventfulMethods(
    object: unknown
  ): void
{
  const candidate =
    object as {
    on?: unknown;
    off?: unknown;
    emit?: unknown;
    emitAsync?: unknown;
    has?: unknown;
  };

  assert.equal(
    typeof candidate.on,
    'function'
  );

  assert.equal(
    typeof candidate.off,
    'function'
  );

  assert.equal(
    typeof candidate.emit,
    'function'
  );

  assert.equal(
    typeof candidate.emitAsync,
    'function'
  );

  assert.equal(
    typeof candidate.has,
    'function'
  );
}

test(
  `${TEST_SUITE}: exceptions in listeners are suppressed in async emit by default`,
  async () =>
  {
    const obj =
      eventful();

    obj.on(
      'test',
      () =>
      {
        throw new Error('test error');
      }
    );

    await assert.doesNotReject(
      () => obj.emitAsync('test')
    );
  }
);

test(
  `${TEST_SUITE}: exceptions in listeners are suppressed in emit by default`,
  () =>
  {
    const obj =
      eventful();

    obj.on(
      'test',
      () =>
      {
        throw new Error('test error');
      }
    );

    assert.doesNotThrow(
      () => obj.emit('test')
    );
  }
);

test(
  `${TEST_SUITE}: strict mode propagates exceptions in listeners in async emit`,
  async () =>
  {
    const obj =
      eventful(
        {},
        {
        error: () =>
        {},
        strict: true
      });

    obj.on(
      'test',
      () =>
      {
        throw new Error('test error');
      }
    );

    await assert.rejects(
      () => obj.emitAsync('test')
    );
  }
);

test(
  `${TEST_SUITE}: strict mode propagates exceptions in listeners in emit`,
  () =>
  {
    const obj =
      eventful(
        {},
        {
        error: () =>
        {},
        strict: true
      });

    obj.on(
      'test',
      () =>
      {
        throw new Error('test error');
      }
    );

    assert.throws(
      () => obj.emit('test'),
      Error
    );
  }
);

test(
  `${TEST_SUITE}: non-strict runs other listeners even if one fails`,
  async () =>
  {
    const obj =
      eventful(
        {},
        {
        error: () =>
        {}
      });

    let ran = 0;

    obj.on(
      'test',
      () => ran += 1
    );

    obj.on(
      'test',
      () =>
      {
        throw new Error('boom');
      }
    );

    obj.on(
      'test',
      () => ran += 1
    );

    await assert.doesNotReject(
      () => obj.emitAsync('test')
    );

    assert.equal(
      ran,
      2
    );
  }
);

test(
  `${TEST_SUITE}: trace receives safe payload and action names`,
  async () =>
  {
    const recorder =
      createRecorder();

    const obj =
      eventful(
        {},
        { trace: recorder.write });

    const off =
      obj.on(
        'e',
        () =>
      {});

    obj.emit(
      'e',
      1,
      2
    );

    await obj.emitAsync(
      'e',
      3,
      4
    );

    off();

    assert.ok(
      recorder.records().find(
        item => item.action === 'on'
      )
    );

    assert.ok(
      recorder.records().find(
        item => item.action === 'emit'
      )
    );

    assert.ok(
      recorder.records().find(
        item => item.action === 'emitAsync'
      )
    );

    const emitTrace =
      recorder.records().find(
        item => item.action === 'emit');

    assert.ok(emitTrace);

    assert.ok(
      Array.isArray(
        emitTrace.payload.listeners
      )
    );

    assert.equal(
      emitTrace.payload.event,
      'e'
    );

    assert.deepEqual(
      emitTrace.payload.args,
      [1, 2]
    );

    const emitAsyncTrace =
      recorder.records().find(
        item => item.action === 'emitAsync');

    assert.ok(emitAsyncTrace);

    assert.ok(
      Array.isArray(
        emitAsyncTrace.payload.listeners
      )
    );

    assert.equal(
      emitAsyncTrace.payload.event,
      'e'
    );

    assert.deepEqual(
      emitAsyncTrace.payload.args,
      [3, 4]
    );
  }
);

test(
  `${TEST_SUITE}: error hook runs for async rejection (non-strict)`,
  async () =>
  {
    let errors = 0;

    const obj =
      eventful(
        {},
        { error: () => errors += 1 });

    obj.on(
      'e',
      async () =>
      {
        throw new Error('reject');
      }
    );

    await assert.doesNotReject(
      () => obj.emitAsync('e')
    );

    assert.equal(
      errors,
      1
    );
  }
);

test(
  `${TEST_SUITE}: has reflects subscribe and unsubscribe`,
  () =>
  {
    const obj =
      eventful();

    assert.equal(
      obj.has('x'),
      false
    );

    const off =
      obj.on(
        'x',
        () =>
      {});

    assert.equal(
      obj.has('x'),
      true
    );

    off();

    assert.equal(
      obj.has('x'),
      false
    );
  }
);

test(
  `${TEST_SUITE}: strict mode propagates async rejections`,
  async () =>
  {
    const obj =
      eventful(
        {},
        {
        error: () =>
        {},
        strict: true
      });

    obj.on(
      'e',
      async () =>
      {
        throw new Error('nope');
      }
    );

    await assert.rejects(
      () => obj.emitAsync('e')
    );
  }
);

test(
  `${TEST_SUITE}: emit ignores errors when no error hook (non-strict)`,
  () =>
  {
    const obj =
      eventful();

    obj.on(
      'x',
      () =>
      {
        throw new Error('boom');
      }
    );

    assert.doesNotThrow(
      () => obj.emit('x')
    );
  }
);

test(
  `${TEST_SUITE}: throw in global error listener does not loop`,
  () =>
  {
    let globalErrorCalls = 0;

    const off =
      eventful.on(
        'error',
        () =>
      {
        globalErrorCalls += 1;

        if (globalErrorCalls > 1) {
          throw new Error('global error listener loop');
        }

        throw new Error('boom');
      });

    try {
      const obj =
        eventful();

      obj.on(
        'e',
        () =>
        {
          throw new Error('listener failed');
        }
      );

      assert.throws(
        () => obj.emit('e'),
        Error
      );

      assert.equal(
        globalErrorCalls,
        1
      );
    } finally {
      off();
    }
  }
);

test(
  `${TEST_SUITE}: event must be string or symbol`,
  () =>
  {
    const obj =
      eventful();

    assert.throws(
      () =>
        obj.on(
          123 as unknown as never,
          () =>
          {}
        ),
      TypeError
    );

    assert.throws(
      () =>
        obj.emit(
          123 as unknown as never
        ),
      TypeError
    );

    const s =
      Symbol('e');

    assert.doesNotThrow(
      () =>
        obj.on(
          s,
          () =>
          {}
        )
    );

    assert.doesNotThrow(
      () => obj.emit(s)
    );
  }
);

type TraceRecord = {
  action: string;
  payload: {
    object: object | Function;
    event?: string | symbol;
    listener?: Function;
    listeners?: Function[];
    args?: unknown[];
  };
};

type Recorder = {
  write: (action: string, payload: TraceRecord['payload']) => void;
  records: () => TraceRecord[];
};

export function createRecorder(
  ): Recorder
{
  const records: TraceRecord[] = [];

  return {
    write: (
      action: string,
      payload: TraceRecord['payload']
    ): void =>
    {
      records.push(
        { action, payload }
      );
    },
    records: (): TraceRecord[] => records
  };
}
