import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { EventfulBase }
  from './eventful-base.js';

const TEST_SUITE =
  'eventful-base';

test(
  `${TEST_SUITE}: EventfulBase wires eventful methods in constructor`,
  () =>
  {
    type Events = { ping: [value: number]; };

    class Demo extends EventfulBase<Events>
    {
    }

    const demo =
      new Demo();

    let seen: number | null = null;

    demo.on(
      'ping',
      value => seen = value);

    demo.emit(
      'ping',
      7);

    assert.equal(
      seen,
      7);
  });

test(
  `${TEST_SUITE}: EventfulBase passes options to eventful setup`,
  () =>
  {
    type Events = { boom: []; };

    class Demo extends EventfulBase<Events>
    {
    }

    const demo =
      new Demo(
      {
        strict: true,
        error: () =>
        {}
      }
    );

    demo.on(
      'boom',
      () =>
      {
        throw new Error('boom');
      });

    assert.throws(
      () => demo.emit('boom'),
      Error);
  });
