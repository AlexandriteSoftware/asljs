import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  README_SNAPSHOT_FILE,
  buildConversationPrompt,
  getConversationKickoffMessage,
} from './conversation-loop.js';

test(
  'getConversationKickoffMessage asks to create when app has no files',
  () => {
    assert.equal(
      getConversationKickoffMessage([]),
      'What would you like to create? You can describe it in simple words, and I will help shape the plan first.',
    );
  });

test(
  'getConversationKickoffMessage asks to add or change when files exist',
  () => {
    assert.equal(
      getConversationKickoffMessage([ 'README.md', 'app.js' ]),
      'What would you like to add or change? I will keep README.md as the current app state and put new ideas into PLAN.md.',
    );
  });

test(
  'getConversationKickoffMessage still asks to create for workflow-only files',
  () => {
    assert.equal(
      getConversationKickoffMessage([ 'README.md', 'PLAN.md', 'CHANGE.md' ]),
      'What would you like to create? You can describe it in simple words, and I will help shape the plan first.',
    );
  });

test(
  'buildConversationPrompt keeps recent transcript context for follow-up answers',
  () => {
    const prompt =
      buildConversationPrompt([
        { role: 'assistant',
          text: 'What should the ball game be about?' },
        { role: 'user',
          text: 'A football game.' },
        { role: 'assistant',
          text: 'How many players should it have?' },
        { role: 'user',
          text: '2 players.' },
      ]);

    assert.match(prompt, /Conversation transcript:/);
    assert.match(prompt, /Assistant: What should the ball game be about\?/);
    assert.match(prompt, /User: 2 players\./);
    assert.match(prompt, /The last user message is the newest/);
  });

test(
  'README snapshot file name stays stable for the AI loop contract',
  () => {
    assert.equal(README_SNAPSHOT_FILE, '.README.md');
  });
