import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { getCommand,
         OVERRIDE,
         toDocument }
  from './ask.js';
import { createTestIo }
  from './testing/test-io.js';

test(
  'toDocument takes the answer, unwrapping a fence, and checks its heading',
  () =>
  {
    assert.equal(
      toDocument(
        '# P1 Plan\n\nText.',
        'P1'),
      '# P1 Plan\n\nText.\n');

    assert.equal(
      toDocument(
        '```markdown\n# P1 Plan\n\nText.\n```\n',
        'P1'),
      '# P1 Plan\n\nText.\n');

    assert.throws(
      () =>
        toDocument(
          'Here is the plan:\n\n# P1 Plan',
          'P1'),
      /The agent's document does not start with "# P1"/);

    assert.throws(
      () =>
        toDocument(
          '# P10 Other',
          'P1'),
      /does not start with "# P1"/);
  });

test(
  'getCommand takes BOARD_AI_COMMAND, and fails without an agent',
  async () =>
  {
    assert.equal(
      await getCommand(
        createTestIo(
          '/b',
          { [OVERRIDE]: 'my-agent' }),
        undefined,
        'edit'),
      'my-agent');

    assert.equal(
      await getCommand(
        createTestIo('/b'),
        { agent: 'claude' },
        'read'),
      'claude -p --allowedTools Read,Grep,Glob');

    assert.equal(
      await getCommand(
        { ...createTestIo('/b'),
          detectAgent:
            async () => 'copilot' as const },
        { model: 'fable' },
        'read'),
      'copilot -s --no-ask-user --allow-all-tools --deny-tool=write --deny-tool=shell --model fable');

    await assert.rejects(
      getCommand(
        createTestIo('/b'),
        undefined,
        'read'),
      /No AI agent found; install claude or copilot, or set BOARD_AI_COMMAND\./);
  });
