import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { main }
  from './main.js';
import { argv }
  from './test-helpers.js';

test(
  'version command prints current package version',
  async () =>
  {
    const originalWrite =
      process.stdout.write;

    let output = '';

    process.stdout.write =
      ((chunk: string | Uint8Array) =>
    {
      output += typeof chunk === 'string'
        ? chunk
        : Buffer.from(
          chunk)
          .toString(
            'utf8');

      return true;
    }) as typeof process.stdout.write;

    try {
      await main(
        argv(
          'version'));

      assert.equal(
        output,
        '0.1.8\n');
    } finally {
      process.stdout.write = originalWrite;
    }
  });