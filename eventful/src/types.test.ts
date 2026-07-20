import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { ListenerError }
  from './types.js';

const TEST_SUITE = 'types';

test(
  `${TEST_SUITE}: ListenerError extends Error and stores context`,
  () =>
  {
    const inner =
      new Error('inner');

    const object =
      { id: 1 };

    const listener =
      (): void =>
    {};

    const error =
      new ListenerError(
      'failed',
      inner,
      object,
      'test',
      listener
    );

    assert.ok(
      error instanceof Error);

    assert.equal(
      error.name,
      'ListenerError');

    assert.equal(
      error.message,
      'failed');

    assert.equal(
      error.error,
      inner);

    assert.equal(
      error.object,
      object);

    assert.equal(
      error.event,
      'test');

    assert.equal(
      error.listener,
      listener);
  });
