import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { tryGetLocation }
  from './location.js';

test(
  'tryGetLocation: returns undefined if node does not have location information',
  (): void =>
  {
    const node = {};

    const location =
      tryGetLocation(node);

    assert.strictEqual(
      location,
      undefined
    );
  }
);
