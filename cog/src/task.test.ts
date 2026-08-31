import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Context }
  from './context.js';
import { SingletonServiceProvider }
  from './service.js';
import { DefaultTaskRunner,
         type Task,
         TaskRegistry }
  from './task.js';

test(
  'task can create and run another task in the same context',
  async () =>
  {
    const registry =
      new TaskRegistry();

    registry.register(
      'increment',
      (
          parameters
        ) =>
      {
        const amount =
          parameters as number;

        return { run(
            context
          ): Promise<number>
          {
            const result =
              (context.getData<number>(
              'count'
            ) ?? 0)
              + amount;

            context.setData(
              'count',
              result);

            return Promise.resolve(
              result);
          } };
      });

    const workflow: Task<number> =
      { run(
        context
      ): Promise<number>
      {
        return context.run(
          context.createTask(
            'increment',
            2))
          .then(
            () =>
              context.run(
                context.createTask(
                  'increment',
                  3)));
      } };

    const context =
      new Context(
        { taskFactory: registry,
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider() });

    assert.equal(
      await context.run(
        workflow),
      5);

    assert.equal(
      context.getData(
        'count'),
      5);
  });

test(
  'task registry rejects duplicate and unknown task names',
  () =>
  {
    const registry =
      new TaskRegistry();

    registry.register(
      'task',
      () => ({ run(): Promise<void>
        {
          return Promise.resolve();
        } }));

    assert.throws(
      () =>
        registry.register(
          'task',
          () => ({ run(): Promise<void>
            {
              return Promise.resolve();
            } })),
      /already registered/);

    assert.throws(
      () =>
        registry.create(
          'missing'),
      /not registered/);
  });
