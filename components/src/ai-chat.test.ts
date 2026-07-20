import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import * as AiChatModule
  from './ai-chat.js';

let domRestore: (() => void) | null = null;
let modulesLoaded = false;
let aiChatModulePromise: Promise<typeof AiChatModule> | null = null;

test(
  'createAiChatModel initializes the persisted chat state shape',
  async () =>
  {
    const {
      createAiChatModel
    } =
      await loadAiChatModule();

    const model =
      createAiChatModel();

    assert.deepEqual(
      model,
      {
        messages: model.messages,
        promptDraft: '',
        messagesScrollTop: 0,
        hasMessagesScrollTop: false,
        missingKeyMessageShown: false,
        lastResponseId: null,
        choicePrompt: null,
        progress: null,
        sending: false
      });

    assert.deepEqual(
      model.messages.read(),
      []);
  });

test(
  'createAiChatModel preserves persisted fields when restoring state',
  async () =>
  {
    const {
      createAiChatModel
    } =
      await loadAiChatModule();

    const model =
      createAiChatModel(
        {
        messages: [{ role: 'assistant', content: 'Persisted answer' }],
        promptDraft: 'next prompt',
        messagesScrollTop: 42,
        hasMessagesScrollTop: true,
        missingKeyMessageShown: true,
        lastResponseId: 'resp_1',
        choicePrompt: {
          message: 'Pick one',
          options: [{ value: 'a', label: 'A' }],
          behavior: 'send'
        },
        progress: { message: 'Waiting...', visible: true },
        sending: true
      });

    assert.equal(
      model.messages.read().length,
      1);

    assert.equal(
      model.promptDraft,
      'next prompt');

    assert.equal(
      model.messagesScrollTop,
      42);

    assert.equal(
      model.hasMessagesScrollTop,
      true);

    assert.equal(
      model.missingKeyMessageShown,
      true);

    assert.equal(
      model.lastResponseId,
      'resp_1');

    assert.deepEqual(
      model.choicePrompt,
      { message: 'Pick one', options: [{ value: 'a', label: 'A' }] });

    assert.deepEqual(
      model.progress,
      { message: 'Waiting...', visible: true });

    assert.equal(
      model.sending,
      true);
  });

test(
  'createAiChatModel exposes model-level choice and progress helpers',
  async () =>
  {
    const {
      createAiChatModel,
      serializeAiChatModelState
    } =
      await loadAiChatModule();

    const model =
      createAiChatModel();

    model.setProgress('Working');

    assert.equal(
      model.progress?.message,
      'Working');

    const choicePromise =
      model.presentChoices(
        'Pick one',
        ['a', 'b']);

    assert.equal(
      model.choicePrompt?.options.length,
      2);

    model.dismissChoices();

    assert.equal(
      await choicePromise,
      null);

    assert.equal(
      model.choicePrompt,
      null);

    const state =
      serializeAiChatModelState(model);

    assert.deepEqual(
      state,
      {
        messages: [],
        promptDraft: '',
        messagesScrollTop: 0,
        hasMessagesScrollTop: false,
        missingKeyMessageShown: false,
        lastResponseId: null,
        choicePrompt: null,
        progress: { message: 'Working', visible: true },
        sending: false
      });
  });

test(
  'serializeAiChatModelState stores operational state including choice behavior',
  async () =>
  {
    const {
      createAiChatModel,
      serializeAiChatModelState
    } =
      await loadAiChatModule();

    const model =
      createAiChatModel();

    await model.presentChoices(
      'Pick one',
      ['a', 'b'],
      'send');

    model.setProgress('Working');
    model.sending = true;

    const state =
      serializeAiChatModelState(model);

    assert.deepEqual(
      state.choicePrompt,
      {
        message: 'Pick one',
        options: [{ value: 'a', label: 'a' }, { value: 'b', label: 'b' }],
        behavior: 'send'
      });

    assert.deepEqual(
      state.progress,
      { message: 'Working', visible: true });

    assert.equal(
      state.sending,
      true);
  });

test(
  'ai-chat: custom element exposes messages store and draft as direct properties',
  async () =>
  {
    await ensureDom();
    await loadModules();

    const chat =
      document.createElement(
        'asljs-ai-chat') as AiChatElement;

    chat.messages.save(
      'assistant',
      'Hello there');

    chat.promptDraft = 'Draft prompt';

    document.body.appendChild(chat);
    await settleDeep(chat);

    assert.equal(
      chat.messages.read().length,
      1);

    assert.equal(
      chat.messages.read()[0].content,
      'Hello there');

    assert.equal(
      chat.promptDraft,
      'Draft prompt');

    assert.equal(
      chat.querySelector(
        '.asljs-ai-chat-bubble')?.textContent?.includes(
          'Hello there'),
      true);
  });

test(
  'ai-chat: direct state properties render restored chat values',
  async () =>
  {
    await ensureDom();
    await loadModules();

    const {
      createAiChatModel
    } =
      await loadAiChatModule();

    const chat =
      document.createElement(
        'asljs-ai-chat') as AiChatElement;

    const restoredModel =
      createAiChatModel(
        {
        messages: [{ role: 'assistant', content: 'Restored' }],
        promptDraft: 'restored draft'
      });

    chat.messages = restoredModel.messages;
    chat.promptDraft = restoredModel.promptDraft;
    document.body.appendChild(chat);
    await settleDeep(chat);

    assert.equal(
      chat.messages.read().length,
      1);

    assert.equal(
      chat.messages.read()[0].content,
      'Restored');

    assert.equal(
      chat.promptDraft,
      'restored draft');
  });

test(
  'ai-chat: auto session storage restores messages by component id',
  async () =>
  {
    await ensureDom();
    await loadModules();

    sessionStorage.clear();

    const first =
      document.createElement(
        'asljs-ai-chat') as AiChatElement;

    first.id = 'session-chat';
    document.body.appendChild(first);
    await settleDeep(first);

    first.messages.save(
      'assistant',
      'Persisted session message');

    first.choicePrompt = {
      message: 'Pick one',
      options: [{ value: 'a', label: 'A' }]
    };

    first.progress = { message: 'Waiting...', visible: true };
    first.sending = true;
    await Promise.resolve();
    await Promise.resolve();

    document.body.replaceChildren();

    const restored =
      document.createElement(
        'asljs-ai-chat') as AiChatElement;

    restored.id = 'session-chat';
    document.body.appendChild(restored);
    await settleDeep(restored);

    assert.equal(
      restored.messages.read().length,
      1);

    assert.equal(
      restored.messages.read()[0].content,
      'Persisted session message');

    assert.deepEqual(
      restored.choicePrompt,
      { message: 'Pick one', options: [{ value: 'a', label: 'A' }] });

    assert.deepEqual(
      restored.progress,
      { message: 'Waiting...', visible: true });

    assert.equal(
      restored.sending,
      true);
  });

test(
  'ai-chat: send button keeps theme button classes alongside chat classes',
  async () =>
  {
    await ensureDom();
    await loadModules();

    const provider =
      document.createElement(
        'asljs-theme-provider') as
      & HTMLElement
      & {
        theme: unknown;
      };

    const chat =
      document.createElement(
        'asljs-ai-chat') as AiChatElement;

    const {
      createBootstrapTheme
    } =
      await import('./index.js');

    provider.theme = createBootstrapTheme();
    provider.appendChild(chat);
    document.body.appendChild(provider);
    await settleDeep(chat);

    const sendButton =
      chat.querySelector(
        '[data-role="send"] button');

    const sendButtonClassName =
      sendButton?.getAttribute('class') ?? '';

    assert.match(
      sendButtonClassName,
      /\bbtn\b/);

    assert.match(
      sendButtonClassName,
      /\bbtn-primary\b/);

    assert.match(
      sendButtonClassName,
      /\basljs-ai-chat-send\b/);
  });

test(
  'ai-chat-key: custom element renders label and emits key-submit on submit',
  async () =>
  {
    await ensureDom();
    await loadModules();
    await import('./ai-chat-key.js');

    const keyPrompt =
      document.createElement(
        'asljs-ai-chat-key') as AiChatKeyPromptElement;

    keyPrompt.label = 'Enter your key';
    keyPrompt.submitLabel = 'Go';

    document.body.appendChild(keyPrompt);
    await settleDeep(keyPrompt);

    const labelEl =
      keyPrompt.querySelector(
        '.asljs-ai-chat-key-label');

    assert.ok(
      labelEl !== null,
      'key label element is present');

    assert.ok(
      labelEl?.textContent?.includes(
        'Enter your key'),
      'key label text is rendered');

    let submittedKey: string | null = null;

    keyPrompt.addEventListener(
      'key-submit',
      (event: Event) =>
      {
        submittedKey = (event as CustomEvent<{ key: string; }>).detail.key;
      });

    const textInput =
      keyPrompt.querySelector(
        'asljs-text-input') as
      | HTMLElement
      | null;

    assert.ok(
      textInput !== null,
      'asljs-text-input is rendered inside key prompt');

    if (textInput !== null) {
      const innerInput =
        textInput.querySelector('input') as
        | HTMLInputElement
        | null;

      if (innerInput !== null) {
        innerInput.value = 'sk-test-key';

        innerInput.dispatchEvent(
          new Event('input', { bubbles: true }));

        await Promise.resolve();
      }
    }

    const button =
      keyPrompt.querySelector('asljs-button') as
      | HTMLElement
      | null;

    button?.dispatchEvent(
      new Event('click', { bubbles: true }));

    await Promise.resolve();

    assert.equal(
      submittedKey,
      'sk-test-key',
      'key-submit event carries the entered key');
  });

test(
  'OpenAiTransport: postRequest sends to openai and returns parsed JSON',
  async () =>
  {
    const { OpenAiTransport: Transport } =
      await import('./ai-chat.js');

    const capturedRequests: Array<{
      url: string;
      init: RequestInit;
    }> = [];

    const originalFetch =
      globalThis.fetch;

    globalThis.fetch = (async (
      url: string,
      init?: RequestInit
    ): Promise<Response> =>
    {
      capturedRequests.push(
        { url, init: init ?? {} });

      return {
        ok: true,
        json: async () => ({ id: 'resp_1', output: [] })
      } as unknown as Response;
    }) as typeof fetch;

    try {
      const transport =
        new Transport('sk-test');

      const result =
        await transport.postRequest(
          {
          model: 'gpt-4o',
          input: []
        });

      assert.equal(
        capturedRequests.length,
        1);

      assert.equal(
        capturedRequests[0].url,
        'https://api.openai.com/v1/responses',
        'request sent to correct OpenAI endpoint');

      const headers =
        capturedRequests[0].init.headers as Record<
        string,
        string
      >;

      assert.ok(
        headers.Authorization.includes('sk-test'),
        'Authorization header includes API key');

      assert.equal(
        result.id,
        'resp_1');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

async function loadModules(
  ): Promise<void>
{
  await ensureDom();

  if (modulesLoaded) {
    return;
  }

  await import('./button.js');
  await import('./text-input.js');
  await import('./select.js');
  await loadAiChatModule();
  modulesLoaded = true;
}

async function loadAiChatModule(
  ): Promise<typeof AiChatModule>
{
  await ensureDom();

  if (aiChatModulePromise === null) {
    aiChatModulePromise = import('./ai-chat.js');
  }

  return aiChatModulePromise;
}

async function ensureDom(
  ): Promise<void>
{
  if (domRestore === null) {
    const dom =
      new JSDOM(
      '<!doctype html><html><body></body></html>',
      { url: 'https://asljs.test/' }
    );

    const previous =
      {
      window: globalThis.window,
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
      location: globalThis.location
    };

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

    globalThis.getComputedStyle = dom.window.getComputedStyle.bind(
      dom.window);

    globalThis.sessionStorage = dom.window.sessionStorage;
    globalThis.location = dom.window.location;

    domRestore = () =>
    {
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
    [...element.querySelectorAll('*')] as LitElementLike[];

  for (const nestedElement of nestedElements) {
    if ('updateComplete' in nestedElement) {
      await nestedElement.updateComplete;
    }
  }

  await Promise.resolve();
}

type LitElementLike = HTMLElement & {
  updateComplete: Promise<unknown>;
};

type AiChatElement =
  & LitElementLike
  & {
    messages: {
      read: () => ReadonlyArray<{ role: string; content: string; }>;
      save: (
        role: 'user' | 'assistant' | 'system',
        content: string
      ) => void;
    };
    promptDraft: string;
    choicePrompt: {
      message: string;
      options: Array<{ value: string; label: string; }>;
    } | null;
    progress: {
      message: string;
      visible: boolean;
    } | null;
    sending: boolean;
  };

type AiChatKeyPromptElement =
  & LitElementLike
  & {
    label: string;
    submitLabel: string;
  };
