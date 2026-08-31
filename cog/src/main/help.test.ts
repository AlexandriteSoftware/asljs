import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { main }
  from './main.js';
import { argv }
  from './test-helpers.js';

test(
  'help lists task commands built from the registry',
  async () =>
  {
    const originalWrite =
      process.stdout.write;

    let output = '';

    process.stdout.write =
      ((
          chunk: string | Uint8Array
        ) =>
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
          '--help'));
    } finally {
      process.stdout.write = originalWrite;
    }

    assert.match(
      output,
      /find-todo/);

    assert.match(
      output,
      /extract-todos/);

    assert.match(
      output,
      /envelope-add-files/);
  });
