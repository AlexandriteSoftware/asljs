import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM,
  } from 'jsdom';
import {
    type AiChatMessage,
    type AiChatResponsesInputItem,
    createAiChatModel,
    serializeAiChatModelState,
  } from './ai-chat.js';

let domRestore: (() => void) | null = null;
let modulesLoaded = false;

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

test(
  'ai-chat: custom element exposes messages and messageHistory as direct properties',
  async () => {
    await ensureDom();
    await loadModules();

    const chat =
      document.createElement('asljs-ai-chat') as AiChatElement;

    chat.messages =
      [ { role: 'assistant',
          content: 'Hello there' } ];
    chat.messageHistory =
      [ { role: 'assistant',
          content: 'Hello there' } ];
    chat.promptDraft = 'Draft prompt';

    document.body.appendChild(chat);
    await settleDeep(chat);

    assert.equal(chat.model.messages, chat.messages);
    assert.equal(chat.model.messageHistory, chat.messageHistory);
    assert.equal(chat.model.promptDraft, 'Draft prompt');
    assert.equal(
      chat.querySelector('.asljs-ai-chat-bubble')?.textContent?.includes('Hello there'),
      true);
  });

test(
  'ai-chat: direct state properties stay in sync after model replacement',
  async () => {
    await ensureDom();
    await loadModules();

    const chat =
      document.createElement('asljs-ai-chat') as AiChatElement;
    const restoredModel =
      createAiChatModel(
        { messages:
            [ { role: 'assistant',
                content: 'Restored' } ],
          messageHistory:
            [ { role: 'assistant',
                content: 'Restored' } ],
          promptDraft: 'restored draft' });

    chat.model = restoredModel;
    document.body.appendChild(chat);
    await settleDeep(chat);

    assert.equal(chat.messages.length, 1);
    assert.equal(chat.messages[0].content, 'Restored');
    assert.equal(chat.messageHistory.length, 1);
    assert.equal(chat.promptDraft, 'restored draft');
  });

async function loadModules(): Promise<void> {
  if (modulesLoaded) {
    return;
  }

  await import('./button.js');
  await import('./text-input.js');
  await import('./select.js');
  await import('./ai-chat.js');
  modulesLoaded = true;
}

async function ensureDom(): Promise<void> {
  if (domRestore === null) {
    const dom =
      new JSDOM('<!doctype html><html><body></body></html>');

    const previous =
      { window: globalThis.window,
        document: globalThis.document,
        Document: globalThis.Document,
        Event: globalThis.Event,
        CustomEvent: globalThis.CustomEvent,
        KeyboardEvent: globalThis.KeyboardEvent,
        customElements: globalThis.customElements,
        HTMLElement: globalThis.HTMLElement,
        HTMLButtonElement: globalThis.HTMLButtonElement,
        HTMLInputElement: globalThis.HTMLInputElement,
        HTMLSelectElement: globalThis.HTMLSelectElement,
        HTMLTextAreaElement: globalThis.HTMLTextAreaElement,
        ShadowRoot: globalThis.ShadowRoot,
        CSSStyleSheet: globalThis.CSSStyleSheet,
        Node: globalThis.Node,
        getComputedStyle: globalThis.getComputedStyle };

    globalThis.window = dom.window as unknown as typeof globalThis.window;
    globalThis.document = dom.window.document;
    globalThis.Document = dom.window.Document;
    globalThis.Event = dom.window.Event;
    globalThis.CustomEvent = dom.window.CustomEvent;
    globalThis.KeyboardEvent = dom.window.KeyboardEvent;
    globalThis.customElements = dom.window.customElements;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
    globalThis.HTMLInputElement = dom.window.HTMLInputElement;
    globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
    globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
    globalThis.ShadowRoot = dom.window.ShadowRoot;
    globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;
    globalThis.Node = dom.window.Node;
    globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);

    domRestore = () => {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.Document = previous.Document;
      globalThis.Event = previous.Event;
      globalThis.CustomEvent = previous.CustomEvent;
      globalThis.KeyboardEvent = previous.KeyboardEvent;
      globalThis.customElements = previous.customElements;
      globalThis.HTMLElement = previous.HTMLElement;
      globalThis.HTMLButtonElement = previous.HTMLButtonElement;
      globalThis.HTMLInputElement = previous.HTMLInputElement;
      globalThis.HTMLSelectElement = previous.HTMLSelectElement;
      globalThis.HTMLTextAreaElement = previous.HTMLTextAreaElement;
      globalThis.ShadowRoot = previous.ShadowRoot;
      globalThis.CSSStyleSheet = previous.CSSStyleSheet;
      globalThis.Node = previous.Node;
      globalThis.getComputedStyle = previous.getComputedStyle;
    };
  }

  document.body.replaceChildren();
}

async function settleDeep(
    element: LitElementLike
  ): Promise<void>
{
  await element.updateComplete;
  await Promise.resolve();

  const nestedElements =
    [ ...element.querySelectorAll('*') ] as LitElementLike[];

  for (const nestedElement of nestedElements) {
    if ('updateComplete' in nestedElement) {
      await nestedElement.updateComplete;
    }
  }

  await Promise.resolve();
}

type LitElementLike =
  HTMLElement & {
    updateComplete: Promise<unknown>;
  };

type AiChatElement =
  LitElementLike
  & {
    model: ReturnType<typeof createAiChatModel>;
    messages: AiChatMessage[];
    messageHistory: AiChatResponsesInputItem[];
    promptDraft: string;
  };
