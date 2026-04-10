import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    eventful,
  } from './eventful.js';
import {
    asEventfulLike,
    type EventfulLike,
    isEventfulLike
  } from './eventful-like.js';

const TEST_SUITE =
  'eventful-like';

test(
  `${TEST_SUITE}: isEventfulLike returns true for eventful instances`,
  () => {
    const value =
      eventful();

    assert.equal(
      isEventfulLike(value),
      true);
  });


test(
  `${TEST_SUITE}: asEventfulLike returns value when compatible`,
  () => {
    const value =
      eventful();

    const converted =
      asEventfulLike(value);

    assert.equal(
      converted,
      value);

    const typed: EventfulLike | undefined =
      converted;

    assert.ok(
      typed);
  });


test(
  `${TEST_SUITE}: asEventfulLike returns undefined when incompatible`,
  () => {
    assert.equal(
      asEventfulLike({ }),
      undefined);

    assert.equal(
      asEventfulLike(42),
      undefined);
  });



