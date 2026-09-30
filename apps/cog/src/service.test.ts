import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { type Service,
         SingletonServiceProvider }
  from './service.js';

test(
  'singleton service provider creates one service for concurrent requests',
  async () =>
  {
    let created = 0;
    let disposed = 0;

    const provider =
      new SingletonServiceProvider();

    provider.register(
      'copilot',
      () =>
      {
        created++;

        return { dispose(): Promise<void>
          {
            disposed++;

            return Promise.resolve();
          } } satisfies Service;
      });

    const [first, second] =
      await Promise.all(
        [ provider.get(
          'copilot'),
          provider.get(
            'copilot') ]);

    assert.equal(
      first,
      second);

    assert.equal(
      created,
      1);

    await provider.dispose();

    assert.equal(
      disposed,
      1);
  });

test(
  'singleton service provider rejects duplicate and unknown services',
  async () =>
  {
    const provider =
      new SingletonServiceProvider();

    provider.register(
      'service',
      () => ({}));

    assert.throws(
      () =>
        provider.register(
          'service',
          () => ({})),
      /already registered/);

    await assert.rejects(
      provider.get(
        'missing'),
      /not registered/);
  });
