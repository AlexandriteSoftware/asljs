import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Context }
  from './context.js';
import { SingletonServiceProvider }
  from './service.js';
import { DefaultTaskRunner,
         TaskRegistry }
  from './task.js';
import { type Tool }
  from './tools/tool.js';

test(
  'context provides shared variables, data, and tools',
  () =>
  {
    const git: Tool =
      { name: 'git' };

    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          data:
            [ [ 'envelope',
                'data' ] ],
          variables:
            [ [ 'branch',
                'main' ] ],
          tools:
            [ [ git.name,
                git ] ] });

    assert.equal(
      context.getData(
        'envelope'),
      'data');

    assert.equal(
      context.getVariable(
        'branch'),
      'main');

    assert.equal(
      context.getTool(
        'git'),
      git);

    assert.throws(
      () =>
        context.getTool(
          'missing'),
      /not registered/);
  });
