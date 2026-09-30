import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createEnvironment }
  from './environment.js';

test(
  'createEnvironment defaults to the working directory and default readers',
  () =>
  {
    const environment =
      createEnvironment();

    assert.equal(
      environment.library,
      environment.cwd);

    assert.equal(
      environment.readers.supports('one.md'),
      true);

    assert.equal(
      environment.readers.supports('one.pdf'),
      true);
  });

test(
  'createEnvironment applies overrides',
  () =>
  {
    const environment =
      createEnvironment(
        { library: '/tmp/library' });

    assert.equal(
      environment.library,
      '/tmp/library');
  });

test(
  'resolve returns the registered replacement',
  () =>
  {
    const environment =
      createEnvironment();

    const original =
      (): string => 'original';

    const replacement =
      (): string => 'replacement';

    assert.equal(
      environment.resolve(original)(),
      'original');

    environment.register(
      original,
      replacement);

    assert.equal(
      environment.resolve(original)(),
      'replacement');
  });

test(
  'dispose runs the registered actions',
  async () =>
  {
    const environment =
      createEnvironment();

    const calls: string[] = [ ];

    environment.onDispose(
      async (): Promise<void> =>
      {
        calls.push('first');
      });

    environment.onDispose(
      async (): Promise<void> =>
      {
        calls.push('second');
      });

    await environment.dispose();

    assert.deepEqual(
      calls,
      [ 'first',
        'second' ]);
  });
