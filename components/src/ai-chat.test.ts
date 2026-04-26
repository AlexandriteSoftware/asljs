import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    createAiChatModel,
    serializeAiChatModelState,
  } from './ai-chat.js';

test(
  'createAiChatModel initializes the persisted chat state shape',
  () => {
    const model =
      createAiChatModel();

    assert.deepEqual(
      model,
      { messages: [ ],
        messageHistory: [ ],
        promptDraft: '',
        messagesScrollTop: 0,
        hasMessagesScrollTop: false,
        missingKeyMessageShown: false,
        choicePrompt: null,
        progress: null,
        sending: false });
  });

test(
  'createAiChatModel preserves persisted fields when restoring state',
  () => {
    const model =
      createAiChatModel(
        { messages:
            [ { role: 'assistant',
                content: 'Persisted answer' } ],
          messageHistory:
            [ { role: 'assistant',
                content: 'Persisted answer' } ],
          promptDraft: 'next prompt',
          messagesScrollTop: 42,
          hasMessagesScrollTop: true,
          missingKeyMessageShown: true });

    assert.equal(model.messages.length, 1);
    assert.equal(model.messageHistory.length, 1);
    assert.equal(model.promptDraft, 'next prompt');
    assert.equal(model.messagesScrollTop, 42);
    assert.equal(model.hasMessagesScrollTop, true);
    assert.equal(model.missingKeyMessageShown, true);
  });

test(
  'createAiChatModel exposes model-level choice and progress helpers',
  async () => {
    const model =
      createAiChatModel();

    model.setProgress('Working');
    assert.equal(model.progress?.message, 'Working');

    const choicePromise =
      model.presentChoices(
        'Pick one',
        [ 'a', 'b' ]);

    assert.equal(model.choicePrompt?.options.length, 2);

    model.dismissChoices();

    assert.equal(await choicePromise, null);
    assert.equal(model.choicePrompt, null);

    const state =
      serializeAiChatModelState(model);

    assert.deepEqual(
      state,
      { messages: [ ],
        messageHistory: [ ],
        promptDraft: '',
        messagesScrollTop: 0,
        hasMessagesScrollTop: false,
        missingKeyMessageShown: false });
  });
