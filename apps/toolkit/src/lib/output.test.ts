import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { report }
  from './output.js';

test(
  'output: report writes the formatted message and a newline to stdout',
  (
      t
    ): void =>
  {
    const written: string[] = [ ];

    t.mock.method(
      process.stdout,
      'write',
      (
          chunk: string
        ): boolean =>
      {
        written.push(chunk);
        return true;
      });

    report(
      '%s: removed %s',
      'clean',
      'dist');

    t.mock.restoreAll();

    assert.deepEqual(
      written,
      [ 'clean: removed dist\n' ]);
  });
