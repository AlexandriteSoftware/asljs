import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM,
  } from 'jsdom';
import {
    type AiChatMessages,
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
      { messages: model.messages,
        promptDraft: '',
        messagesScrollTop: 0,
        hasMessagesScrollTop: false,
        missingKeyMessageShown: false,
        lastResponseId: null,
        choicePrompt: null,
        progress: null,
        sending: false });
    assert.deepEqual(
      model.messages.read(),
      [ ]);
  });

test(
  'createAiChatModel preserves persisted fields when restoring state',
  () => {
    const model =
      createAiChatModel(
        { messages:
            [ { role: 'assistant',
                content: 'Persisted answer' } ],
          promptDraft: 'next prompt',
          messagesScrollTop: 42,
          hasMessagesScrollTop: true,
          missingKeyMessageShown: true,
          lastResponseId: 'resp_1' });

    assert.equal(model.messages.read().length, 1);
    assert.equal(model.promptDraft, 'next prompt');
    assert.equal(model.messagesScrollTop, 42);
    assert.equal(model.hasMessagesScrollTop, true);
    assert.equal(model.missingKeyMessageShown, true);
    assert.equal(model.lastResponseId, 'resp_1');
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
        promptDraft: '',
        messagesScrollTop: 0,
        hasMessagesScrollTop: false,
        missingKeyMessageShown: false,
        lastResponseId: null });
  });

test(
  'ai-chat: custom element exposes messages store and draft as direct properties',
  async () => {
    await ensureDom();
    await loadModules();

    const chat =
      document.createElement('asljs-ai-chat') as AiChatElement;

    chat.messages.save(
      'assistant',
      'Hello there');
    chat.promptDraft = 'Draft prompt';

    document.body.appendChild(chat);
    await settleDeep(chat);

    assert.equal(chat.messages.read().length, 1);
    assert.equal(chat.messages.read()[0].content, 'Hello there');
    assert.equal(chat.promptDraft, 'Draft prompt');
    assert.equal(
      chat.querySelector('.asljs-ai-chat-bubble')?.textContent?.includes('Hello there'),
      true);
  });

test(
  'ai-chat: direct state properties render restored chat values',
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
          promptDraft: 'restored draft' });

    chat.messages = restoredModel.messages;
    chat.promptDraft = restoredModel.promptDraft;
    document.body.appendChild(chat);
    await settleDeep(chat);

    assert.equal(chat.messages.read().length, 1);
    assert.equal(chat.messages.read()[0].content, 'Restored');
    assert.equal(chat.promptDraft, 'restored draft');
  });

test(
  'ai-chat: auto session storage restores messages by component id',
  async () => {
    await ensureDom();
    await loadModules();

    sessionStorage.clear();

    const first =
      document.createElement('asljs-ai-chat') as AiChatElement;
    first.id = 'session-chat';
    document.body.appendChild(first);
    await settleDeep(first);

    first.messages.save(
      'assistant',
      'Persisted session message');
    await Promise.resolve();
    await Promise.resolve();

    document.body.replaceChildren();

    const restored =
      document.createElement('asljs-ai-chat') as AiChatElement;
    restored.id = 'session-chat';
    document.body.appendChild(restored);
    await settleDeep(restored);

    assert.equal(restored.messages.read().length, 1);
    assert.equal(
      restored.messages.read()[0].content,
      'Persisted session message');
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
        getComputedStyle: globalThis.getComputedStyle,
        sessionStorage: globalThis.sessionStorage,
        location: globalThis.location };

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
    globalThis.sessionStorage = dom.window.sessionStorage;
    globalThis.location = dom.window.location;

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
      globalThis.sessionStorage = previous.sessionStorage;
      globalThis.location = previous.location;
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
    messages: AiChatMessages;
    promptDraft: string;
  };
