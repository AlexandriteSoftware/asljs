import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestIo }
  from './test-io.js';

test(
  'createTestIo collects output and has a fixed clock',
  () =>
  {
    const io =
      createTestIo('/work');

    io.stdout.write('a');
    io.stdout.write('b');
    io.stderr.write('c');

    assert.equal(
      io.out(),
      'ab');

    assert.equal(
      io.err(),
      'c');

    assert.equal(
      io.now!().toISOString(),
      '2026-01-02T03:04:05.000Z');
  });
