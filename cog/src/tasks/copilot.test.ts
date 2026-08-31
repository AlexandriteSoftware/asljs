import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Context }
  from '../context.js';
import { type CopilotService }
  from '../copilot.js';
import { SingletonServiceProvider }
  from '../service.js';
import { DefaultTaskRunner,
         TaskRegistry }
  from '../task.js';
import { CopilotTask }
  from './copilot.js';

test(
  'copilot task uses the registered service',
  async () =>
  {
    const services =
      new SingletonServiceProvider();

    services.register<CopilotService>(
      'copilot',
      () => ({ complete(
          request
        ): Promise<{ content: string; }>
        {
          return Promise.resolve(
            { content:
                request.prompt.toUpperCase() });
        } })
    );

    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider: services });

    const response =
      await context.run(
        new CopilotTask(
          { prompt: 'commit message' }));

    assert.equal(
      response.content,
      'COMMIT MESSAGE');
  });
