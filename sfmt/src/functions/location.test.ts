import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { ensureNodeAndLocation }
  from './location.js';

test(
  'ensureNodeAndLocation: throws if node does not have location information',
  (): void =>
  {
    const node = null;

    assert.throws(
      (): void =>
      {
        ensureNodeAndLocation(node);
      },
      { code: 'LOCATION_INCOMPLETE' }
    );
  }
);
