import {
    observable,
  } from 'asljs-observable';
import {
    type EventMap,
    type Eventful,
  } from 'asljs-eventful';
import {
    LitElement,
    html,
    nothing,
  } from 'lit';
import {
    customElement,
    property,
  } from 'lit/decorators.js';
import {
    unsafeHTML,
  } from 'lit/directives/unsafe-html.js';
import './buttons/button.js';
import './select.js';
import './text-input.js';

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

type TextInputElement =
  HTMLElement
  & {
    value: string | null;
    draftValue: string;
    multiline: boolean;
    rows: number;
    placeholder: string | null;
    disabled: boolean;
    enterKeyBehavior: 'finish' | 'newline';
    controlClassName: string;
  };

type SelectElement =
  HTMLElement
  & {
    label: string | null;
    value: string | null;
    items: AiChatChoiceOption[];
    placeholder: string | null;
    disabled: boolean;
    controlClassName: string;
  };

type ButtonElement =
  HTMLElement
  & {
    text: string;
    disabled: boolean;
    buttonClassName: string;
    type: 'button' | 'submit' | 'reset';
  };

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

@customElement('asljs-ai-chat')
export class AiChat
  extends LitElement
{
  #bindings: { dispose: () => void; } | null = null;
  #persistState: () => void = () => {};
  #setupVersion = 0;
  #shouldRestoreMessagesScroll = false;
  #shouldScrollMessagesToBottom = false;

  @property({ attribute: false })
    accessor model: AiChatModel = createAiChatModel();

  @property({ attribute: false })
    accessor options: AiChatOptions | null = null;

  override createRenderRoot(): this {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this.#bindComponent();
  }

  disconnectedCallback(): void {
    this.#disposeBindings();
    super.disconnectedCallback();
  }

  protected override updated(
      changedProperties: Map<PropertyKey, unknown>
    ): void
  {
    if (changedProperties.has('model')
        || changedProperties.has('options'))
    {
      void this.#bindComponent();
    }

    this.#syncMessagesScroll();
  }

  override render(): ReturnType<LitElement['render']> {
    const model =
      this.model;
    const progress =
      model.progress;
    const choicePrompt =
      model.choicePrompt;

    return html`
      <div class="asljs-ai-chat"
           style="display:flex;
                  flex-direction:column;
                  gap:0.75rem;
                  height:100%;
                  min-height:0;">
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
               @scroll=${this.#handleMessagesScroll}
               style="display:flex;
                      flex-direction:column;
                      gap:0.75rem;
                      flex:1 1 auto;
                      overflow:auto;">
            ${model.messages.map(
              message =>
                html`
                  <div class=${`asljs-ai-chat-message asljs-ai-chat-message-${message.role}`}>
                    <div class="asljs-ai-chat-role">
                      ${message.role === 'user'
                        ? 'You'
                        : message.role === 'assistant'
                          ? 'AI'
                          : 'System'}
                    </div>
                    <div class="asljs-ai-chat-bubble">
                      ${message.role === 'assistant'
                        ? unsafeHTML(
                          renderAssistantContent(
                            message.content,
                            this.options?.renderAssistantMessage))
                        : message.content}
                    </div>
                  </div>
                `)}
          </div>
          <div class="asljs-ai-chat-progress"
               data-role="progress"
               style=${progress === null || !progress.visible
                 ? 'display:none;'
                 : ''}>
            ${progress?.message ?? ''}
          </div>
          <div class="asljs-ai-chat-choice-panel"
               data-role="choices"
               style=${choicePrompt === null
                 || choicePrompt.message.trim() === ''
                 || choicePrompt.options.length === 0
                   ? 'display:none;'
                   : ''}>
            ${choicePrompt === null
              || choicePrompt.message.trim() === ''
              || choicePrompt.options.length === 0
                ? nothing
                : html`
                    <div class="asljs-ai-chat-choice-message">
                      ${choicePrompt.message}
                    </div>
                    <div class="asljs-ai-chat-choice-options">
                      <asljs-select
                          data-role="choice-select"
                          .items=${choicePrompt.options}
                          .value=${this.#resolveChoiceValue(choicePrompt)}
                          .placeholder=${null}
                          .label=${null}
                          .disabled=${model.sending}
                          .controlClassName=${'asljs-ai-chat-select'}>
                      </asljs-select>
                      <asljs-button
                          data-role="choice-submit"
                          .type=${'button'}
                          .text=${getInternalChoiceState(model).behavior === 'send'
                            ? 'Send'
                            : 'Choose'}
                          .disabled=${model.sending}
                          .buttonClassName=${'asljs-ai-chat-button asljs-ai-chat-choice-submit'}
                          @click=${this.#handleChoiceSubmit}>
                      </asljs-button>
                    </div>
                  `}
          </div>
        </div>
        <asljs-text-input
            data-role="prompt"
            .value=${model.promptDraft}
            .multiline=${true}
            .rows=${3}
            .placeholder=${'Ask AI...'}
            .enterKeyBehavior=${'newline'}
            .disabled=${model.sending}
            .controlClassName=${'asljs-ai-chat-input'}
            @input=${this.#handlePromptInput}
            @keydown=${this.#handlePromptKeydown}>
        </asljs-text-input>
        <div class="asljs-ai-chat-actions"
             style="display:flex;
                    justify-content:flex-end;">
          <asljs-button
              data-role="send"
              .type=${'button'}
              .text=${'Send'}
              .disabled=${model.sending}
              .buttonClassName=${'asljs-ai-chat-button asljs-ai-chat-send'}
              @click=${this.#handleSendClick}>
          </asljs-button>
        </div>
      </div>
    `;
  }

  async #bindComponent(): Promise<void> {
    const model =
      this.model;
    const options =
      this.options;
    const version =
      ++this.#setupVersion;

    this.#disposeBindings();
    this.#persistState =
      createStatePersistenceScheduler(
        model,
        options?.stateStore);

    if (options?.stateStore) {
      applyLoadedState(
        model,
        await options.stateStore.load());

      if (version !== this.#setupVersion) {
        return;
      }
    }

    this.#bindings =
      bindModelListeners(
        model,
        () => {
          this.#shouldRestoreMessagesScroll = true;
          this.requestUpdate();
        },
        () => {
          this.requestUpdate();
        },
        () => {
          this.requestUpdate();
        },
        () => {
          this.requestUpdate();
        },
        this.#persistState);

    await model.emitAsync(
      'initialize',
      { model });

    if (version !== this.#setupVersion) {
      return;
    }

    this.#shouldRestoreMessagesScroll = true;
    this.requestUpdate();
  }

  #disposeBindings(): void {
    this.#bindings?.dispose();
    this.#bindings = null;
    this.#persistState = () => {};
  }

  #syncMessagesScroll(): void {
    const messagesElement =
      this.#messagesElement;

    if (messagesElement === null) {
      return;
    }

    if (this.#shouldScrollMessagesToBottom) {
      this.#shouldScrollMessagesToBottom = false;
      messagesElement.scrollTop = messagesElement.scrollHeight;
      this.#handleMessagesScroll();
      return;
    }

    if (!this.#shouldRestoreMessagesScroll) {
      return;
    }

    this.#shouldRestoreMessagesScroll = false;

    if (!this.model.hasMessagesScrollTop) {
      return;
    }

    messagesElement.scrollTop = this.model.messagesScrollTop;
  }

  get #messagesElement(): HTMLElement | null {
    return this.querySelector('[data-role="messages"]') as HTMLElement | null;
  }

  get #promptElement(): TextInputElement | null {
    return this.querySelector('[data-role="prompt"]') as TextInputElement | null;
  }

  get #choiceSelectElement(): SelectElement | null {
    return this.querySelector('[data-role="choice-select"]') as SelectElement | null;
  }

  #handleMessagesScroll = (): void => {
    const messagesElement =
      this.#messagesElement;

    if (messagesElement === null) {
      return;
    }

    this.model.messagesScrollTop = messagesElement.scrollTop;
    this.model.hasMessagesScrollTop = true;
    this.#persistState();
  };

  #handlePromptInput = (): void => {
    this.model.promptDraft = this.#promptElement?.draftValue ?? '';
    this.#persistState();
  };

  #handlePromptKeydown = (event: Event): void => {
    const keyboardEvent =
      event as KeyboardEvent;

    if (keyboardEvent.key !== 'Enter'
        || keyboardEvent.shiftKey
        || keyboardEvent.ctrlKey
        || keyboardEvent.metaKey)
    {
      return;
    }

    keyboardEvent.preventDefault();
    void this.#sendPromptValue();
  };

  #handleSendClick = (): void => {
    void this.#sendPromptValue();
  };

  #handleChoiceSubmit = (): void => {
    const selectedValue =
      (this.#choiceSelectElement?.value ?? '').trim();

    if (selectedValue === '') {
      return;
    }

    const internalState =
      getInternalChoiceState(this.model);
    const behavior =
      internalState.behavior;

    dismissChoices(
      this.model,
      behavior === 'resolve'
        ? selectedValue
        : null);
    this.#persistState();

    if (behavior === 'send') {
      void this.#sendPromptValue(selectedValue);
    }
  };

  #resolveChoiceValue(
      prompt: AiChatChoicePrompt
    ): string
  {
    const currentValue =
      (this.#choiceSelectElement?.value ?? '').trim();

    if (prompt.options.some(option => option.value === currentValue)) {
      return currentValue;
    }

    return prompt.options[0]?.value ?? '';
  }

  async #sendPromptValue(
      explicitPrompt?: string
    ): Promise<void>
  {
    const options =
      this.options;
    const model =
      this.model;

    if (options === null) {
      return;
    }

    const prompt =
      (explicitPrompt
       ?? this.#promptElement?.draftValue
       ?? this.#promptElement?.value
       ?? '')
        .trim();

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
        this.#persistState();
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

      this.#persistState();
      return;
    }

    const messagesElement =
      this.#messagesElement;
    const distanceFromBottom =
      messagesElement === null
        ? 0
        : messagesElement.scrollHeight
          - (messagesElement.scrollTop + messagesElement.clientHeight);
    const shouldAutoScroll =
      distanceFromBottom <= autoScrollBottomThresholdPx;

    model.appendMessage(
      'user',
      prompt);
    model.promptDraft = '';
    model.sending = true;
    model.dismissChoices();

    if (shouldAutoScroll) {
      this.#shouldScrollMessagesToBottom = true;
    }

    this.#persistState();

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
          options.getTools?.() ?? [ ],
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
    } catch (error) {
      model.appendMessage(
        'system',
        `Failed to send message: ${String(error)}`);
    } finally {
      model.sending = false;
      model.clearProgress();
      this.#persistState();
    }
  }
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
