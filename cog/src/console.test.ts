import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { DefaultHostConsole,
         HostConsole }
  from './console.js';

test(
  'DefaultHostConsole writes one line to stdout',
  () =>
  {
    const originalWrite =
      process.stdout.write;

    let output = '';

    process.stdout.write = ((chunk: string | Uint8Array) =>
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
      const hostConsole: HostConsole =
        new DefaultHostConsole();

      hostConsole.writeLine(
        'hello');

      assert.equal(
        output,
        'hello\n');
    } finally {
      process.stdout.write = originalWrite;
    }
  });
