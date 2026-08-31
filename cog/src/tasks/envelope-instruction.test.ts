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
import { EnvelopeTool,
         envelopeData }
  from '../tools/envelope.js';
import { type Envelope }
  from '../working-folder/envelope.js';
import { EnvelopeInstructionTask }
  from './envelope-instruction.js';

test(
  'envelope-instruction task sets the envelope instruction',
  async () =>
  {
    const envelope: Envelope =
      { instruction: '',
        files: [ ] };

    const context =
      new Context(
        { taskFactory:
            new TaskRegistry(),
          taskRunner:
            new DefaultTaskRunner(),
          serviceProvider:
            new SingletonServiceProvider(),
          data:
            [ [ envelopeData,
                envelope ] ],
          tools:
            [ [ 'envelope',
                new EnvelopeTool() ] ] });

    await context.run(
      new EnvelopeInstructionTask(
        { instruction: 'do the thing' }));

    assert.equal(
      envelope.instruction,
      'do the thing');
  });
