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
import { ContextInstructionTask }
  from './context-instruction.js';

test(
  'context-instruction task sets the context instruction',
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
          instruction: '' });

    await context.run(
      new ContextInstructionTask(
        { instruction: 'do the thing' }));

    assert.equal(
      context.instruction,
      'do the thing');
  });
