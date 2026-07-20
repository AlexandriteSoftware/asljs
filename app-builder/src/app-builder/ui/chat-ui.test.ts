import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { appendChatMessageUi,
         clearChatChoicesUi,
         renderChatChoicesUi,
         renderGeneratingButtonUi,
         setChatProgressUi }
  from './chat-ui.js';

test(
  'chat UI helpers update button, progress, and message list',
  () =>
  {
    const dom =
      new JSDOM(
      '<button id="send"></button><div id="progress" class="hidden"></div><div id="messages"></div>'
    );

    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    const document =
      dom.window.document;

    const button =
      document.getElementById('send') as HTMLButtonElement;

    const progress =
      document.getElementById('progress') as HTMLElement;

    const messages =
      document.getElementById('messages') as HTMLElement;

    try {
      renderGeneratingButtonUi(
        button,
        true);

      setChatProgressUi(
        progress,
        'Working',
        true);

      appendChatMessageUi(
        messages,
        'assistant',
        'Done.');

      assert.equal(
        button.disabled,
        true);

      assert.match(
        button.innerHTML,
        /Sending/);

      assert.equal(
        progress.textContent,
        'Working');

      assert.equal(
        progress.classList.contains('hidden'),
        false);

      assert.equal(
        messages.children.length,
        1);

      assert.match(
        messages.textContent ?? '',
        /Assistant/);

      assert.match(
        messages.textContent ?? '',
        /Done\./);
    } finally {
      globalThis.document = previousDocument;
    }
  });

test(
  'chat choice UI renders options and clears',
  () =>
  {
    const dom =
      new JSDOM('<div id="choices" class="hidden"></div>');

    const previousDocument =
      globalThis.document;

    globalThis.document = dom.window.document;

    const document =
      dom.window.document;

    const choices =
      document.getElementById('choices') as HTMLElement;

    const seen: string[] = [];

    try {
      renderChatChoicesUi(
        choices,
        'How should it look?',
        ['glowing ring', 'spinning block'],
        value =>
        {
          seen.push(value);
        });

      const buttons =
        Array.from(
          choices.querySelectorAll('button'));

      assert.equal(
        choices.classList.contains('hidden'),
        false);

      assert.match(
        choices.textContent ?? '',
        /How should it look\?/);

      assert.equal(
        buttons.length,
        2);

      (buttons[0] as HTMLButtonElement).click();

      assert.deepEqual(
        seen,
        ['glowing ring']);

      clearChatChoicesUi(choices);

      assert.equal(
        choices.classList.contains('hidden'),
        true);

      assert.equal(
        choices.children.length,
        0);
    } finally {
      globalThis.document = previousDocument;
    }
  });
