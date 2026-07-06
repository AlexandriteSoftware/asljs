import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { JSDOM }
  from 'jsdom';
import { createSessionStorageAiChatStateStore }
  from './ai-chat-storage.js';

test(
  'session chat state store saves and loads serializable chat state',
  async () => {
    const dom =
      new JSDOM(
        '',
        { url: 'https://example.test/' });
    const previousSessionStorage =
      globalThis.sessionStorage;

    globalThis.sessionStorage = dom.window.sessionStorage;

    try {
      const store =
        createSessionStorageAiChatStateStore('app-1');

      await store.save(
        { messages:
            [ { role: 'assistant',
                content: 'Hi' } ],
          promptDraft: 'next',
          messagesScrollTop: 12,
          hasMessagesScrollTop: true,
          missingKeyMessageShown: false,
          lastResponseId: 'resp_1',
          choicePrompt: null,
          progress: null,
          sending: false });

      assert.deepEqual(
        await store.load(),
        { messages:
            [ { role: 'assistant',
                content: 'Hi' } ],
          promptDraft: 'next',
          messagesScrollTop: 12,
          hasMessagesScrollTop: true,
          missingKeyMessageShown: false,
          lastResponseId: 'resp_1',
          choicePrompt: null,
          progress: null,
          sending: false });
    } finally {
      globalThis.sessionStorage = previousSessionStorage;
    }
  });
