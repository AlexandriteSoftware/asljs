import { state } from './state.js';
import {
  createAiChatModel,
  OpenAiTransport,
  type AiChatModel,
  type AiChatKeySubmitDetail,
  type AiChatOptions,
} from 'asljs-components';
import {
  listApps,
  saveApp,
  deleteApp,
  listFiles,
  saveFile,
  deleteFile,
  replaceFiles,
  loadAppOpenAiApiKey,
  saveAppOpenAiApiKey,
} from './storage.js';
import {
  generateApp,
  listAvailableModels,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOOL_STEPS,
  GenerationStoppedError,
  type AiModel,
} from './ai/ai-repl.js';
import {
  GENERATION_SYSTEM_PROMPT,
} from './ai/ai-instruction.js';
import {
  CHAT_SYSTEM_PROMPT,
} from './ai/chat-instruction.js';
import {
  buildConversationPrompt,
  getConversationKickoffMessage,
} from './ai/conversation-loop.js';
import {
  renderPreview,
  evaluateInPreview,
  getPreviewDiagnostics,
} from './preview.js';
import {
  type AppRecord,
  type AppAuthor,
  type Settings,
} from './types.js';
import {
  createAppRuntimeTools,
  executeToolCall,
  OPENAI_TOOLS,
} from './ai/ai-tools.js';
import {
  DEFAULT_CHAT_MODEL,
  DEFAULT_CODE_MODEL,
  dedupeModels,
  type AvailableAiModel,
} from './ai/model-selection.js';
import {
  renderAppListUi,
} from './ui/app-list-ui.js';
import {
  type FileViewElement,
  renderFileSelectUi,
  renderFileContentUi,
} from './ui/file-editor-ui.js';
import {
  createAppBuilderAiChatSecretsAndSettingsProvider,
  createSessionStorageAiChatStateStore,
} from './ai-chat-storage.js';
import {
  togglePanelUi,
} from './ui/panel-collapse-ui.js';
import {
  buildSampleFiles,
  getSampleById,
  getSampleByName,
} from './examples/samples.js';
import {
  createDefaultWorkflowFiles,
  PLAN_FILE,
  CHANGE_FILE,
  ensureWorkflowFiles,
} from './workflow-files.js';
import {
  buildChangeListFromPlan,
  hasPendingPlanChanges,
} from './generation-workflow.js';
import {
  createLinkSharingService,
  createBrowserTextCompressionCodec,
  type LinkSharingService,
} from './services/link-sharing.js';
import {
  buildExportPayload as buildExportPayloadModel,
  parseImportedPayloadText,
  createImportPlan,
  type ExportPayload,
  type ImportedPayload,
} from './services/export-import.js';
import {
  minifySharePayload,
  type SharePayloadMinifyLoader,
} from './services/share-payload-minify.js';
import {
  buildShareStatusMessage,
  shouldExcludeNonApplicationFileFromShare,
} from './services/share-ui.js';
import {
  renderAppBuilderShell,
} from './ui/app-shell-ui.js';
import {
  createFirstApplicationDialogUi,
} from './ui/first-application-dialog-ui.js';
import {
  createNameModalUi,
} from './ui/name-modal-ui.js';
import {
  createProjectSettingsModalUi,
} from './ui/project-settings-modal-ui.js';
import {
  createSettingsModalUi,
} from './ui/settings-modal-ui.js';
import {
  createShareModalUi,
} from './ui/share-modal-ui.js';
import {
  configureButton,
  configureSelect,
  mustElement,
  readControlValue,
  setButtonContent,
  writeControlValue,
  type AppBuilderButtonElement,
  type AppBuilderSelectElement,
} from './ui/control-ui.js';
import * as esbuildWasm
  from 'esbuild-wasm';
import esbuildWasmUrl
  from 'esbuild-wasm/esbuild.wasm?url';

renderAppBuilderShell();

function randomId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

type AppBuilderAiChatElement =
  HTMLElement
  & {
    options: AiChatOptions<{ currentAppId: string | null }> | null;
  };

type AppBuilderAiChatKeyElement =
  HTMLElement
  & {
    label: string;
    submitLabel: string;
  };

type MobileWorkspaceTab =
  'chat'
  | 'files'
  | 'run';

const elAppWorkspace = mustElement<HTMLElement>('app-workspace');
const elPanels = mustElement<HTMLElement>('panels');
const elPanelChat = mustElement<HTMLElement>('panel-chat');
const elPanelEditor = mustElement<HTMLElement>('panel-editor');
const elAppSelect = mustElement<AppBuilderSelectElement>('app-select');
const elFileSelect = mustElement<AppBuilderSelectElement>('file-select');
const elFileView = mustElement<FileViewElement>('file-view');
const elChatRoot = mustElement<HTMLElement>('chat-root');
const elChatModelSelect = mustElement<AppBuilderSelectElement>('chat-model-select');
const elBtnRun = mustElement<AppBuilderButtonElement>('btn-run');
const elPreviewFrame = mustElement<HTMLIFrameElement>('preview-frame');
const elPreviewTitle = mustElement<HTMLElement>('panel-preview-title');
const elGenerationModelSelect = mustElement<AppBuilderSelectElement>('generation-model-select');
const elBtnStartGeneration = mustElement<AppBuilderButtonElement>('btn-start-generation');
const elBtnStopGeneration = mustElement<AppBuilderButtonElement>('btn-stop-generation');
const elGenerationStatus = mustElement<HTMLElement>('generation-status');
const elBtnNewApp = mustElement<AppBuilderButtonElement>('btn-new-app');
const elBtnImport = mustElement<AppBuilderButtonElement>('btn-import');
const elBtnProjectSettings = mustElement<AppBuilderButtonElement>('btn-project-settings');
const elBtnShare = mustElement<AppBuilderButtonElement>('btn-share');
const elBtnSettings = mustElement<AppBuilderButtonElement>('btn-settings');
const elBtnToggleChat = mustElement<AppBuilderButtonElement>('btn-toggle-chat');
const elBtnToggleFiles = mustElement<AppBuilderButtonElement>('btn-toggle-files');
const elMobileTabBar = mustElement<HTMLElement>('mobile-tab-bar');
const elMobileTabChat = mustElement<AppBuilderButtonElement>('mobile-tab-chat');
const elMobileTabFiles = mustElement<AppBuilderButtonElement>('mobile-tab-files');
const elMobileTabRun = mustElement<AppBuilderButtonElement>('mobile-tab-run');

const elImportFile = mustElement<HTMLInputElement>('import-file');

const SETTINGS_KEY = 'asljs-app-builder-settings';
const DEFAULT_THEME = 'light';
const DEFAULT_FONT_SIZE = 14;
const APP_ACTION_NEW = '__new__';
const APP_ACTION_IMPORT = '__import__';
const IMPORT_HASH_PREFIX = '#I!';
const SHARE_MAX_URL_LENGTH = 5000;
const SHARE_PRACTICAL_URL_LENGTH = 4000;
const SHARE_PREPARE_TIMEOUT_MS = 10000;
const SHARE_BASE_URL =
  'https://alexandritesoftware.github.io/asljs/app-builder';

let linkSharingService: LinkSharingService | null = null;
let importFromHashInProgress = false;
let sharePreparationId = 0;
let browserEsbuildApiPromise: Promise<BrowserEsbuildApi> | null = null;
let availableModels: AvailableAiModel[] = [
  { id: DEFAULT_CHAT_MODEL },
  { id: DEFAULT_CODE_MODEL },
  { id: DEFAULT_MODEL },
];
let generationStopRequested = false;
let currentAppOpenAiApiKey = '';
let currentAiChatModel: AiChatModel | null = null;

configureShellControls();
setMobileWorkspaceTab('chat');

const firstApplicationDialog =
  createFirstApplicationDialogUi({
    onCreateApplication: createFirstApp,
    onCreateTodoSample: createTodoSampleApp,
  });
const nameModal = createNameModalUi();
const projectSettingsModal =
  createProjectSettingsModalUi({
    onSave: saveProjectSettings,
    onDelete: confirmDeleteApp,
  });
const settingsModal =
  createSettingsModalUi({
    loadValues: async () => ({
      apiKey: await refreshCurrentAppOpenAiApiKey(),
      theme: getTheme(),
      fontSize: getFontSize(),
      maxToolSteps: getMaxToolSteps(),
    }),
    onSave: saveSettingsFromModal,
  });
const shareModal =
  createShareModalUi({
    canOpen: () => getCurrentApp() !== undefined,
    readAppName: () => getCurrentApp()?.name ?? 'Shared app',
    prepareLink: prepareShareLink,
    downloadExport: downloadShareExport,
  });

type BrowserEsbuildApi =
  { transform: (
      source: string,
      options:
        { loader: SharePayloadMinifyLoader;
          minify: boolean;
          target: string; }
    ) => Promise<{ code: string; }>; };

function configureShellControls(): void {
  configureButton(elBtnSettings, {
    className: 'btn btn-outline-secondary btn-sm',
  });
  configureButton(elBtnNewApp, {
    text: 'New',
    icon: '<i class="bi bi-plus-lg"></i>',
    className: 'btn btn-outline-secondary btn-sm',
  });
  configureButton(elBtnImport, {
    text: 'Import',
    className: 'btn btn-outline-secondary btn-sm',
  });
  configureButton(elBtnProjectSettings, {
    className: 'btn btn-outline-secondary btn-sm',
  });
  configureButton(elBtnToggleChat, {
    text: 'Chat',
    icon: '<i class="bi bi-chevron-down"></i>',
    className: 'btn btn-outline-secondary btn-sm',
  });
  configureButton(elBtnToggleFiles, {
    text: 'Files',
    icon: '<i class="bi bi-chevron-down"></i>',
    className: 'btn btn-outline-secondary btn-sm',
  });
  configureButton(elBtnRun, {
    text: 'Run',
    icon: '<i class="bi bi-play-fill"></i>',
    className: 'btn btn-success btn-sm',
  });
  configureButton(elMobileTabChat, {
    text: 'Chat',
    icon: '<i class="bi bi-chat-dots"></i>',
    className: 'btn btn-outline-secondary flex-fill',
  });
  configureButton(elMobileTabFiles, {
    text: 'Files',
    icon: '<i class="bi bi-folder2-open"></i>',
    className: 'btn btn-outline-secondary flex-fill',
  });
  configureButton(elMobileTabRun, {
    text: 'Run',
    icon: '<i class="bi bi-play-fill"></i>',
    className: 'btn btn-outline-secondary flex-fill',
  });
  configureButton(elBtnShare, {
    text: 'Share',
    className: 'btn btn-outline-secondary btn-sm',
  });
  configureButton(elBtnStartGeneration, {
    text: 'Generate',
    className: 'btn btn-primary btn-sm',
  });
  configureButton(elBtnStopGeneration, {
    text: 'Stop',
    className: 'btn btn-outline-secondary btn-sm',
  });

  configureSelect(elAppSelect, {
    className: 'form-select form-select-sm bootstrap-select app-select',
  });
  configureSelect(elFileSelect, {
    className: 'form-select form-select-sm bootstrap-select file-select',
  });
  configureSelect(elChatModelSelect, {
    className: 'form-select form-select-sm bootstrap-select lane-model-select',
  });
  configureSelect(elGenerationModelSelect, {
    className: 'form-select form-select-sm bootstrap-select lane-model-select',
  });
}

function isMobileViewport(): boolean {
  return window.getComputedStyle(elMobileTabBar).display !== 'none';
}

function setMobileWorkspaceTab(tab: MobileWorkspaceTab): void {
  elPanels.classList.remove('mobile-tab-chat', 'mobile-tab-files', 'mobile-tab-run');
  elPanels.classList.add(`mobile-tab-${tab}`);

  const tabs: {
    tab: MobileWorkspaceTab;
    button: AppBuilderButtonElement;
  }[] = [
    { tab: 'chat', button: elMobileTabChat },
    { tab: 'files', button: elMobileTabFiles },
    { tab: 'run', button: elMobileTabRun },
  ];

  for (const item of tabs) {
    const active = item.tab === tab;
    item.button.buttonClassName = active
      ? 'btn btn-primary flex-fill'
      : 'btn btn-outline-secondary flex-fill';
    item.button.setAttribute('aria-selected', String(active));
  }
}

function renderPreviewTitle(): void {
  elPreviewTitle.textContent = getCurrentApp()?.name ?? 'Preview';
}

function getLinkSharingService(): LinkSharingService {
  linkSharingService =
    linkSharingService
    ?? createLinkSharingService(
      {
        codec: createBrowserTextCompressionCodec(),
        baseUrl: SHARE_BASE_URL,
        hashPrefix: IMPORT_HASH_PREFIX,
        maxUrlLength: SHARE_MAX_URL_LENGTH,
      });

  return linkSharingService;
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY) ?? '{}';
    return JSON.parse(raw) as Settings;
  } catch {
    return {};
  }
}

function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

async function refreshCurrentAppOpenAiApiKey(): Promise<string> {
  if (state.currentAppId === null) {
    currentAppOpenAiApiKey = '';
    return currentAppOpenAiApiKey;
  }

  currentAppOpenAiApiKey =
    await loadAppOpenAiApiKey(state.currentAppId);

  return currentAppOpenAiApiKey;
}

function getCurrentAppOpenAiApiKey(): string {
  return currentAppOpenAiApiKey;
}

function getChatModel(): AiModel {
  return pickSavedOrDefaultModel(
    loadSettings().chatModel,
    DEFAULT_CHAT_MODEL,
  );
}

function getCodeGenerationModel(): AiModel {
  return pickSavedOrDefaultModel(
    loadSettings().generationModel,
    DEFAULT_CODE_MODEL,
  );
}

function getMaxToolSteps(): number {
  const candidate = loadSettings().maxToolSteps;

  if (!Number.isFinite(candidate)) {
    return DEFAULT_MAX_TOOL_STEPS;
  }

  const normalized = Math.floor(candidate as number);

  if (normalized < 1) {
    return DEFAULT_MAX_TOOL_STEPS;
  }

  return normalized;
}

function getTheme(): 'dark' | 'light' {
  const candidate = loadSettings().theme;

  return candidate === 'light'
    ? 'light'
    : DEFAULT_THEME;
}

function getFontSize(): number {
  const candidate = loadSettings().fontSize;

  if (!Number.isFinite(candidate)) {
    return DEFAULT_FONT_SIZE;
  }

  const normalized = Math.floor(candidate as number);

  if (normalized < 12 || normalized > 20) {
    return DEFAULT_FONT_SIZE;
  }

  return normalized;
}

function applyAppearanceSettings(): void {
  document.documentElement.setAttribute('data-bs-theme', getTheme());
  document.documentElement.style.fontSize = `${getFontSize()}px`;
}

function normalizeExistingUuid(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized === ''
    ? null
    : normalized;
}

function createAppUuid(): string {
  return crypto.randomUUID();
}

async function ensureAppsHaveUniqueUuids(
    apps: AppRecord[]
  ): Promise<AppRecord[]>
{
  const used = new Set<string>();
  const normalized: AppRecord[] = [];

  for (const app of apps) {
    let uuid = normalizeExistingUuid((app as { uuid?: unknown }).uuid);

    if (uuid === null || used.has(uuid)) {
      uuid = createAppUuid();
    }

    used.add(uuid);

    if ((app as { uuid?: unknown }).uuid === uuid) {
      normalized.push(app);
      continue;
    }

    const updated: AppRecord = {
      ...app,
      uuid,
      updatedAt: app.updatedAt ?? now(),
    };

    await saveApp(updated);
    normalized.push(updated);
  }

  return normalized;
}

function getCurrentApp(): AppRecord | undefined {
  return state.apps.find(item => item.id === state.currentAppId);
}

async function saveAppAndReplaceInState(app: AppRecord): Promise<void> {
  await saveApp(app);
  state.apps =
    state.apps.map(item => (
      item.id === app.id
        ? app
        : item));
}

async function regenerateCurrentAppUuidForFileChange(): Promise<void> {
  const app = getCurrentApp();

  if (app === undefined) {
    return;
  }

  const updated: AppRecord = {
    ...app,
    uuid: createAppUuid(),
    updatedAt: now(),
  };

  await saveAppAndReplaceInState(updated);
}

declare global {
  interface Window {
    listFileset: () => Promise<string[]>;
    listFilesByMask: (mask: string, maxFiles?: number) => Promise<string[]>;
    readFile: (path: string) => Promise<string>;
    readFiles: (paths: string[], maxCharsPerFile?: number) => Promise<Record<string, string>>;
    readFilesByMask: (
      mask: string,
      maxFiles?: number,
      maxCharsPerFile?: number,
    ) => Promise<Record<string, string>>;
    readFileData: (path: string) => Promise<
      { mimeType: string;
        base64: string;
        dataUrl: string; } | null>;
    setFilesContent: (
      files: Array<{ path: string; content: string }>,
    ) => Promise<void>;
    setFileData: (
      path: string,
      mimeType: string,
      base64: string,
    ) => Promise<void>;
    setFileContent: (path: string, content: string) => Promise<void>;
    replaceFilePart: (
      path: string,
      search: string,
      replacement: string,
      replaceAll?: boolean,
    ) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
    grep: (
      mask: string,
      pattern: string,
      flags?: string,
      maxMatches?: number,
    ) => Promise<Array<{ path: string; line: number; text: string }>>;
    choose: (question: string, options: string[]) => Promise<void>;
    evalInApp: (code: string) => Promise<unknown>;
    assertInApp: (code: string, message?: string) => Promise<unknown>;
    runAppTests: (path?: string) => Promise<unknown>;
    getAppDiagnostics: () => Promise<unknown>;
    runAppAndCollectDiagnostics: () => Promise<unknown>;
  }
}

const appRuntimeTools =
  createAppRuntimeTools({
    getCurrentAppId: () => state.currentAppId,
    getFiles: () => state.files,
    setFiles: files => {
      state.files = files;
    },
    getActiveFileName: () => state.activeFileName,
    setActiveFileName: fileName => {
      state.activeFileName = fileName;
    },
    createFileId: randomId,
    saveFile: async file => {
      await saveFile(file);
      await regenerateCurrentAppUuidForFileChange();
    },
    deleteFileById: async id => {
      await deleteFile(id);
      await regenerateCurrentAppUuidForFileChange();
    },
    runApp: handleRun,
    evaluateInApp: code => evaluateInPreview(elPreviewFrame, code),
    getAppDiagnostics: () => getPreviewDiagnostics(elPreviewFrame),
    showChoicePrompt: showChoicePrompt,
    wait: milliseconds =>
      new Promise(resolve => {
        window.setTimeout(resolve, milliseconds);
      }),
  });

function renderAppList(): void {
  renderAppListUi({
    selectElement: elAppSelect,
    apps: state.apps,
    currentAppId: state.currentAppId,
    newActionValue: APP_ACTION_NEW,
    importActionValue: APP_ACTION_IMPORT,
  });
}

function renderWorkspace(): void {
  elAppWorkspace.classList.remove('hidden');

  const hasApp =
    state.currentAppId !== null
    && state.apps.some(item => item.id === state.currentAppId);

  elPanels.classList.toggle('hidden', !hasApp);

  if (!hasApp) {
    firstApplicationDialog.show();
    return;
  }

  firstApplicationDialog.hide();

  renderFileSelect();
  renderFileContent();
  renderPreviewTitle();
}

async function createFirstApp(
    values: {
      name: string;
      apiKey: string;
    }
  ): Promise<void>
{
  const app: AppRecord = {
    id: randomId(),
    uuid: createAppUuid(),
    name: values.name,
    createdAt: now(),
    updatedAt: now(),
  };

  await saveApp(app);
  if (values.apiKey !== '') {
    await saveAppOpenAiApiKey(app.id, values.apiKey);
  }
  await replaceFiles(app.id, createDefaultWorkflowFiles(app.id, app.name, randomId));
  state.apps = [...state.apps, app];
  await openApp(app.id);
}

async function createTodoSampleApp(
    values: {
      name: string;
      apiKey: string;
    }
  ): Promise<void>
{
  const sample = getSampleByName('TODO Sample');

  if (sample === null) {
    alert('TODO sample is not available.');
    return;
  }

  const name = values.name === ''
    ? sample.name
    : values.name;

  const app: AppRecord = {
    id: randomId(),
    uuid: createAppUuid(),
    name,
    author: sample.author,
    createdAt: now(),
    updatedAt: now(),
  };

  const files = buildSampleFiles(sample, app.id, randomId);

  await saveApp(app);
  if (values.apiKey !== '') {
    await saveAppOpenAiApiKey(app.id, values.apiKey);
  }
  await replaceFiles(app.id, files);

  state.apps = [...state.apps, app];
  await openApp(app.id);
}

function renderFileSelect(): void {
  renderFileSelectUi({
    selectElement: elFileSelect,
    files: state.files,
    activeFileName: state.activeFileName,
  });
}

function renderFileContent(): void {
  renderFileContentUi({
    fileElement: elFileView,
    files: state.files,
    activeFileName: state.activeFileName,
    onSaveText: async (fileName, text) => {
      const file =
        state.files.find(item => item.name === fileName);

      if (file === undefined || file.content === text) {
        return;
      }

      file.content = text;
      await saveFile(file);
      await regenerateCurrentAppUuidForFileChange();
    },
  });
}

function setGenerating(value: boolean): void {
  state.generating = value;
  elBtnStartGeneration.disabled = value || state.generationBusy;
}

function setGenerationBusy(value: boolean): void {
  state.generationBusy = value;
  elBtnStartGeneration.disabled = value || state.generating;
  elBtnStopGeneration.disabled = !value;
}

function setGenerationStatus(message: string): void {
  state.generationStatus = message;
  elGenerationStatus.textContent = message;
}

function appendChatMessage(role: 'user' | 'assistant', text: string): void {
  currentAiChatModel?.appendMessage(role, text);
  syncStateChatMessagesFromAiChatModel();
}

function clearChoicePrompt(): void {
  currentAiChatModel?.dismissChoices();
}

function showChoicePrompt(question: string, options: string[]): void {
  if (currentAiChatModel === null) {
    return;
  }

  void currentAiChatModel.presentChoices(
    question,
    options,
    'send');
}

function resetChatConversation(): void {
  currentAiChatModel?.clearMessages();
  currentAiChatModel?.dismissChoices();
  currentAiChatModel?.clearProgress();
  syncStateChatMessagesFromAiChatModel();
}

function syncStateChatMessagesFromAiChatModel(): void {
  state.chatMessages =
    currentAiChatModel === null
      ? [ ]
      : currentAiChatModel.messages
        .read()
        .filter(
            isUserOrAssistantMessage)
          .map(
            message =>
              ({ role: message.role,
                 text: message.content }));
}

function isUserOrAssistantMessage(
    message: { role: string; }
  ): message is {
    role: 'user' | 'assistant';
    content: string;
  }
{
  return message.role === 'user'
    || message.role === 'assistant';
}

async function mountAiChatForCurrentApp(): Promise<void> {
  if (state.currentAppId === null) {
    currentAiChatModel = null;
    elChatRoot.replaceChildren();
    state.chatMessages = [ ];
    return;
  }

  const appId =
    state.currentAppId;

  const model =
    createAiChatModel();

  currentAiChatModel = model;

  const buildChatOptions =
    (transport: OpenAiTransport | null): AiChatOptions<{ currentAppId: string | null }> => (
      { provider:
          createAppBuilderAiChatSecretsAndSettingsProvider(
            { appId,
              readChatModel: getChatModel,
              readInitialToolStepLimit: getMaxToolSteps }),
        ...(transport !== null
          ? { transport }
          : {}),
        stateStore:
          createSessionStorageAiChatStateStore(appId),
        getRequestContext: () => ({
          currentAppId: state.currentAppId,
        }),
        buildRequestInput: ({ model: chatModel }: { model: AiChatModel; }) => {
          const transcript =
            buildConversationPrompt(
              chatModel.messages
                .read()
                .filter(
                  isUserOrAssistantMessage)
                .map(
                  (message: { role: 'user' | 'assistant'; content: string; }) =>
                    ({ role: message.role,
                       text: message.content })));

          return [
            { role: 'system',
              content: CHAT_SYSTEM_PROMPT },
            { role: 'user',
              content: transcript },
          ];
        },
        getTools: () => OPENAI_TOOLS,
        executeTool: async (
            name: string,
            argumentsJson: string
          ): Promise<string> =>
          executeToolCall(
            { type: 'function_call',
              name,
              arguments: argumentsJson,
              call_id: `app-chat:${name}` },
            appRuntimeTools),
      });

  const apiKey =
    (await loadAppOpenAiApiKey(appId)).trim();

  const component =
    document.createElement('asljs-ai-chat') as AppBuilderAiChatElement;

  if (apiKey !== '') {
    component.options = buildChatOptions(new OpenAiTransport(apiKey));
    elChatRoot.replaceChildren(component);
  } else {
    component.options = buildChatOptions(null);

    const keyPrompt =
      document.createElement('asljs-ai-chat-key') as AppBuilderAiChatKeyElement;

    keyPrompt.label = 'Enter your OpenAI API key to start chatting';
    keyPrompt.submitLabel = 'Start chatting';

    keyPrompt.addEventListener(
      'key-submit',
      (event: Event) => {
        const detail =
          (event as CustomEvent<AiChatKeySubmitDetail>).detail;
        const submittedKey =
          detail.key.trim();

        if (submittedKey === '') {
          return;
        }

        void saveAppOpenAiApiKey(appId, submittedKey)
          .then(() => {
            currentAppOpenAiApiKey = submittedKey;
            component.options =
              buildChatOptions(new OpenAiTransport(submittedKey));
            keyPrompt.remove();
          });
      });

    const container =
      document.createElement('div');

    container.className = 'chat-key-container';
    container.appendChild(keyPrompt);
    container.appendChild(component);

    elChatRoot.replaceChildren(container);
  }

  syncStateChatMessagesFromAiChatModel();
}

async function persistCurrentFile(): Promise<void> {
  if (state.activeFileName === null || state.currentAppId === null) {
    return;
  }

  const file = state.files.find(item => item.name === state.activeFileName);

  if (file === undefined) {
    return;
  }

  const textArea =
    elFileView.querySelector('textarea');

  if (!(textArea instanceof HTMLTextAreaElement)) {
    return;
  }

  const newContent = textArea.value;

  if (file.content === newContent) {
    return;
  }

  file.content = newContent;
  await saveFile(file);
  await regenerateCurrentAppUuidForFileChange();
}

async function openApp(id: string): Promise<void> {
  state.currentAppId = id;

  const files = await listFiles(id);
  const app = state.apps.find(item => item.id === id);
  const ensured = ensureWorkflowFiles({
    files,
    appId: id,
    appName: app?.name ?? 'Untitled App',
    createId: randomId,
  });

  if (ensured.changed) {
    await replaceFiles(id, ensured.files);
  }

  state.files = ensured.files;
  state.activeFileName = pickFirstFileName(ensured.files);
  await refreshCurrentAppOpenAiApiKey();
  await refreshAvailableModels();
  await mountAiChatForCurrentApp();
}

function pickFirstFileName(
    files: Array<{ name: string }>
  ): string | null
{
  return files[0]?.name ?? null;
}

function promptNewApp(): void {
  nameModal.open({
    title: 'New App',
    initialValue: '',
    selectText: false,
    onConfirm: async (name: string) => {
      const app: AppRecord = {
        id: randomId(),
        uuid: createAppUuid(),
        name,
        createdAt: now(),
        updatedAt: now(),
      };

      await saveApp(app);
      await replaceFiles(app.id, createDefaultWorkflowFiles(app.id, app.name, randomId));
      state.apps = [...state.apps, app];
      await openApp(app.id);
    },
  });
}

function promptRenameApp(): void {
  const app = state.apps.find(item => item.id === state.currentAppId);

  if (app === undefined) {
    return;
  }

  nameModal.open({
    title: 'Rename App',
    initialValue: app.name,
    selectText: true,
    onConfirm: async (name: string) => {
      const updated: AppRecord = {
        ...app,
        name,
        updatedAt: now(),
      };

      await saveApp(updated);
      state.apps =
        state.apps.map(item => (
          item.id === app.id
            ? updated
            : item));
    },
  });
}

function openProjectSettings(): void {
  const app = state.apps.find(item => item.id === state.currentAppId);

  if (app === undefined) {
    return;
  }

  projectSettingsModal.open({
    name: app.name,
    authorName: app.author?.name ?? '',
    authorEmail: app.author?.email ?? '',
  });
}

async function saveProjectSettings(
    values: {
      name: string;
      authorName: string;
      authorEmail: string;
    }
  ): Promise<void>
{
  const app = state.apps.find(item => item.id === state.currentAppId);

  if (app === undefined) {
    return;
  }

  const author: AppAuthor | undefined =
    values.authorName !== '' || values.authorEmail !== ''
      ? {
        ...(values.authorName !== ''
          ? { name: values.authorName }
          : {}),
        ...(values.authorEmail !== ''
          ? { email: values.authorEmail }
          : {}),
      }
      : undefined;

  const updated: AppRecord = {
    ...app,
    name: values.name,
    author,
    updatedAt: now(),
  };

  await saveApp(updated);
  state.apps =
    state.apps.map(item => (
      item.id === app.id
        ? updated
        : item));
}

async function confirmDeleteApp(): Promise<void> {
  const app = state.apps.find(item => item.id === state.currentAppId);

  if (app === undefined) {
    return;
  }

  if (!confirm(`Delete "${app.name}"? This cannot be undone.`)) {
    return;
  }

  await deleteApp(app.id);
  state.apps = state.apps.filter(item => item.id !== app.id);
  state.currentAppId = null;
  state.files = [];
  state.activeFileName = null;
  resetChatConversation();
  elPreviewFrame.src = 'about:blank';
}

async function handleStartGeneration(): Promise<void> {
  if (state.generating) {
    setGenerationStatus('Wait for the chat response before starting generation.');
    return;
  }

  if (state.generationBusy) {
    return;
  }

  if (state.currentAppId === null) {
    setGenerationStatus('Open or create an app first.');
    return;
  }

  const apiKey = getCurrentAppOpenAiApiKey();

  if (apiKey === '') {
    setGenerationStatus('Add an OpenAI API key in Settings first.');
    return;
  }

  await persistCurrentFile();

  const planContent = readCurrentFileContent(PLAN_FILE);

  if (!hasPendingPlanChanges(planContent)) {
    setGenerationStatus('No pending changes in PLAN.md.');
    return;
  }

  const changeContent = buildChangeListFromPlan(planContent);
  await writeCurrentFileContent(CHANGE_FILE, changeContent);

  generationStopRequested = false;
  setGenerationBusy(true);
  setGenerationStatus('Starting generation cycle...');

  try {
    const result = await generateApp(
      [
        'Implement the pending changes listed in CHANGE.md.',
        'Use README.md as the current implemented app state.',
        'Work through CHANGE.md, update app files, update README.md, and clear CHANGE.md when the cycle is complete.',
        'Do not consume new changes that may later appear in PLAN.md during this cycle.',
      ].join('\n'),
      apiKey,
      getCodeGenerationModel(),
      appRuntimeTools,
      {
        initialToolStepLimit: getMaxToolSteps(),
        systemPrompt: GENERATION_SYSTEM_PROMPT,
        shouldStop: () => generationStopRequested,
        onToolStepLimit: async ({ stepsCompleted }) => confirm(
          `Generation reached ${stepsCompleted} tool steps without finishing. Continue for 12 more steps?`,
        ),
        onProgress: message => {
          setGenerationStatus(message);
        },
      },
    );

    await writeCurrentFileContent(CHANGE_FILE, '# CHANGE\n');
    setGenerationStatus(result.summary);
    appendChatMessage('assistant', result.summary);
    handleRun();
  } catch (error) {
    if (error instanceof GenerationStoppedError) {
      setGenerationStatus('Generation stopped.');
      return;
    }

    const message = error instanceof Error
      ? error.message
      : String(error);
    setGenerationStatus(`Generation error: ${message}`);
    appendChatMessage('assistant', `Generation error: ${message}`);
  } finally {
    generationStopRequested = false;
    setGenerationBusy(false);
  }
}

function handleStopGeneration(): void {
  if (!state.generationBusy) {
    return;
  }

  generationStopRequested = true;
  setGenerationStatus('Stopping generation after the current step...');
}

function handleRun(): void {
  if (isMobileViewport()) {
    setMobileWorkspaceTab('run');
  }
  void persistCurrentFile().then(() => {
    renderPreview(elPreviewFrame, state.files, {
      hostOpenAiApiKey: getCurrentAppOpenAiApiKey(),
    });
  });
}

async function buildExportPayload(): Promise<ExportPayload> {
  await persistCurrentFile();

  const app = getCurrentApp();

  if (app === undefined) {
    throw new Error('No app selected.');
  }

  return buildExportPayloadModel(
    {
      app,
      files: state.files,
    });
}

function downloadExportPayload(payload: ExportPayload): void {
  const blob = new Blob([JSON.stringify(payload)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${payload.name.replace(/\s+/g, '-')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function buildSharePayload(
    options: {
      minified: boolean;
      excludeNonApplicationFiles: boolean;
    }
  ): Promise<ExportPayload>
{
  let payload =
    await buildExportPayload();

  if (options.excludeNonApplicationFiles) {
    payload = {
      ...payload,
      files: Object.fromEntries(
        Object.entries(payload.files)
          .filter(([fileName]) => !shouldExcludeNonApplicationFileFromShare(fileName)),
      ),
    };
  }

  if (!options.minified) {
    return payload;
  }

  return minifySharePayload(payload, transformWithBrowserEsbuild);
}

async function transformWithBrowserEsbuild(
    source: string,
    loader: SharePayloadMinifyLoader,
  ): Promise<string>
{
  const esbuildApi =
    await getBrowserEsbuildApi();
  const result =
    await esbuildApi.transform(
      source,
      {
        loader,
        minify: true,
        target: 'es2020',
      });

  return result.code.trim();
}

async function getBrowserEsbuildApi(): Promise<BrowserEsbuildApi> {
  if (browserEsbuildApiPromise !== null) {
    return browserEsbuildApiPromise;
  }

  browserEsbuildApiPromise =
    (async () => {
      await esbuildWasm.initialize({ wasmURL: esbuildWasmUrl, worker: true });

      return {
        transform: esbuildWasm.transform,
      };
    })();

  return browserEsbuildApiPromise;
}

function formatImportAuthor(author: ImportedPayload['author']): string {
  const name = author?.name?.trim() ?? '';
  const email = author?.email?.trim() ?? '';

  const displayName = name === ''
    ? 'Not provided'
    : name;
  const displayEmail = email === ''
    ? 'Not provided'
    : email;

  return `Author: ${displayName}\nEmail: ${displayEmail}`;
}

function confirmImportSafetyNotice(payload: ImportedPayload): boolean {
  return confirm(
    'Security warning: You are about to import an application.\n\n'
    + `${formatImportAuthor(payload.author)}\n\n`
    + 'Although apps run in an isolated browser context, imported code can still be harmful. '
    + 'Be vigilant and only open apps from sources you trust.\n\n'
    + 'Do you want to continue?',
  );
}

function setWorkspaceMode(mode: 'edit' | 'run'): void {
  const collapsed = mode === 'run';

  elPanels.classList.toggle('chat-collapsed', collapsed);
  elPanels.classList.toggle('files-collapsed', collapsed);

  setButtonContent(elBtnToggleChat, {
    text: 'Chat',
    icon: collapsed
      ? '<i class="bi bi-chevron-right"></i>'
      : '<i class="bi bi-chevron-down"></i>',
  });

  setButtonContent(elBtnToggleFiles, {
    text: 'Files',
    icon: collapsed
      ? '<i class="bi bi-chevron-right"></i>'
      : '<i class="bi bi-chevron-down"></i>',
  });

  elBtnToggleChat.setAttribute('aria-expanded', String(!collapsed));
  elBtnToggleFiles.setAttribute('aria-expanded', String(!collapsed));

  if (isMobileViewport()) {
    if (mode === 'run') {
      setMobileWorkspaceTab('run');
    } else {
      setMobileWorkspaceTab('chat');
    }
  }
}

function askPostLinkImportMode(): 'edit' | 'run' {
  const run = confirm(
    'You followed the application link.\n\n'
    + 'Click OK to start the application.\n'
    + 'Click Cancel to edit it.',
  );

  return run
    ? 'run'
    : 'edit';
}

function handleImportClick(): void {
  elImportFile.value = '';
  elImportFile.click();
}

type ImportPayloadOptions =
  { navigateToExistingById: boolean;
    showDuplicateAlert: boolean; };

async function importPayload(
    payload: ImportedPayload,
    options: ImportPayloadOptions,
  ): Promise<string | null>
{
  const plan =
    createImportPlan(
      {
        payload,
        existingApps: state.apps,
        navigateToExistingById: options.navigateToExistingById,
        now: now(),
        createId: randomId,
        createUuid: createAppUuid,
      });

  if (plan.kind === 'duplicate') {
    if (options.showDuplicateAlert) {
      alert('Import stopped: an app with the same ID already exists.');
    }

    return null;
  }

  if (plan.kind === 'existing') {
    await openApp(plan.appId);
    return plan.appId;
  }

  await saveApp(plan.app);
  await replaceFiles(plan.app.id, plan.files);

  state.apps = [ ...state.apps, plan.app ];
  await openApp(plan.app.id);

  return plan.app.id;
}

async function handleImportFile(): Promise<void> {
  const file = elImportFile.files?.[0];

  if (file === undefined) {
    return;
  }

  try {
    const text = await file.text();
    const payload = parseImportedPayloadText(text);

    if (!confirmImportSafetyNotice(payload)) {
      return;
    }

    await importPayload(
      payload,
      {
        navigateToExistingById: false,
        showDuplicateAlert: true,
      });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);
    alert(`Import failed: ${message}`);
  }
}

function getImportHashToken(): string | null {
  return getLinkSharingService().readTokenFromHash(window.location.hash);
}

function clearImportHashFromUrl(): void {
  window.history.pushState(
    null,
    '',
    `${window.location.pathname}${window.location.search}`,
  );
}

async function handleImportFromHashOnStartup(): Promise<boolean> {
  const token = getImportHashToken();

  if (token === null || token.trim() === '') {
    return false;
  }

  if (importFromHashInProgress) {
    return true;
  }

  importFromHashInProgress = true;

  try {
    const decodedToken = (() => {
      try {
        return decodeURIComponent(token);
      } catch {
        return token;
      }
    })();

    const sample =
      getSampleById(token)
      ?? getSampleById(decodedToken);

    if (sample !== null) {
      const importedAppId = await importPayload(
        sample,
        {
          navigateToExistingById: true,
          showDuplicateAlert: false,
        });

      if (importedAppId !== null) {
        const mode = askPostLinkImportMode();

        if (mode === 'run') {
          setWorkspaceMode('run');
          handleRun();
        } else {
          setWorkspaceMode('edit');
        }
      }

      clearImportHashFromUrl();
      return true;
    }

    try {
      const payload =
        await getLinkSharingService()
          .parsePayloadFromToken<ImportedPayload>(token);

      if (!confirmImportSafetyNotice(payload)) {
        clearImportHashFromUrl();
        return true;
      }

      const importedAppId = await importPayload(
        payload,
        {
          navigateToExistingById: true,
          showDuplicateAlert: false,
        });

      if (importedAppId !== null) {
        const mode = askPostLinkImportMode();

        if (mode === 'run') {
          setWorkspaceMode('run');
          handleRun();
        } else {
          setWorkspaceMode('edit');
        }
      }
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : String(error);

      alert(`Could not import from share link: ${message}`);
    }

    clearImportHashFromUrl();
    return true;
  } finally {
    importFromHashInProgress = false;
  }
}

async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string,
  ): Promise<T>
{
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise =
    new Promise<T>((_, reject) => {
      timeoutId = globalThis.setTimeout(
        () => {
          reject(new Error(timeoutMessage));
        },
        timeoutMs,
      );
    });

  try {
    return await Promise.race([ promise, timeoutPromise ]);
  } finally {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
  }
}

async function prepareShareLink(
    options: {
      minified: boolean;
      excludeNonApplicationFiles: boolean;
    }
  ): Promise<{
    url: string;
    status: string;
  }>
{
  sharePreparationId += 1;
  const requestId = sharePreparationId;
  const linkResult =
    await withTimeout(
      (async () => {
        const payload = await buildSharePayload(options);
        return getLinkSharingService().createShareUrl(payload);
      })(),
      SHARE_PREPARE_TIMEOUT_MS,
      'Preparing share link timed out. Use Download export instead.',
    );

  if (requestId !== sharePreparationId) {
    throw new Error('Share link preparation was superseded by a newer request.');
  }

  return {
    url: linkResult.url,
    status: buildShareStatusMessage(
      linkResult.url.length,
      SHARE_PRACTICAL_URL_LENGTH,
      SHARE_MAX_URL_LENGTH,
    ),
  };
}

async function downloadShareExport(
    options: {
      minified: boolean;
      excludeNonApplicationFiles: boolean;
    }
  ): Promise<void>
{
  const payload = await buildSharePayload(options);
  downloadExportPayload(payload);
}

async function saveSettingsFromModal(
    values: {
      apiKey: string;
      theme: string;
      fontSizeText: string;
      maxToolStepsText: string;
    }
  ): Promise<void>
{
  const settings = loadSettings();
  delete settings.apiKey;
  settings.theme =
    values.theme === 'light'
      ? 'light'
      : DEFAULT_THEME;

  const parsedFontSize = Number.parseInt(values.fontSizeText, 10);
  settings.fontSize = Number.isFinite(parsedFontSize)
                     && parsedFontSize >= 12
                     && parsedFontSize <= 20
    ? parsedFontSize
    : DEFAULT_FONT_SIZE;

  const parsed = Number.parseInt(values.maxToolStepsText, 10);
  settings.maxToolSteps = Number.isFinite(parsed) && parsed >= 1
    ? parsed
    : DEFAULT_MAX_TOOL_STEPS;

  saveSettings(settings);

  if (state.currentAppId !== null) {
    const prevKey = currentAppOpenAiApiKey;
    currentAppOpenAiApiKey = values.apiKey;
    await saveAppOpenAiApiKey(
      state.currentAppId,
      currentAppOpenAiApiKey);

    if (prevKey !== currentAppOpenAiApiKey) {
      await mountAiChatForCurrentApp();
    }
  }

  await refreshAvailableModels();
  applyAppearanceSettings();
}

function syncModelSelectOptions(
    selectElement: AppBuilderSelectElement,
    modelIds: string[],
    selectedValue: string,
  ): void
{
  const currentValue = readControlValue(selectElement);

  selectElement.items =
    modelIds.map(modelId => ({
      value: modelId,
      label: modelId,
    }));

  if (modelIds.includes(currentValue)) {
    writeControlValue(selectElement, currentValue);
    return;
  }

  writeControlValue(
    selectElement,
    modelIds.includes(selectedValue)
      ? selectedValue
      : modelIds[0] ?? selectedValue);
}

function refreshLaneModelSelectOptions(): void {
  const modelIds = dedupeModels([
    ...availableModels,
    { id: getChatModel() },
    { id: getCodeGenerationModel() },
  ]).map(model => model.id);

  syncModelSelectOptions(elChatModelSelect, modelIds, getChatModel());
  syncModelSelectOptions(
    elGenerationModelSelect,
    modelIds,
    getCodeGenerationModel(),
  );
}

function pickSavedOrDefaultModel(
    savedValue: string | undefined,
    defaultValue: string,
  ): string
{
  const modelIds = dedupeModels(availableModels).map(model => model.id);

  if (typeof savedValue === 'string' && modelIds.includes(savedValue)) {
    return savedValue;
  }

  if (modelIds.includes(defaultValue)) {
    return defaultValue;
  }

  return modelIds[0] ?? defaultValue;
}

function saveChatModelSelection(): void {
  const settings = loadSettings();
  settings.chatModel = readControlValue(elChatModelSelect);
  saveSettings(settings);
}

function saveGenerationModelSelection(): void {
  const settings = loadSettings();
  settings.generationModel = readControlValue(elGenerationModelSelect);
  saveSettings(settings);
}

function readCurrentFileContent(fileName: string): string {
  return state.files.find(file => file.name === fileName)?.content ?? '';
}

async function writeCurrentFileContent(fileName: string, content: string): Promise<void> {
  if (state.currentAppId === null) {
    return;
  }

  const existing = state.files.find(file => file.name === fileName);

  if (existing !== undefined) {
    if (existing.content === content) {
      return;
    }

    existing.content = content;
    await saveFile(existing);
    await regenerateCurrentAppUuidForFileChange();
    state.files = [ ...state.files ];
    return;
  }

  const created = {
    id: randomId(),
    appId: state.currentAppId,
    name: fileName,
    content,
  };

  await saveFile(created);
  await regenerateCurrentAppUuidForFileChange();
  state.files = [ ...state.files, created ];
}

async function refreshAvailableModels(
    apiKey = getCurrentAppOpenAiApiKey()
  ): Promise<void>
{
  const trimmedApiKey = apiKey.trim();

  if (trimmedApiKey === '') {
    availableModels = dedupeModels([
      { id: DEFAULT_CHAT_MODEL },
      { id: DEFAULT_CODE_MODEL },
      { id: DEFAULT_MODEL },
    ]);
    refreshLaneModelSelectOptions();
    return;
  }

  try {
    const models = await listAvailableModels(trimmedApiKey);
    availableModels = dedupeModels([
      ...models,
      { id: DEFAULT_CHAT_MODEL },
      { id: DEFAULT_CODE_MODEL },
      { id: DEFAULT_MODEL },
    ]);
  } catch (error) {
    console.warn('Could not load OpenAI models:', error);
    availableModels = dedupeModels([
      ...availableModels,
      { id: DEFAULT_CHAT_MODEL },
      { id: DEFAULT_CODE_MODEL },
      { id: DEFAULT_MODEL },
    ]);
  }

  refreshLaneModelSelectOptions();
}

function toggleAppsCollapsed(): void {
  if (isMobileViewport()) {
    setMobileWorkspaceTab('chat');
    return;
  }

  togglePanelUi({
    panelElement: elPanelChat,
    toggleButtonElement: elBtnToggleChat,
    panelsElement: elPanels,
    collapsedPanelsClass: 'chat-collapsed',
    expandedText: 'Chat',
    collapsedText: 'Chat',
    expandedIcon: '<i class="bi bi-chevron-down"></i>',
    collapsedIcon: '<i class="bi bi-chevron-right"></i>',
  });
}

function toggleFilesCollapsed(): void {
  if (isMobileViewport()) {
    setMobileWorkspaceTab('files');
    return;
  }

  togglePanelUi({
    panelElement: elPanelEditor,
    toggleButtonElement: elBtnToggleFiles,
    panelsElement: elPanels,
    collapsedPanelsClass: 'files-collapsed',
    expandedText: 'Files',
    collapsedText: 'Files',
    expandedIcon: '<i class="bi bi-chevron-down"></i>',
    collapsedIcon: '<i class="bi bi-chevron-right"></i>',
  });
}

state.on('set:apps', () => {
  renderAppList();
  renderPreviewTitle();
});
state.on('set:currentAppId', () => {
  renderAppList();
  renderWorkspace();
  renderPreviewTitle();
});
state.on('set:files', () => {
  renderFileSelect();
  renderFileContent();
});
state.on('set:activeFileName', () => {
  renderFileSelect();
  renderFileContent();
});

elBtnNewApp.addEventListener('click', promptNewApp);
elBtnImport.addEventListener('click', handleImportClick);
elBtnProjectSettings.addEventListener('click', openProjectSettings);
elBtnShare.addEventListener('click', () => {
  shareModal.open();
});
elBtnStartGeneration.addEventListener('click', () => {
  void handleStartGeneration();
});
elBtnStopGeneration.addEventListener('click', handleStopGeneration);
elBtnRun.addEventListener('click', handleRun);
elBtnSettings.addEventListener('click', () => {
  void settingsModal.open();
});
elBtnToggleChat.addEventListener('click', toggleAppsCollapsed);
elBtnToggleFiles.addEventListener('click', toggleFilesCollapsed);
elMobileTabChat.addEventListener('click', () => {
  setMobileWorkspaceTab('chat');
});
elMobileTabFiles.addEventListener('click', () => {
  setMobileWorkspaceTab('files');
});
elMobileTabRun.addEventListener('click', () => {
  const isRunTabAlreadyActive =
    elPanels.classList.contains('mobile-tab-run');
  setMobileWorkspaceTab('run');
  if (!isRunTabAlreadyActive) {
    handleRun();
  }
});
elChatModelSelect.addEventListener('change', saveChatModelSelection);
elGenerationModelSelect.addEventListener('change', saveGenerationModelSelection);

elAppSelect.addEventListener('change', () => {
  const value = readControlValue(elAppSelect);

  if (value === APP_ACTION_NEW) {
    promptNewApp();
    renderAppList();
    return;
  }

  if (value === APP_ACTION_IMPORT) {
    handleImportClick();
    renderAppList();
    return;
  }

  if (value !== '' && value !== state.currentAppId) {
    void openApp(value);
  }
});

elFileSelect.addEventListener('change', () => {
  const next = readControlValue(elFileSelect);

  if (next === '' || next === state.activeFileName) {
    return;
  }

  void persistCurrentFile();
  state.activeFileName = next;
});

elImportFile.addEventListener('change', () => {
  void handleImportFile();
});

window.listFileset = appRuntimeTools.listFileset;
window.listFilesByMask = appRuntimeTools.listFilesByMask;
window.readFile = appRuntimeTools.readFile;
window.readFiles = appRuntimeTools.readFiles;
window.readFilesByMask = appRuntimeTools.readFilesByMask;
window.readFileData = appRuntimeTools.readFileData;
window.setFilesContent = appRuntimeTools.setFilesContent;
window.setFileData = appRuntimeTools.setFileData;
window.setFileContent = appRuntimeTools.setFileContent;
window.replaceFilePart = appRuntimeTools.replaceFilePart;
window.deleteFile = appRuntimeTools.deleteFile;
window.grep = appRuntimeTools.grep;
window.choose = appRuntimeTools.choose;
window.evalInApp = appRuntimeTools.evalInApp;
window.assertInApp = appRuntimeTools.assertInApp;
window.runAppTests = appRuntimeTools.runAppTests;
window.getAppDiagnostics = appRuntimeTools.getAppDiagnostics;
window.runAppAndCollectDiagnostics = appRuntimeTools.runAppAndCollectDiagnostics;

window.addEventListener('hashchange', () => {
  void handleImportFromHashOnStartup();
});

async function init(): Promise<void> {
  applyAppearanceSettings();
  await refreshAvailableModels();
  setGenerationBusy(false);
  setGenerationStatus('Idle.');

  const apps =
    await ensureAppsHaveUniqueUuids(
      await listApps());

  state.apps = apps;

  const importedFromHash =
    await handleImportFromHashOnStartup();

  if (importedFromHash) {
    return;
  }

  if (apps.length > 0) {
    const sorted = [...apps].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );

    await openApp(sorted[0].id);
  } else {
    state.currentAppId = null;
    state.files = [];
    state.activeFileName = null;
    state.chatMessages = [];
    renderWorkspace();
  }
}

init().catch(error => {
  console.error('App Builder init failed:', error);
});
