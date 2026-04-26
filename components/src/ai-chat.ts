import {
    observable,
  } from 'asljs-observable';
import {
    type EventMap,
    type Eventful,
  } from 'asljs-eventful';

const autoScrollBottomThresholdPx = 24;
const defaultChatModel = 'gpt-4.1-mini';
const defaultMissingCredentialsMessage =
  'OpenAI API key is not configured.';
const defaultInitialToolStepLimit = 6;
const defaultToolStepExtension = 12;

type ChoiceBehavior =
  | 'resolve'
  | 'send';

type InternalChoiceState =
  { behavior: ChoiceBehavior;
    resolver: ((value: string | null) => void) | null; };

const internalChoiceStateByModel =
  new WeakMap<AiChatModel, InternalChoiceState>();

export type AiChatMessageRole =
  | 'user'
  | 'assistant'
  | 'system';

export interface AiChatMessage {
  role: AiChatMessageRole;
  content: string;
}

export interface AiChatToolDefinition {
  [key: string]: unknown;
}

export interface AiChatResponsesInputItem {
  role?: string;
  content?: unknown;
  type?: string;
  [key: string]: unknown;
}

export interface AiChatChoiceOption {
  value: string;
  label: string;
}

export interface AiChatChoicePrompt {
  message: string;
  options: AiChatChoiceOption[];
}

export interface AiChatProgressState {
  message: string;
  visible: boolean;
}

export interface AiChatSerializableState {
  messages: AiChatMessage[];
  messageHistory: AiChatResponsesInputItem[];
  promptDraft: string;
  messagesScrollTop: number;
  hasMessagesScrollTop: boolean;
  missingKeyMessageShown: boolean;
}

export interface AiChatSecretsAndSettingsProvider {
  getOpenAiApiKey: () => Promise<string>;
  getChatModel: () => Promise<string>;
  getInitialToolStepLimit?: () => Promise<number | null>;
}

export interface AiChatStateStore {
  load: () => Promise<Partial<AiChatSerializableState>>;
  save: (
      state: AiChatSerializableState
    ) => Promise<void>;
}

export interface AiChatInitializeContext {
  model: AiChatModel;
}

export interface AiChatBeforeSendContext<TRequestContext = unknown> {
  model: AiChatModel;
  prompt: string;
  requestContext: TRequestContext;
  chatModel: string;
  apiKey: string;
  canceled: boolean;
  cancelMessage: string | null;
  cancel: (message?: string) => void;
}

export interface AiChatAfterResponseContext<TRequestContext = unknown> {
  model: AiChatModel;
  prompt: string;
  responseText: string;
  requestContext: TRequestContext;
  requestInput: AiChatResponsesInputItem[];
  chatModel: string;
}

export interface AiChatToolStepLimitContext {
  model: AiChatModel;
  stepsCompleted: number;
  stepLimit: number;
  extension: number;
  approved: boolean | null;
  approve: () => void;
  deny: () => void;
}

export interface AiChatBuildRequestArgs<TRequestContext> {
  model: AiChatModel;
  prompt: string;
  messageHistory: AiChatResponsesInputItem[];
  requestContext: TRequestContext;
  chatModel: string;
}

export interface AiChatModelMethods {
  appendMessage: (
      role: AiChatMessageRole,
      content: string
    ) => void;
  clearMessages: () => void;
  clearProgress: () => void;
  dismissChoices: () => void;
  presentChoices: (
      message: string,
      options: string[] | AiChatChoiceOption[],
      behavior?: ChoiceBehavior
    ) => Promise<string | null>;
  setProgress: (
      message: string,
      visible?: boolean
    ) => void;
}

type AiChatModelEvents =
  EventMap
  & {
    initialize: [ AiChatInitializeContext ];
    beforeSend: [ AiChatBeforeSendContext ];
    afterResponse: [ AiChatAfterResponseContext ];
    toolStepLimit: [ AiChatToolStepLimitContext ];
  };

export type AiChatModel =
  AiChatSerializableState
  & {
    choicePrompt: AiChatChoicePrompt | null;
    progress: AiChatProgressState | null;
    sending: boolean;
  }
  & AiChatModelMethods
  & Eventful<AiChatModelEvents>;

type ObservableArray<T> =
  T[]
  & Eventful;

export interface AiChatOptions<
    TRequestContext = unknown,
    TToolsContext = unknown,
  >
{
  provider: AiChatSecretsAndSettingsProvider;
  stateStore?: AiChatStateStore;
  buildRequestInput: (
      args: AiChatBuildRequestArgs<TRequestContext>
    ) => Promise<AiChatResponsesInputItem[]> | AiChatResponsesInputItem[];
  getRequestContext: () => Promise<TRequestContext> | TRequestContext;
  executeTool?: (
      name: string,
      argumentsJson: string,
      context: TToolsContext
    ) => Promise<unknown>;
  getTools?: () => AiChatToolDefinition[];
  getToolsContext?: () => Promise<TToolsContext> | TToolsContext;
  missingKeyMessage?: string;
  renderAssistantMessage?: (content: string) => string;
  toolStepExtension?: number;
}

export function createAiChatModel(
    initial: Partial<AiChatSerializableState> = { }
  ): AiChatModel
{
  const model =
    observable(
      { messages: initial.messages ?? [ ],
        messageHistory: initial.messageHistory ?? [ ],
        promptDraft: initial.promptDraft ?? '',
        messagesScrollTop: initial.messagesScrollTop ?? 0,
        hasMessagesScrollTop: initial.hasMessagesScrollTop ?? false,
        missingKeyMessageShown: initial.missingKeyMessageShown ?? false,
        choicePrompt: null,
        progress: null,
        sending: false }) as unknown as AiChatModel;

  internalChoiceStateByModel.set(
    model,
    { behavior: 'resolve',
      resolver: null });

  Object.defineProperties(
    model,
    { appendMessage:
        defineModelMethod(
          (
            role: AiChatMessageRole,
            content: string
          ): void =>
          {
            model.messages.push(
              { role,
                content });
          }),
      clearMessages:
        defineModelMethod(
          (): void =>
          {
            model.messages.splice(
              0,
              model.messages.length);
            model.messageHistory.splice(
              0,
              model.messageHistory.length);
          }),
      clearProgress:
        defineModelMethod(
          (): void =>
          {
            model.progress = null;
          }),
      dismissChoices:
        defineModelMethod(
          (): void =>
          {
            dismissChoices(model, null);
          }),
      presentChoices:
        defineModelMethod(
          async (
              message: string,
              options: string[] | AiChatChoiceOption[],
              behavior: ChoiceBehavior = 'resolve'
            ): Promise<string | null> =>
          {
            const normalizedOptions =
              normalizeChoiceOptions(options);

            dismissChoices(model, null);

            if (normalizedOptions.length === 0) {
              model.choicePrompt = null;
              return null;
            }

            model.choicePrompt =
              { message,
                options: normalizedOptions };

            const internalState =
              getInternalChoiceState(model);

            internalState.behavior = behavior;

            if (behavior === 'send') {
              internalState.resolver = null;
              return null;
            }

            return new Promise<string | null>(
              resolve => {
                internalState.resolver = resolve;
              });
          }),
      setProgress:
        defineModelMethod(
          (
            message: string,
            visible: boolean = true
          ): void =>
          {
            model.progress =
              visible
                ? { message,
                    visible: true }
                : null;
          }) });

  return model;
}

export function serializeAiChatModelState(
    model: AiChatModel
  ): AiChatSerializableState
{
  return {
    messages:
      model.messages.map(
        message =>
          ({ role: message.role,
             content: message.content })),
    messageHistory:
      model.messageHistory.map(
        entry =>
          cloneInputItem(entry)),
    promptDraft: model.promptDraft,
    messagesScrollTop: model.messagesScrollTop,
    hasMessagesScrollTop: model.hasMessagesScrollTop,
    missingKeyMessageShown: model.missingKeyMessageShown,
  };
}

export async function createAiChatComponent<
    TRequestContext = unknown,
    TToolsContext = unknown,
  >(
    options: AiChatOptions<TRequestContext, TToolsContext>,
    model: AiChatModel = createAiChatModel(),
  ): Promise<HTMLElement>
{
  if (options.stateStore) {
    applyLoadedState(
      model,
      await options.stateStore.load());
  }

  const tools =
    options.getTools?.() ?? [ ];

  const element =
    document.createElement('div');

  element.className = 'asljs-ai-chat';
  element.style.display = 'flex';
  element.style.flexDirection = 'column';
  element.style.gap = '0.75rem';
  element.style.height = '100%';
  element.style.minHeight = '0';

  element.innerHTML =
    `
      <div class="asljs-ai-chat-window"
           data-role="window"
           style="display:flex;
                  flex-direction:column;
                  gap:0.75rem;
                  flex:1 1 auto;
                  min-height:12em;
                  overflow:hidden;">
        <div class="asljs-ai-chat-messages"
             data-role="messages"
             style="display:flex;
                    flex-direction:column;
                    gap:0.75rem;
                    flex:1 1 auto;
                    overflow:auto;"></div>
        <div class="asljs-ai-chat-progress"
             data-role="progress"
             style="display:none;"></div>
        <div class="asljs-ai-chat-choice-panel"
             data-role="choices"
             style="display:none;"></div>
      </div>
      <textarea class="asljs-ai-chat-input"
                data-role="prompt"
                rows="3"
                placeholder="Ask AI..."
                style="resize:none;"></textarea>
      <div class="asljs-ai-chat-actions"
           style="display:flex;
                  justify-content:flex-end;">
        <button type="button"
                class="asljs-ai-chat-send"
                data-role="send">
          Send
        </button>
      </div>
    `;

  const messagesElement =
    element.querySelector('[data-role="messages"]') as HTMLElement;
  const progressElement =
    element.querySelector('[data-role="progress"]') as HTMLElement;
  const choicesElement =
    element.querySelector('[data-role="choices"]') as HTMLElement;
  const promptElement =
    element.querySelector('[data-role="prompt"]') as HTMLTextAreaElement;
  const sendButton =
    element.querySelector('[data-role="send"]') as HTMLButtonElement;

  promptElement.value = model.promptDraft;

  const persistState =
    createStatePersistenceScheduler(
      model,
      options.stateStore);

  const saveMessagesScroll =
    (): void => {
      model.messagesScrollTop = messagesElement.scrollTop;
      model.hasMessagesScrollTop = true;
      persistState();
    };

  const restoreMessagesScroll =
    (): void => {
      if (!model.hasMessagesScrollTop) {
        return;
      }

      messagesElement.scrollTop = model.messagesScrollTop;
    };

  const scrollMessagesToBottom =
    (): void => {
      messagesElement.scrollTop = messagesElement.scrollHeight;
      saveMessagesScroll();
    };

  messagesElement.addEventListener(
    'scroll',
    () => {
      saveMessagesScroll();
    });

  const chatElementWithApi =
    element as HTMLElement & {
      restoreMessagesScroll?: () => void;
    };

  chatElementWithApi.restoreMessagesScroll =
    () => {
      requestAnimationFrame(
        () => {
          restoreMessagesScroll();
        });
    };

  const renderMessages =
    (): void => {
      messagesElement.replaceChildren();

      for (const message of model.messages) {
        const row =
          document.createElement('div');

        row.className =
          `asljs-ai-chat-message asljs-ai-chat-message-${message.role}`;

        const roleLabel =
          document.createElement('div');

        roleLabel.className = 'asljs-ai-chat-role';
        roleLabel.textContent =
          message.role === 'user'
            ? 'You'
            : message.role === 'assistant'
              ? 'AI'
              : 'System';

        const bubble =
          document.createElement('div');

        bubble.className = 'asljs-ai-chat-bubble';
        bubble.innerHTML =
          message.role === 'assistant'
            ? renderAssistantContent(
              message.content,
              options.renderAssistantMessage)
            : escapeHtml(message.content);

        row.append(
          roleLabel,
          bubble);

        messagesElement.appendChild(row);
      }

      restoreMessagesScroll();
    };

  const renderProgress =
    (): void => {
      const progress =
        model.progress;

      if (progress === null || !progress.visible) {
        progressElement.style.display = 'none';
        progressElement.textContent = '';
        return;
      }

      progressElement.style.display = '';
      progressElement.textContent = progress.message;
    };

  const sendPromptValue =
    async (
      explicitPrompt?: string
    ): Promise<void> =>
    {
      const prompt =
        (explicitPrompt ?? promptElement.value).trim();

      if (prompt === '' || model.sending) {
        return;
      }

      const apiKey =
        (await options.provider.getOpenAiApiKey()).trim();

      if (apiKey === '') {
        if (!model.missingKeyMessageShown) {
          model.appendMessage(
            'system',
            options.missingKeyMessage
            ?? defaultMissingCredentialsMessage);
          model.missingKeyMessageShown = true;
          persistState();
        }

        return;
      }

      const chatModel =
        (await options.provider.getChatModel()).trim()
        || defaultChatModel;

      const requestContext =
        await options.getRequestContext();

      const beforeSendContext =
        createBeforeSendContext(
          model,
          prompt,
          requestContext,
          chatModel,
          apiKey);

      await model.emitAsync(
        'beforeSend',
        beforeSendContext as AiChatBeforeSendContext);

      if (beforeSendContext.canceled) {
        if (beforeSendContext.cancelMessage !== null
            && beforeSendContext.cancelMessage !== '')
        {
          model.appendMessage(
            'system',
            beforeSendContext.cancelMessage);
        }

        persistState();
        return;
      }

      const distanceFromBottom =
        messagesElement.scrollHeight
        - (messagesElement.scrollTop + messagesElement.clientHeight);

      const shouldAutoScroll =
        distanceFromBottom <= autoScrollBottomThresholdPx;

      model.appendMessage(
        'user',
        prompt);
      model.promptDraft = '';
      promptElement.value = '';
      model.sending = true;
      model.dismissChoices();

      if (shouldAutoScroll) {
        requestAnimationFrame(
          () => {
            scrollMessagesToBottom();
          });
      }

      persistState();

      try {
        model.setProgress(
          'Requesting assistant response...');

        const requestInput =
          await options.buildRequestInput(
            { model,
              prompt,
              messageHistory:
                model.messageHistory.slice(),
              requestContext,
              chatModel });

        const assistantText =
          await runWithTools(
            apiKey,
            chatModel,
            requestInput,
            tools,
            model,
            options.executeTool,
            options.getToolsContext
              ? await options.getToolsContext()
              : undefined,
            options.provider,
            options.toolStepExtension ?? defaultToolStepExtension);

        model.messageHistory.push(
          { role: 'user',
            content: prompt });
        model.messageHistory.push(
          { role: 'assistant',
            content: assistantText });

        while (model.messageHistory.length > 24) {
          model.messageHistory.shift();
        }

        model.appendMessage(
          'assistant',
          assistantText);

        await model.emitAsync(
          'afterResponse',
          { model,
            prompt,
            responseText: assistantText,
            requestContext,
            requestInput,
            chatModel } as AiChatAfterResponseContext);
      } catch (e) {
        model.appendMessage(
          'system',
          `Failed to send message: ${String(e)}`);
      } finally {
        model.sending = false;
        model.clearProgress();
        persistState();
      }
    };

  const renderChoices =
    (): void => {
      const prompt =
        model.choicePrompt;

      choicesElement.replaceChildren();

      if (prompt === null
          || prompt.message.trim() === ''
          || prompt.options.length === 0)
      {
        choicesElement.style.display = 'none';
        return;
      }

      const questionElement =
        document.createElement('div');

      questionElement.className = 'asljs-ai-chat-choice-message';
      questionElement.textContent = prompt.message;

      const optionsElement =
        document.createElement('div');

      optionsElement.className = 'asljs-ai-chat-choice-options';

      for (const option of prompt.options) {
        const button =
          document.createElement('button');

        button.type = 'button';
        button.className = 'asljs-ai-chat-choice-option';
        button.textContent = option.label;
        button.addEventListener(
          'click',
          () => {
            const internalState =
              getInternalChoiceState(model);
            const behavior =
              internalState.behavior;

            dismissChoices(
              model,
              behavior === 'resolve'
                ? option.value
                : null);
            persistState();

            if (behavior === 'send') {
              void sendPromptValue(option.value);
            }
          });

        optionsElement.appendChild(button);
      }

      choicesElement.append(
        questionElement,
        optionsElement);
      choicesElement.style.display = '';
    };

  const syncSendingUi =
    (): void => {
      promptElement.disabled = model.sending;
      sendButton.disabled = model.sending;
    };

  const rebindArrayListeners =
    bindModelListeners(
      model,
      renderMessages,
      renderProgress,
      renderChoices,
      syncSendingUi,
      persistState);

  promptElement.addEventListener(
    'input',
    () => {
      model.promptDraft = promptElement.value;
      persistState();
    });

  promptElement.addEventListener(
    'keydown',
    event => {
      const keyboardEvent =
        event as KeyboardEvent;

      if (keyboardEvent.key !== 'Enter'
          || keyboardEvent.shiftKey)
      {
        return;
      }

      keyboardEvent.preventDefault();
      void sendPromptValue();
    });

  sendButton.addEventListener(
    'click',
    () => {
      void sendPromptValue();
    });

  renderMessages();
  renderProgress();
  renderChoices();
  syncSendingUi();
  persistState();

  await model.emitAsync(
    'initialize',
    { model });

  renderMessages();
  renderProgress();
  renderChoices();
  syncSendingUi();
  persistState();

  element.addEventListener(
    'DOMNodeRemoved',
    () => {
      rebindArrayListeners.dispose();
    });

  return element;
}

function defineModelMethod(
    value: unknown
  ): PropertyDescriptor
{
  return {
    value,
    enumerable: false,
    configurable: true,
    writable: true,
  };
}

function normalizeChoiceOptions(
    options: string[] | AiChatChoiceOption[]
  ): AiChatChoiceOption[]
{
  return options
    .map(
      option =>
        typeof option === 'string'
          ? { value: option,
              label: option }
          : { value: option.value,
              label: option.label })
    .filter(
      option =>
        option.value.trim() !== ''
        && option.label.trim() !== '');
}

function dismissChoices(
    model: AiChatModel,
    value: string | null
  ): void
{
  const internalState =
    getInternalChoiceState(model);

  const resolver =
    internalState.resolver;

  model.choicePrompt = null;
  internalState.resolver = null;
  internalState.behavior = 'resolve';

  resolver?.(value);
}

function getInternalChoiceState(
    model: AiChatModel
  ): InternalChoiceState
{
  const state =
    internalChoiceStateByModel.get(model);

  if (state === undefined) {
    throw new Error('AI chat model internal state is missing.');
  }

  return state;
}

function cloneInputItem(
    entry: AiChatResponsesInputItem
  ): AiChatResponsesInputItem
{
  return JSON.parse(
    JSON.stringify(entry)) as AiChatResponsesInputItem;
}

function applyLoadedState(
    model: AiChatModel,
    loaded: Partial<AiChatSerializableState>
  ): void
{
  if (Array.isArray(loaded.messages)) {
    model.messages.splice(
      0,
      model.messages.length,
      ...loaded.messages.map(
        message =>
          ({ role: message.role,
             content: message.content })));
  }

  if (Array.isArray(loaded.messageHistory)) {
    model.messageHistory.splice(
      0,
      model.messageHistory.length,
      ...loaded.messageHistory.map(
        entry =>
          cloneInputItem(entry)));
  }

  if (typeof loaded.promptDraft === 'string') {
    model.promptDraft = loaded.promptDraft;
  }

  if (typeof loaded.messagesScrollTop === 'number') {
    model.messagesScrollTop = loaded.messagesScrollTop;
  }

  if (typeof loaded.hasMessagesScrollTop === 'boolean') {
    model.hasMessagesScrollTop = loaded.hasMessagesScrollTop;
  }

  if (typeof loaded.missingKeyMessageShown === 'boolean') {
    model.missingKeyMessageShown = loaded.missingKeyMessageShown;
  }
}

function createStatePersistenceScheduler(
    model: AiChatModel,
    stateStore: AiChatStateStore | undefined
  ): () => void
{
  if (stateStore === undefined) {
    return () => {
    };
  }

  let queued = false;

  return () => {
    if (queued) {
      return;
    }

    queued = true;

    queueMicrotask(
      () => {
        queued = false;
        void stateStore.save(
          serializeAiChatModelState(model));
      });
  };
}

function bindModelListeners(
    model: AiChatModel,
    renderMessages: () => void,
    renderProgress: () => void,
    renderChoices: () => void,
    syncSendingUi: () => void,
    persistState: () => void
  ): {
    dispose: () => void;
  }
{
  const disposers: Array<() => boolean> = [ ];
  let messagesArrayDisposers: Array<() => boolean> = [ ];
  let messageHistoryArrayDisposers: Array<() => boolean> = [ ];

  const bindMessagesArray =
    (): void => {
      const messages =
        model.messages as ObservableArray<AiChatMessage>;

      for (const dispose of messagesArrayDisposers) {
        dispose();
      }

      messagesArrayDisposers = [
        messages.on(
          'set',
          () => {
            renderMessages();
            persistState();
          }),
        messages.on(
          'delete',
          () => {
            renderMessages();
            persistState();
          }),
        messages.on(
          'define',
          () => {
            renderMessages();
            persistState();
          }),
      ];
    };

  const bindMessageHistoryArray =
    (): void => {
      const messageHistory =
        model.messageHistory as ObservableArray<AiChatResponsesInputItem>;

      for (const dispose of messageHistoryArrayDisposers) {
        dispose();
      }

      messageHistoryArrayDisposers = [
        messageHistory.on(
          'set',
          () => {
            persistState();
          }),
        messageHistory.on(
          'delete',
          () => {
            persistState();
          }),
        messageHistory.on(
          'define',
          () => {
            persistState();
          }),
      ];
    };

  bindMessagesArray();
  bindMessageHistoryArray();

  disposers.push(
    model.on(
      'set:messages',
      () => {
        bindMessagesArray();
        renderMessages();
        persistState();
      }),
    model.on(
      'set:messageHistory',
      () => {
        bindMessageHistoryArray();
        persistState();
      }),
    model.on(
      'set:progress',
      () => {
        renderProgress();
      }),
    model.on(
      'set:choicePrompt',
      () => {
        renderChoices();
      }),
    model.on(
      'set:promptDraft',
      () => {
        persistState();
      }),
    model.on(
      'set:missingKeyMessageShown',
      () => {
        persistState();
      }),
    model.on(
      'set:messagesScrollTop',
      () => {
        persistState();
      }),
    model.on(
      'set:hasMessagesScrollTop',
      () => {
        persistState();
      }),
    model.on(
      'set:sending',
      () => {
        syncSendingUi();
      }));

  return {
    dispose: (): void => {
      for (const dispose of messagesArrayDisposers) {
        dispose();
      }

      for (const dispose of messageHistoryArrayDisposers) {
        dispose();
      }

      for (const dispose of disposers) {
        dispose();
      }
    },
  };
}

function createBeforeSendContext<TRequestContext>(
    model: AiChatModel,
    prompt: string,
    requestContext: TRequestContext,
    chatModel: string,
    apiKey: string
  ): AiChatBeforeSendContext<TRequestContext>
{
  const context =
    { model,
      prompt,
      requestContext,
      chatModel,
      apiKey,
      canceled: false,
      cancelMessage: null as string | null,
      cancel: (
          message?: string
        ): void =>
        {
          context.canceled = true;
          context.cancelMessage =
            typeof message === 'string'
              ? message
              : null;
        } };

  return context;
}

async function runWithTools<TToolsContext>(
    apiKey: string,
    chatModel: string,
    input: AiChatResponsesInputItem[],
    tools: AiChatToolDefinition[],
    model: AiChatModel,
    executeTool: ((
        name: string,
        argumentsJson: string,
        context: TToolsContext
      ) => Promise<unknown>) | undefined,
    toolsContext: TToolsContext | undefined,
    provider: AiChatSecretsAndSettingsProvider,
    toolStepExtension: number
  ): Promise<string>
{
  let response =
    await postResponse(
      apiKey,
      { model: chatModel,
        input,
        tools });

  let stepLimit =
    await readInitialToolStepLimit(provider);
  let stepsCompleted = 0;

  while (true) {
    const output =
      Array.isArray(response.output)
        ? response.output
        : [ ];

    const functionCalls =
      output
        .filter(
          (item: unknown) =>
            isFunctionCallResponseItem(item));

    if (functionCalls.length === 0) {
      model.setProgress(
        `Completed in ${stepsCompleted} step(s).`);
      return extractAssistantText(response);
    }

    if (executeTool === undefined) {
      throw new Error(
        'Response requested function tools, but no executeTool callback was provided.');
    }

    if (stepsCompleted >= stepLimit) {
      const shouldContinue =
        await requestToolStepLimitExtension(
          model,
          stepsCompleted,
          stepLimit,
          toolStepExtension);

      if (!shouldContinue) {
        throw new Error(
          'AI exceeded the current tool step limit.');
      }

      stepLimit += toolStepExtension;
    }

    const stepNumber =
      stepsCompleted + 1;

    model.setProgress(
      `Step ${stepNumber}: running ${functionCalls.length} tool call(s)...`);

    const functionOutputs: Array<Record<string, unknown>> = [ ];

    for (const call of functionCalls) {
      try {
        const result =
          await executeTool(
            String(call.name ?? ''),
            String(call.arguments ?? ''),
            toolsContext as TToolsContext);

        functionOutputs.push(
          { type: 'function_call_output',
            call_id: call.call_id,
            output:
              typeof result === 'string'
                ? result
                : JSON.stringify(result) });
      } catch (e) {
        functionOutputs.push(
          { type: 'function_call_output',
            call_id: call.call_id,
            output: JSON.stringify(
              { error: String(e) }) });
      }
    }

    model.setProgress(
      `Step ${stepNumber}: submitting ${functionOutputs.length} tool result(s)...`);

    response =
      await postResponse(
        apiKey,
        { model: chatModel,
          previous_response_id: response.id,
          input: functionOutputs,
          tools });

    stepsCompleted += 1;
  }
}

async function readInitialToolStepLimit(
    provider: AiChatSecretsAndSettingsProvider
  ): Promise<number>
{
  const providedLimit =
    await provider.getInitialToolStepLimit?.()
    ?? null;

  if (!Number.isFinite(providedLimit)) {
    return defaultInitialToolStepLimit;
  }

  const normalized =
    Math.floor(providedLimit as number);

  return normalized >= 1
    ? normalized
    : defaultInitialToolStepLimit;
}

async function requestToolStepLimitExtension(
    model: AiChatModel,
    stepsCompleted: number,
    stepLimit: number,
    extension: number
  ): Promise<boolean>
{
  const context =
    { model,
      stepsCompleted,
      stepLimit,
      extension,
      approved: null as boolean | null,
      approve: (): void => {
        context.approved = true;
      },
      deny: (): void => {
        context.approved = false;
      } };

  await model.emitAsync(
    'toolStepLimit',
    context);

  if (context.approved !== null) {
    return context.approved;
  }

  const choice =
    await model.presentChoices(
      `AI reached the current tool step limit (${stepLimit}). Extend by ${extension} more step(s)?`,
      [ { value: 'extend',
          label: 'Extend' },
        { value: 'stop',
          label: 'Stop' } ],
      'resolve');

  return choice === 'extend';
}

function isFunctionCallResponseItem(
    value: unknown
  ): value is {
    type: string;
    name?: string;
    arguments?: string;
    call_id?: string;
  }
{
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (value as { type?: unknown }).type === 'function_call';
}

async function postResponse(
    apiKey: string,
    body: Record<string, unknown>
  ): Promise<Record<string, unknown>>
{
  const response =
    await fetch(
      'https://api.openai.com/v1/responses',
      { method: 'POST',
        headers:
          { 'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body) });

  if (!response.ok) {
    const text =
      await response.text();

    throw new Error(`OpenAI request failed: ${response.status} ${text}`);
  }

  return await response.json() as Record<string, unknown>;
}

function renderAssistantContent(
    content: string,
    renderAssistantMessage?: (content: string) => string
  ): string
{
  if (!renderAssistantMessage) {
    return escapeHtml(content);
  }

  try {
    return renderAssistantMessage(content);
  } catch {
    return escapeHtml(content);
  }
}

function escapeHtml(
    value: string
  ): string
{
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function extractAssistantText(
    response: Record<string, unknown>
  ): string
{
  if (typeof response.output_text === 'string'
      && response.output_text !== '')
  {
    return response.output_text;
  }

  const output =
    Array.isArray(response.output)
      ? response.output
      : [ ];

  for (const item of output) {
    if (!item
        || typeof item !== 'object'
        || (item as { type?: unknown }).type !== 'message')
    {
      continue;
    }

    const content =
      Array.isArray((item as { content?: unknown }).content)
        ? (item as { content: unknown[] }).content
        : [ ];

    const textParts =
      content
        .filter(
          (part: unknown): boolean =>
            !!part
            && typeof part === 'object'
            && (
              (part as { type?: unknown }).type === 'output_text'
              || (part as { type?: unknown }).type === 'text'))
        .map(
          (part: unknown): unknown =>
            (part as { text?: unknown }).text)
        .filter(
          (text: unknown): text is string =>
            typeof text === 'string');

    if (textParts.length > 0) {
      return textParts.join('\n');
    }
  }

  return 'No response text returned.';
}
