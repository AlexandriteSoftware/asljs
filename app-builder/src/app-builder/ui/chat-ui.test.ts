import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { JSDOM }
  from 'jsdom';
import {
  renderGeneratingButtonUi,
  setChatProgressUi,
  appendChatMessageUi,
} from './chat-ui.js';

test(
  'chat UI helpers update button, progress, and message list',
  () => {
    const dom = new JSDOM(
      '<button id="send"></button><div id="progress" class="hidden"></div><div id="messages"></div>');
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;

    const document = dom.window.document;
    const button = document.getElementById('send') as HTMLButtonElement;
    const progress = document.getElementById('progress') as HTMLElement;
    const messages = document.getElementById('messages') as HTMLElement;

    try {
      renderGeneratingButtonUi(button, true);
      setChatProgressUi(progress, 'Working', true);
      appendChatMessageUi(messages, 'assistant', 'Done.');

      assert.equal(button.disabled, true);
      assert.match(button.innerHTML, /Sending/);
      assert.equal(progress.textContent, 'Working');
      assert.equal(progress.classList.contains('hidden'), false);
      assert.equal(messages.children.length, 1);
      assert.match(messages.textContent ?? '', /Assistant/);
      assert.match(messages.textContent ?? '', /Done\./);
    } finally {
      globalThis.document = previousDocument;
    }
  });
