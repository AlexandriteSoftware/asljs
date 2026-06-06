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
import {
    type ComponentModelDefinition,
  } from './abstractions/model.js';
import {
    findThemeProvider,
    getDefaultTheme,
    resolveThemeText,
  } from './themes/theme.js';
import './button.js';
import './select.js';
import './text-input.js';

export const AiChatModelDefinition: ComponentModelDefinition =
  { name: 'AiChatModelDefinition',
    title: 'Ai Chat',
    properties:
      [ { name: 'model',
          title: 'Model',
          type: 'object',
          description: 'Chat runtime state model.' },
        { name: 'options',
          title: 'Options',
          type: 'object',
          description: 'Provider, request, and persistence callbacks.' } ] };

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

export interface AiChatSerializableChoicePrompt {
  message: string;
  options: AiChatChoiceOption[];
  behavior: ChoiceBehavior;
}

export interface AiChatSerializableState {
  messages: AiChatMessage[];
  promptDraft: string;
  messagesScrollTop: number;
  hasMessagesScrollTop: boolean;
  missingKeyMessageShown: boolean;
  lastResponseId: string | null;
  choicePrompt: AiChatSerializableChoicePrompt | null;
  progress: AiChatProgressState | null;
  sending: boolean;
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
  messages: AiChatMessages;
  requestContext: TRequestContext;
  chatModel: string;
}

export interface AiChatMessages {
  readonly list: readonly AiChatMessage[];
  read: () => readonly AiChatMessage[];
  save: (
      role: AiChatMessageRole,
      content: string
    ) => void;
  clear: () => void;
  toResponsesInput: () => AiChatResponsesInputItem[];
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
  Omit<AiChatSerializableState, 'messages' | 'choicePrompt' | 'progress' | 'sending'>
  & {
    messages: AiChatMessages;
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

export interface AiChatTransport {
  postRequest: (
      body: Record<string, unknown>
    ) => Promise<Record<string, unknown>>;
}

export class OpenAiTransport
  implements AiChatTransport
{
  readonly #apiKey: string;

  constructor(apiKey: string) {
    this.#apiKey = apiKey;
  }

  async postRequest(
      body: Record<string, unknown>
    ): Promise<Record<string, unknown>>
  {
    const response =
      await fetch(
        'https://api.openai.com/v1/responses',
        { method: 'POST',
          headers:
            { 'Content-Type': 'application/json',
              Authorization: `Bearer ${this.#apiKey}` },
          body: JSON.stringify(body) });

    if (!response.ok) {
      const text =
        await response.text();

      throw new Error(`OpenAI request failed: ${response.status} ${text}`);
    }

    return await response.json() as Record<string, unknown>;
  }
}

export interface AiChatOptions<
    TRequestContext = unknown,
    TToolsContext = unknown,
  >
{
  provider: AiChatSecretsAndSettingsProvider;
  transport?: AiChatTransport;
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
  const initialChoicePrompt =
    normalizeSerializableChoicePrompt(
      initial.choicePrompt);
  const initialProgress =
    normalizeSerializableProgressState(
      initial.progress);
  const messages =
    createAiChatMessages(
      initial.messages);
  const model =
    observable(
      { messages,
        promptDraft: initial.promptDraft ?? '',
        messagesScrollTop: initial.messagesScrollTop ?? 0,
        hasMessagesScrollTop: initial.hasMessagesScrollTop ?? false,
        missingKeyMessageShown: initial.missingKeyMessageShown ?? false,
        lastResponseId: initial.lastResponseId ?? null,
        choicePrompt:
          initialChoicePrompt === undefined
            ? null
            : { message: initialChoicePrompt.message,
                options:
                  initialChoicePrompt.options.map(
                    option =>
                      ({ value: option.value,
                         label: option.label })) },
        progress:
          initialProgress === undefined
            ? null
            : { message: initialProgress.message,
                visible: initialProgress.visible },
        sending: initial.sending === true }) as unknown as AiChatModel;

  internalChoiceStateByModel.set(
    model,
    { behavior:
        initialChoicePrompt?.behavior
        ?? 'resolve',
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
            model.messages.save(
              role,
              content);
          }),
      clearMessages:
        defineModelMethod(
          (): void =>
          {
            model.messages.clear();
            model.lastResponseId = null;
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

function createAiChatMessages(
    initialMessages: AiChatMessage[] | undefined
  ): AiChatMessages
{
  const list =
    observable(
      (initialMessages ?? [ ])
        .map(
          message =>
            ({ role: message.role,
               content: message.content }))) as unknown as ObservableArray<AiChatMessage>;

  return {
    list,
    read: () => list,
    save: (
        role: AiChatMessageRole,
        content: string
      ): void =>
      {
        list.push(
          { role,
            content });
      },
    clear: (): void => {
      list.splice(
        0,
        list.length);
    },
    toResponsesInput: () =>
      list
        .filter(
          message =>
            message.role === 'user'
            || message.role === 'assistant')
        .slice(-24)
        .map(
          message =>
            ({ role: message.role,
               content: message.content })),
  };
}

export function serializeAiChatModelState(
    model: AiChatModel
  ): AiChatSerializableState
{
  const choicePrompt =
    model.choicePrompt;
  const progress =
    model.progress;

  return {
    messages:
      model.messages.read().map(
        message =>
          ({ role: message.role,
             content: message.content })),
    promptDraft: model.promptDraft,
    messagesScrollTop: model.messagesScrollTop,
    hasMessagesScrollTop: model.hasMessagesScrollTop,
    missingKeyMessageShown: model.missingKeyMessageShown,
    lastResponseId: model.lastResponseId,
    choicePrompt:
      choicePrompt === null
        ? null
        : { message: choicePrompt.message,
            options:
              choicePrompt.options.map(
                option =>
                  ({ value: option.value,
                     label: option.label })),
            behavior:
              getInternalChoiceState(model).behavior },
    progress:
      progress === null
        ? null
        : { message: progress.message,
            visible: progress.visible },
    sending: model.sending,
  };
}

@customElement('asljs-ai-chat')
export class AiChat
  extends LitElement
{
  #bindings: { dispose: () => void; } | null = null;
  #model: AiChatModel = createAiChatModel();
  #persistState: () => void = () => {};
  #setupVersion = 0;
  #shouldRestoreMessagesScroll = false;
  #shouldScrollMessagesToBottom = false;

  @property({ attribute: false })
    accessor options: AiChatOptions | null = null;

  get messages(): AiChatMessages {
    return this.#model.messages;
  }
  set messages(value: AiChatMessages) {
    this.#setModelProperty(
      'messages',
      value);
  }

  get promptDraft(): string {
    return this.#model.promptDraft;
  }
  set promptDraft(value: string) {
    this.#setModelProperty(
      'promptDraft',
      value);
  }

  get messagesScrollTop(): number {
    return this.#model.messagesScrollTop;
  }
  set messagesScrollTop(value: number) {
    this.#setModelProperty(
      'messagesScrollTop',
      value);
  }

  get hasMessagesScrollTop(): boolean {
    return this.#model.hasMessagesScrollTop;
  }
  set hasMessagesScrollTop(value: boolean) {
    this.#setModelProperty(
      'hasMessagesScrollTop',
      value);
  }

  get missingKeyMessageShown(): boolean {
    return this.#model.missingKeyMessageShown;
  }
  set missingKeyMessageShown(value: boolean) {
    this.#setModelProperty(
      'missingKeyMessageShown',
      value);
  }

  get lastResponseId(): string | null {
    return this.#model.lastResponseId;
  }
  set lastResponseId(value: string | null) {
    this.#setModelProperty(
      'lastResponseId',
      value);
  }

  get choicePrompt(): AiChatChoicePrompt | null {
    return this.#model.choicePrompt;
  }
  set choicePrompt(value: AiChatChoicePrompt | null) {
    this.#setModelProperty(
      'choicePrompt',
      value);
  }

  get progress(): AiChatProgressState | null {
    return this.#model.progress;
  }
  set progress(value: AiChatProgressState | null) {
    this.#setModelProperty(
      'progress',
      value);
  }

  get sending(): boolean {
    return this.#model.sending;
  }
  set sending(value: boolean) {
    this.#setModelProperty(
      'sending',
      value);
  }

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
    if (changedProperties.has('options'))
    {
      void this.#bindComponent();
    }

    this.#syncMessagesScroll();
  }

  override render(): ReturnType<LitElement['render']> {
    const model =
      this.#model;
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
            ${model.messages.read().map(
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
                          .buttonClassName=${resolveAiChatButtonClassName(
                            this,
                            'asljs-ai-chat-button',
                            'asljs-ai-chat-choice-submit')}
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
              .buttonClassName=${resolveAiChatButtonClassName(
                this,
                'asljs-ai-chat-button',
                'asljs-ai-chat-send')}
              @click=${this.#handleSendClick}>
          </asljs-button>
        </div>
      </div>
    `;
  }

  async #bindComponent(): Promise<void> {
    const model =
      this.#model;
    const options =
      this.options;
    const stateStore =
      options?.stateStore
      ?? createSessionStorageStateStore(
        resolveAiChatSessionStorageKey(this));
    const version =
      ++this.#setupVersion;

    this.#disposeBindings();
    this.#persistState =
      createStatePersistenceScheduler(
        model,
        stateStore);

    if (stateStore) {
      applyLoadedState(
        model,
        await stateStore.load());

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

    if (!this.#model.hasMessagesScrollTop) {
      return;
    }

    messagesElement.scrollTop = this.#model.messagesScrollTop;
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

    this.#model.messagesScrollTop = messagesElement.scrollTop;
    this.#model.hasMessagesScrollTop = true;
    this.#persistState();
  };

  #handlePromptInput = (): void => {
    this.#model.promptDraft = this.#promptElement?.draftValue ?? '';
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
      getInternalChoiceState(this.#model);
    const behavior =
      internalState.behavior;

    dismissChoices(
      this.#model,
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
      this.#model;

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

    let transport =
      options.transport ?? null;

    if (transport === null) {
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

      transport = new OpenAiTransport(apiKey);
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
        chatModel);

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
            messages:
              model.messages,
            requestContext,
            chatModel });
      const result =
        await runWithTools(
          transport,
          chatModel,
          requestInput,
          options.getTools?.() ?? [ ],
          model,
          options.executeTool,
          options.getToolsContext
            ? await options.getToolsContext()
            : undefined,
          options.provider,
          options.toolStepExtension ?? defaultToolStepExtension,
          model.lastResponseId);

      const assistantText =
        result.text;

      model.appendMessage(
        'assistant',
        assistantText);
      model.lastResponseId = result.responseId;

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

  #setModelProperty<K extends keyof AiChatModel>(
      propertyName: K,
      value: AiChatModel[K]
    ): void
  {
    const model =
      this.#model;

    if (Object.is(model[propertyName], value)) {
      return;
    }

    model[propertyName] = value;
    this.requestUpdate();
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

function applyLoadedState(
    model: AiChatModel,
    loaded: Partial<AiChatSerializableState>
  ): void
{
  if (Array.isArray(loaded.messages)) {
    (model.messages.list as ObservableArray<AiChatMessage>).splice(
      0,
      model.messages.list.length,
      ...loaded.messages.map(
        message =>
          ({ role: message.role,
             content: message.content })));
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

  if (typeof loaded.lastResponseId === 'string') {
    model.lastResponseId = loaded.lastResponseId;
  } else if (loaded.lastResponseId === null) {
    model.lastResponseId = null;
  }

  if (loaded.choicePrompt === null) {
    dismissChoices(
      model,
      null);
  } else if (loaded.choicePrompt !== undefined) {
    const internalState =
      getInternalChoiceState(model);

    internalState.resolver = null;
    internalState.behavior = loaded.choicePrompt.behavior;
    model.choicePrompt =
      { message: loaded.choicePrompt.message,
        options:
          loaded.choicePrompt.options.map(
            option =>
              ({ value: option.value,
                 label: option.label })) };
  }

  if (loaded.progress === null) {
    model.progress = null;
  } else if (loaded.progress !== undefined) {
    model.progress =
      { message: loaded.progress.message,
        visible: loaded.progress.visible };
  }

  if (typeof loaded.sending === 'boolean') {
    model.sending = loaded.sending;
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

function resolveAiChatSessionStorageKey(
    component: AiChat
  ): string
{
  const path =
    typeof location !== 'undefined'
    && location !== null
    && typeof location.pathname === 'string'
      ? encodeURIComponent(location.pathname)
      : '';
  const id =
    component.id.trim() !== ''
      ? encodeURIComponent(component.id.trim())
      : `default-${resolveAiChatElementIndex(component)}`;

  return `asljs-ai-chat:${path}:${id}`;
}

function resolveAiChatElementIndex(
    component: AiChat
  ): number
{
  if (typeof document === 'undefined') {
    return 0;
  }

  const components =
    [ ...document.querySelectorAll('asljs-ai-chat') ];
  const index =
    components.indexOf(component);

  return index >= 0
    ? index
    : 0;
}

function createSessionStorageStateStore(
    storageKey: string
  ): AiChatStateStore | undefined
{
  if (typeof sessionStorage === 'undefined') {
    return undefined;
  }

  return {
    load: async (): Promise<Partial<AiChatSerializableState>> => {
      try {
        const raw =
          sessionStorage.getItem(storageKey);

        if (!raw || raw.trim() === '') {
          return { };
        }

        return normalizeSerializableState(
          JSON.parse(raw));
      } catch {
        return { };
      }
    },
    save: async (
        state: AiChatSerializableState
      ): Promise<void> => {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify(state));
    },
  };
}

function normalizeSerializableState(
    value: unknown
  ): Partial<AiChatSerializableState>
{
  if (!value || typeof value !== 'object') {
    return { };
  }

  const source =
    value as Record<string, unknown>;

  return {
    messages:
      Array.isArray(source.messages)
        ? source.messages
            .filter(
              message =>
                !!message
                && typeof message === 'object'
                && (
                  (message as { role?: unknown }).role === 'user'
                  || (message as { role?: unknown }).role === 'assistant'
                  || (message as { role?: unknown }).role === 'system')
                && typeof (message as { content?: unknown }).content === 'string')
            .map(
              message =>
                ({ role: (message as { role: AiChatMessageRole; }).role,
                   content: (message as { content: string; }).content }))
        : undefined,
    promptDraft:
      typeof source.promptDraft === 'string'
        ? source.promptDraft
        : undefined,
    messagesScrollTop:
      typeof source.messagesScrollTop === 'number'
        ? source.messagesScrollTop
        : undefined,
    hasMessagesScrollTop:
      typeof source.hasMessagesScrollTop === 'boolean'
        ? source.hasMessagesScrollTop
        : undefined,
    missingKeyMessageShown:
      typeof source.missingKeyMessageShown === 'boolean'
        ? source.missingKeyMessageShown
        : undefined,
    lastResponseId:
      typeof source.lastResponseId === 'string'
      || source.lastResponseId === null
        ? source.lastResponseId
        : undefined,
    choicePrompt:
      source.choicePrompt === null
        ? null
        : normalizeSerializableChoicePrompt(source.choicePrompt),
    progress:
      source.progress === null
        ? null
        : normalizeSerializableProgressState(source.progress),
    sending:
      typeof source.sending === 'boolean'
        ? source.sending
        : undefined,
  };
}

function normalizeSerializableChoicePrompt(
    value: unknown
  ): AiChatSerializableChoicePrompt | undefined
{
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const source =
    value as Record<string, unknown>;

  if (typeof source.message !== 'string'
      || !Array.isArray(source.options))
  {
    return undefined;
  }

  const behavior =
    source.behavior === 'resolve'
    || source.behavior === 'send'
      ? source.behavior
      : undefined;

  if (behavior === undefined) {
    return undefined;
  }

  const options =
    source.options
      .filter(
        option =>
          !!option
          && typeof option === 'object'
          && typeof (option as { value?: unknown; }).value === 'string'
          && typeof (option as { label?: unknown; }).label === 'string')
      .map(
        option =>
          ({ value: (option as { value: string; }).value,
             label: (option as { label: string; }).label }))
      .filter(
        option =>
          option.value.trim() !== ''
          && option.label.trim() !== '');

  return {
    message: source.message,
    options,
    behavior,
  };
}

function normalizeSerializableProgressState(
    value: unknown
  ): AiChatProgressState | undefined
{
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const source =
    value as Record<string, unknown>;

  if (typeof source.message !== 'string'
      || typeof source.visible !== 'boolean')
  {
    return undefined;
  }

  return {
    message: source.message,
    visible: source.visible,
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

  const bindMessagesArray =
    (): void => {
      const messages =
        model.messages.list as ObservableArray<AiChatMessage>;

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

  bindMessagesArray();

  disposers.push(
    model.on(
      'set:messages',
      () => {
        bindMessagesArray();
        renderMessages();
        persistState();
      }),
    model.on(
      'set:progress',
      () => {
        renderProgress();
        persistState();
      }),
    model.on(
      'set:choicePrompt',
      () => {
        renderChoices();
        persistState();
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
      'set:lastResponseId',
      () => {
        persistState();
      }),
    model.on(
      'set:sending',
      () => {
        syncSendingUi();
        persistState();
      }));

  return {
    dispose: (): void => {
      for (const dispose of messagesArrayDisposers) {
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
  ): AiChatBeforeSendContext<TRequestContext>
{
  const context =
    { model,
      prompt,
      requestContext,
      chatModel,
      apiKey: '',
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
    transport: AiChatTransport,
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
    toolStepExtension: number,
    previousResponseId: string | null
  ): Promise<
    { text: string;
      responseId: string | null; }
  >
{
  const requestBody: Record<string, unknown> =
    { model: chatModel,
      input,
      tools };

  if (previousResponseId) {
    requestBody.previous_response_id = previousResponseId;
  }

  let response =
    await transport.postRequest(requestBody);

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
      return {
        text: extractAssistantText(response),
        responseId:
          typeof response.id === 'string'
            ? response.id
            : null,
      };
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
      await transport.postRequest(
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

function resolveAiChatButtonClassName(
    component: AiChat,
    ...classNames: string[]
  ): string
{
  const themeClassName =
    resolveThemeText(
      findThemeProvider(component)?.theme?.button?.className,
      component)
    ?? resolveThemeText(
      getDefaultTheme().button?.className,
      component)
    ?? '';

  return [ themeClassName, ...classNames ]
    .flatMap(
      value => value.split(/\s+/u))
    .map(
      value => value.trim())
    .filter(
      (value, index, values) =>
        value !== ''
        && values.indexOf(value) === index)
    .join(' ');
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
