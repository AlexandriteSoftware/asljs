import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestIo }
  from './test-io.js';

test(
  'createTestIo collects output, has a fixed clock and finds no agent',
  async () =>
  {
    const io =
      createTestIo(
        '/b',
        { A: '1' });

    io.stdout.write('a');
    io.stderr.write('b');

    assert.equal(
      io.out(),
      'a');

    assert.equal(
      io.err(),
      'b');

    assert.equal(
      io.now!().toISOString(),
      '2026-01-02T03:04:05.000Z');

    assert.equal(
      await io.detectAgent!(),
      null);

    assert.equal(
      io.env.A,
      '1');
  });
