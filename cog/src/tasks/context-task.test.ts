import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Context }
  from '../context.js';
import { SingletonServiceProvider }
  from '../service.js';
import { DefaultTaskRunner,
         TaskRegistry }
  from '../task.js';
import { ContextTaskTask }
  from './context-task.js';

test(
  'context-task task sets the context task',
  async () =>
  {
    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          task: '' });

    await context.run(
      new ContextTaskTask(
        { task:
            'implement the feature' }));

    assert.equal(
      context.task,
      'implement the feature');
  });
