import { state } from './state.js';
import {
  listApps,
  saveApp,
  deleteApp,
  listFiles,
  saveFile,
  deleteFile,
  replaceFiles,
} from './storage.js';
import {
  generateApp,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOOL_STEPS,
  type AiModel,
} from './ai/ai-repl.js';
import {
  SYSTEM_PROMPT,
} from './ai/ai-instruction.js';
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
} from './ai/ai-tools.js';
import {
  renderAppListUi,
} from './ui/app-list-ui.js';
import {
  renderFileSelectUi,
  renderFileContentUi,
} from './ui/file-editor-ui.js';
import {
  renderGeneratingButtonUi,
  setChatProgressUi,
  appendChatMessageUi,
} from './ui/chat-ui.js';
import {
  togglePanelUi,
} from './ui/panel-collapse-ui.js';
import {
  buildSampleFiles,
  getSampleById,
  getSampleByName,
} from './examples/samples.js';
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

function randomId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function mustElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (element === null) {
    throw new Error(`Missing element #${id}`);
  }

  return element as T;
}

const elAppWorkspace = mustElement<HTMLElement>('app-workspace');
const elFirstAppSetup = mustElement<HTMLElement>('first-app-setup');
const elFirstApiKeyInput = mustElement<HTMLInputElement>('first-api-key-input');
const elFirstAppNameInput = mustElement<HTMLInputElement>('first-app-name-input');
const elBtnCreateFirstApp = mustElement<HTMLButtonElement>('btn-create-first-app');
const elBtnCreateTodoSample =
  mustElement<HTMLButtonElement>('btn-create-todo-sample');
const elPanels = mustElement<HTMLElement>('panels');
const elPanelChat = mustElement<HTMLElement>('panel-chat');
const elPanelEditor = mustElement<HTMLElement>('panel-editor');
const elAppSelect = mustElement<HTMLSelectElement>('app-select');
const elFileSelect = mustElement<HTMLSelectElement>('file-select');
const elFileContent = mustElement<HTMLTextAreaElement>('file-content');
const elChatMessages = mustElement<HTMLElement>('chat-messages');
const elChatProgress = mustElement<HTMLElement>('chat-progress');
const elChatInput = mustElement<HTMLTextAreaElement>('chat-input');
const elBtnGenerate = mustElement<HTMLButtonElement>('btn-generate');
const elBtnRun = mustElement<HTMLButtonElement>('btn-run');
const elBtnRefreshPreview =
  mustElement<HTMLButtonElement>('btn-refresh-preview');
const elPreviewFrame = mustElement<HTMLIFrameElement>('preview-frame');
const elBtnNewApp = mustElement<HTMLButtonElement>('btn-new-app');
const elBtnImport = mustElement<HTMLButtonElement>('btn-import');
const elBtnProjectSettings = mustElement<HTMLButtonElement>('btn-project-settings');
const elBtnShare = mustElement<HTMLButtonElement>('btn-share');
const elBtnSettings = mustElement<HTMLButtonElement>('btn-settings');
const elBtnAgentInstructions =
  mustElement<HTMLButtonElement>('btn-agent-instructions');
const elBtnToggleChat = mustElement<HTMLButtonElement>('btn-toggle-chat');
const elBtnToggleFiles = mustElement<HTMLButtonElement>('btn-toggle-files');

const elSettingsModal = mustElement<HTMLElement>('settings-modal');
const elBtnCloseSettings =
  mustElement<HTMLButtonElement>('btn-close-settings');
const elBtnSaveSettings = mustElement<HTMLButtonElement>('btn-save-settings');
const elBtnCancelSettings =
  mustElement<HTMLButtonElement>('btn-cancel-settings');
const elApiKeyInput = mustElement<HTMLInputElement>('api-key-input');
const elModelSelect = mustElement<HTMLSelectElement>('model-select');
const elThemeSelect = mustElement<HTMLSelectElement>('theme-select');
const elFontSizeInput = mustElement<HTMLInputElement>('font-size-input');
const elMaxToolStepsInput =
  mustElement<HTMLInputElement>('max-tool-steps-input');

const elNameModal = mustElement<HTMLElement>('name-modal');
const elNameModalTitle = mustElement<HTMLElement>('name-modal-title');
const elAppNameInput = mustElement<HTMLInputElement>('app-name-input');
const elBtnConfirmName = mustElement<HTMLButtonElement>('btn-confirm-name');
const elBtnCancelName = mustElement<HTMLButtonElement>('btn-cancel-name');
const elBtnCloseNameModal =
  mustElement<HTMLButtonElement>('btn-close-name-modal');

const elProjectSettingsModal = mustElement<HTMLElement>('project-settings-modal');
const elProjectNameInput = mustElement<HTMLInputElement>('project-name-input');
const elProjectAuthorNameInput =
  mustElement<HTMLInputElement>('project-author-name-input');
const elProjectAuthorEmailInput =
  mustElement<HTMLInputElement>('project-author-email-input');
const elBtnSaveProjectSettings =
  mustElement<HTMLButtonElement>('btn-save-project-settings');
const elBtnDeleteProject = mustElement<HTMLButtonElement>('btn-delete-project');
const elBtnCloseProjectSettings =
  mustElement<HTMLButtonElement>('btn-close-project-settings');
const elBtnCloseProjectSettingsX =
  mustElement<HTMLButtonElement>('btn-close-project-settings-x');

const elShareModal = mustElement<HTMLElement>('share-modal');
const elBtnCloseShare = mustElement<HTMLButtonElement>('btn-close-share');
const elBtnCloseShare2 = mustElement<HTMLButtonElement>('btn-close-share-2');
const elBtnShareLink = mustElement<HTMLButtonElement>('btn-share-link');
const elBtnShareDownload = mustElement<HTMLButtonElement>('btn-share-download');
const elShareLinkStatus = mustElement<HTMLElement>('share-link-status');
const elShareLinkOutput = mustElement<HTMLTextAreaElement>('share-link-output');

const elImportFile = mustElement<HTMLInputElement>('import-file');

const elAgentInstructionsModal =
  mustElement<HTMLElement>('agent-instructions-modal');
const elAgentInstructionsText =
  mustElement<HTMLTextAreaElement>('agent-instructions-text');
const elBtnCloseAgentInstructions =
  mustElement<HTMLButtonElement>('btn-close-agent-instructions');
const elBtnCloseAgentInstructions2 =
  mustElement<HTMLButtonElement>('btn-close-agent-instructions-2');
const elBtnCopyAgentInstructions =
  mustElement<HTMLButtonElement>('btn-copy-agent-instructions');

const SETTINGS_KEY = 'asljs-app-builder-settings';
const DEFAULT_THEME = 'light';
const DEFAULT_FONT_SIZE = 14;
const APP_ACTION_NEW = '__new__';
const APP_ACTION_IMPORT = '__import__';
const IMPORT_HASH_PREFIX = '#I!';
const SHARE_MAX_URL_LENGTH = 2000;
const SHARE_BASE_URL =
  'https://alexandritesoftware.github.io/asljs/app-builder';

let linkSharingService: LinkSharingService | null = null;

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

function getApiKey(): string {
  return loadSettings().apiKey ?? '';
}

function getModel(): AiModel {
  const candidate = loadSettings().model;

  if (candidate === 'gpt-5.3-codex' || candidate === 'gpt-5.4') {
    return candidate;
  }

  return DEFAULT_MODEL;
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
  document.body.dataset.theme = getTheme();
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
  state.apps = state.apps.map(item => (item.id === app.id
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
    readFile: (path: string) => Promise<string>;
    setFileContent: (path: string, content: string) => Promise<void>;
    replaceFilePart: (
      path: string,
      search: string,
      replacement: string,
      replaceAll?: boolean,
    ) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
    evalInApp: (code: string) => Promise<unknown>;
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

  elFirstAppSetup.classList.toggle('hidden', hasApp);
  elPanels.classList.toggle('hidden', !hasApp);

  if (!hasApp) {
    elFirstApiKeyInput.value = getApiKey();
    elFirstAppNameInput.value = '';
    return;
  }

  renderFileSelect();
  renderFileContent();
}

async function createFirstAppFromForm(): Promise<void> {
  const name = elFirstAppNameInput.value.trim();

  if (name === '') {
    elFirstAppNameInput.focus();
    return;
  }

  const apiKey = elFirstApiKeyInput.value.trim();

  if (apiKey !== '') {
    const settings = loadSettings();
    settings.apiKey = apiKey;
    saveSettings(settings);
  }

  const app: AppRecord = {
    id: randomId(),
    uuid: createAppUuid(),
    name,
    createdAt: now(),
    updatedAt: now(),
  };

  await saveApp(app);
  state.apps = [...state.apps, app];
  await openApp(app.id);
}

async function createTodoSampleAppFromForm(): Promise<void> {
  const sample = getSampleByName('TODO Sample');

  if (sample === null) {
    alert('TODO sample is not available.');
    return;
  }

  const rawName = elFirstAppNameInput.value.trim();
  const name = rawName === ''
    ? sample.name
    : rawName;

  const apiKey = elFirstApiKeyInput.value.trim();

  if (apiKey !== '') {
    const settings = loadSettings();
    settings.apiKey = apiKey;
    saveSettings(settings);
  }

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
    textAreaElement: elFileContent,
    files: state.files,
    activeFileName: state.activeFileName,
  });
}

function setGenerating(value: boolean): void {
  state.generating = value;
  renderGeneratingButtonUi(elBtnGenerate, value);
}

function setChatProgress(message: string, visible: boolean): void {
  setChatProgressUi(elChatProgress, message, visible);
}

function appendChatMessage(role: 'user' | 'assistant', text: string): void {
  appendChatMessageUi(elChatMessages, role, text);
}

async function persistCurrentFile(): Promise<void> {
  if (state.activeFileName === null || state.currentAppId === null) {
    return;
  }

  const file = state.files.find(item => item.name === state.activeFileName);

  if (file === undefined) {
    return;
  }

  const newContent = elFileContent.value;

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
  state.files = files;
  state.activeFileName = files[0]?.name ?? null;

  elChatMessages.replaceChildren();
}

function promptNewApp(): void {
  elNameModalTitle.textContent = 'New App';
  elAppNameInput.value = '';
  elNameModal.classList.remove('hidden');
  elAppNameInput.focus();

  elBtnConfirmName.onclick = async () => {
    const name = elAppNameInput.value.trim();

    if (name === '') {
      return;
    }

    elNameModal.classList.add('hidden');

    const app: AppRecord = {
      id: randomId(),
      uuid: createAppUuid(),
      name,
      createdAt: now(),
      updatedAt: now(),
    };

    await saveApp(app);
    state.apps = [...state.apps, app];
    await openApp(app.id);
  };
}

function closeNameModal(): void {
  elNameModal.classList.add('hidden');
  elBtnConfirmName.onclick = null;
}

function promptRenameApp(): void {
  const app = state.apps.find(item => item.id === state.currentAppId);

  if (app === undefined) {
    return;
  }

  elNameModalTitle.textContent = 'Rename App';
  elAppNameInput.value = app.name;
  elNameModal.classList.remove('hidden');
  elAppNameInput.focus();
  elAppNameInput.select();

  elBtnConfirmName.onclick = async () => {
    const name = elAppNameInput.value.trim();

    if (name === '') {
      return;
    }

    elNameModal.classList.add('hidden');

    const updated: AppRecord = {
      ...app,
      name,
      updatedAt: now(),
    };

    await saveApp(updated);
    state.apps = state.apps.map(item => (item.id === app.id
? updated
: item));
  };
}

function openProjectSettings(): void {
  const app = state.apps.find(item => item.id === state.currentAppId);

  if (app === undefined) {
    return;
  }

  elProjectNameInput.value = app.name;
  elProjectAuthorNameInput.value = app.author?.name ?? '';
  elProjectAuthorEmailInput.value = app.author?.email ?? '';
  elProjectSettingsModal.classList.remove('hidden');
  elProjectNameInput.focus();
  elProjectNameInput.select();
}

function closeProjectSettings(): void {
  elProjectSettingsModal.classList.add('hidden');
}

async function saveProjectSettings(): Promise<void> {
  const app = state.apps.find(item => item.id === state.currentAppId);

  if (app === undefined) {
    return;
  }

  const name = elProjectNameInput.value.trim();

  if (name === '') {
    elProjectNameInput.focus();
    return;
  }

  const authorName = elProjectAuthorNameInput.value.trim();
  const authorEmail = elProjectAuthorEmailInput.value.trim();
  const author: AppAuthor | undefined =
    authorName !== '' || authorEmail !== ''
      ? {
        ...(authorName !== ''
          ? { name: authorName }
          : {}),
        ...(authorEmail !== ''
          ? { email: authorEmail }
          : {}),
      }
      : undefined;

  const updated: AppRecord = {
    ...app,
    name,
    author,
    updatedAt: now(),
  };

  await saveApp(updated);
  state.apps = state.apps.map(item => (item.id === app.id
? updated
: item));

  closeProjectSettings();
}

async function deleteProjectFromSettings(): Promise<void> {
  closeProjectSettings();
  await confirmDeleteApp();
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
  elChatMessages.replaceChildren();
  elPreviewFrame.src = 'about:blank';
}

async function handleGenerate(): Promise<void> {
  const prompt = elChatInput.value.trim();

  if (prompt === '') {
    return;
  }

  const apiKey = getApiKey();

  if (apiKey === '') {
    appendChatMessage(
      'assistant',
      'No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.',
    );
    return;
  }

  if (state.currentAppId === null) {
    appendChatMessage('assistant', 'Please create or open an app first.');
    return;
  }

  elChatInput.value = '';
  appendChatMessage('user', prompt);
  setGenerating(true);
  setChatProgress('Starting generation...', true);

  try {
    const model = getModel();
    const maxToolSteps = getMaxToolSteps();

    const result = await generateApp(prompt, apiKey, model, appRuntimeTools, {
      initialToolStepLimit: maxToolSteps,
      systemPrompt: SYSTEM_PROMPT,
      onToolStepLimit: async ({ stepsCompleted }) => confirm(
        `AI reached ${stepsCompleted} tool steps without finishing. Continue for 12 more steps?`,
      ),
      onProgress: (message) => {
        setChatProgress(message, true);
      },
    });

    const app = state.apps.find(item => item.id === state.currentAppId);

    if (app !== undefined) {
      const updated: AppRecord = {
        ...app,
        updatedAt: now(),
      };

      await saveApp(updated);
      state.apps = state.apps.map(item => (item.id === app.id
? updated
: item));
    }

    appendChatMessage(
      'assistant',
      result.summary,
    );

    handleRun();
  } catch (error) {
    const message = error instanceof Error
? error.message
: String(error);
    appendChatMessage('assistant', `Error: ${message}`);
  } finally {
    setChatProgress('', false);
    setGenerating(false);
  }
}

function handleRun(): void {
  void persistCurrentFile().then(() => {
    renderPreview(elPreviewFrame, state.files, {
      hostOpenAiApiKey: getApiKey(),
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
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${payload.name.replace(/\s+/g, '-')}.json`;
  link.click();
  URL.revokeObjectURL(url);
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

  elBtnToggleChat.textContent = collapsed
    ? 'Chat ▸'
    : 'Chat ▾';

  elBtnToggleFiles.textContent = collapsed
    ? 'Files ▸'
    : 'Files ▾';

  elBtnToggleChat.setAttribute('aria-expanded', String(!collapsed));
  elBtnToggleFiles.setAttribute('aria-expanded', String(!collapsed));
}

function askPostLinkImportMode(): 'edit' | 'run' {
  const edit = confirm(
    'Import link opened.\n\n'
    + 'Press OK to edit the app (chat/files open, app not auto-run).\n'
    + 'Press Cancel to run the app (chat/files hidden).',
  );

  return edit
    ? 'edit'
    : 'run';
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
    const message = error instanceof Error
? error.message
: String(error);
    alert(`Import failed: ${message}`);
  }
}

function getImportHashToken(): string | null {
  return getLinkSharingService().readTokenFromHash(window.location.hash);
}

function clearImportHashFromUrl(): void {
  if (window.location.origin === 'https://alexandritesoftware.github.io') {
    window.location.replace(SHARE_BASE_URL);
    return;
  }

  window.history.replaceState(null, '', window.location.pathname);
}

async function handleImportFromHashOnStartup(): Promise<boolean> {
  const token = getImportHashToken();

  if (token === null || token.trim() === '') {
    return false;
  }

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
}

async function prepareShareLinkUi(): Promise<void> {
  elShareLinkOutput.value = '';
  elBtnShareLink.disabled = true;
  elShareLinkStatus.textContent = 'Preparing share link...';

  try {
    const payload = await buildExportPayload();
    const linkResult =
      await getLinkSharingService().createShareUrl(payload);

    if (linkResult.exceedsMaxUrlLength) {
      elShareLinkStatus.textContent =
        'Link sharing is unavailable because URL length exceeds 2000 characters. Use Download export and import the file instead.';
      return;
    }

    elShareLinkOutput.value = linkResult.url;
    elShareLinkStatus.textContent =
      'Link is ready. Use Share with link to copy it.';
    elBtnShareLink.disabled = false;
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : String(error);

    elShareLinkStatus.textContent = message;
  }
}

function openShareModal(): void {
  if (getCurrentApp() === undefined) {
    return;
  }

  elShareModal.classList.remove('hidden');
  void prepareShareLinkUi();
}

function closeShareModal(): void {
  elShareModal.classList.add('hidden');
}

async function shareWithLink(): Promise<void> {
  if (elShareLinkOutput.value.trim() === '') {
    return;
  }

  try {
    await navigator.clipboard.writeText(elShareLinkOutput.value);
    elShareLinkStatus.textContent = 'Share link copied to clipboard.';
  } catch {
    elShareLinkOutput.focus();
    elShareLinkOutput.select();
    elShareLinkStatus.textContent =
      'Could not copy automatically. Link is selected, copy it manually.';
  }
}

async function shareWithDownload(): Promise<void> {
  const payload = await buildExportPayload();
  downloadExportPayload(payload);
}

function openSettings(): void {
  elApiKeyInput.value = getApiKey();
  elModelSelect.value = getModel();
  elThemeSelect.value = getTheme();
  elFontSizeInput.value = String(getFontSize());
  elMaxToolStepsInput.value = String(getMaxToolSteps());
  elSettingsModal.classList.remove('hidden');
  elApiKeyInput.focus();
}

function closeSettings(): void {
  elSettingsModal.classList.add('hidden');
}

function saveSettingsFromModal(): void {
  const settings = loadSettings();
  settings.apiKey = elApiKeyInput.value.trim();
  settings.model =
    elModelSelect.value === 'gpt-5.4'
      ? 'gpt-5.4'
      : 'gpt-5.3-codex';
  settings.theme =
    elThemeSelect.value === 'light'
      ? 'light'
      : DEFAULT_THEME;

  const parsedFontSize = Number.parseInt(elFontSizeInput.value, 10);
  settings.fontSize = Number.isFinite(parsedFontSize)
                     && parsedFontSize >= 12
                     && parsedFontSize <= 20
    ? parsedFontSize
    : DEFAULT_FONT_SIZE;

  const parsed = Number.parseInt(elMaxToolStepsInput.value, 10);
  settings.maxToolSteps = Number.isFinite(parsed) && parsed >= 1
    ? parsed
    : DEFAULT_MAX_TOOL_STEPS;

  saveSettings(settings);
  applyAppearanceSettings();
  closeSettings();
}

function openAgentInstructions(): void {
  elAgentInstructionsText.value = SYSTEM_PROMPT;
  elAgentInstructionsModal.classList.remove('hidden');
  elAgentInstructionsText.scrollTop = 0;
}

function closeAgentInstructions(): void {
  elAgentInstructionsModal.classList.add('hidden');
}

function toggleAppsCollapsed(): void {
  togglePanelUi({
    panelElement: elPanelChat,
    toggleButtonElement: elBtnToggleChat,
    panelsElement: elPanels,
    collapsedPanelsClass: 'chat-collapsed',
    expandedLabel: 'Chat ▾',
    collapsedLabel: 'Chat ▸',
  });
}

function toggleFilesCollapsed(): void {
  togglePanelUi({
    panelElement: elPanelEditor,
    toggleButtonElement: elBtnToggleFiles,
    panelsElement: elPanels,
    collapsedPanelsClass: 'files-collapsed',
    expandedLabel: 'Files ▾',
    collapsedLabel: 'Files ▸',
  });
}

async function copyAgentInstructions(): Promise<void> {
  const text = elAgentInstructionsText.value;

  try {
    await navigator.clipboard.writeText(text);
    appendChatMessage('assistant', 'Agent instructions copied to clipboard.');
  } catch {
    appendChatMessage(
      'assistant',
      'Could not copy to clipboard automatically. You can still select and copy from the instructions modal.',
    );
  }
}

state.on('set:apps', () => renderAppList());
state.on('set:currentAppId', () => {
  renderAppList();
  renderWorkspace();
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
  openShareModal();
});
elBtnGenerate.addEventListener('click', () => {
  void handleGenerate();
});
elBtnRun.addEventListener('click', handleRun);
elBtnRefreshPreview.addEventListener('click', handleRun);
elBtnSettings.addEventListener('click', openSettings);
elBtnAgentInstructions.addEventListener('click', openAgentInstructions);
elBtnToggleChat.addEventListener('click', toggleAppsCollapsed);
elBtnToggleFiles.addEventListener('click', toggleFilesCollapsed);

elBtnCloseSettings.addEventListener('click', closeSettings);
elBtnSaveSettings.addEventListener('click', saveSettingsFromModal);
elBtnCancelSettings.addEventListener('click', closeSettings);
elSettingsModal.addEventListener('click', (event: MouseEvent) => {
  if (event.target === elSettingsModal) {
    closeSettings();
  }
});

elBtnCloseAgentInstructions.addEventListener('click', closeAgentInstructions);
elBtnCloseAgentInstructions2.addEventListener('click', closeAgentInstructions);
elBtnCopyAgentInstructions.addEventListener('click', () => {
  void copyAgentInstructions();
});
elAgentInstructionsModal.addEventListener('click', (event: MouseEvent) => {
  if (event.target === elAgentInstructionsModal) {
    closeAgentInstructions();
  }
});

elBtnCloseShare.addEventListener('click', closeShareModal);
elBtnCloseShare2.addEventListener('click', closeShareModal);
elBtnShareLink.addEventListener('click', () => {
  void shareWithLink();
});
elBtnShareDownload.addEventListener('click', () => {
  void shareWithDownload();
});
elShareModal.addEventListener('click', (event: MouseEvent) => {
  if (event.target === elShareModal) {
    closeShareModal();
  }
});

elBtnConfirmName.addEventListener('click', () => {});
elBtnCancelName.addEventListener('click', closeNameModal);
elBtnCloseNameModal.addEventListener('click', closeNameModal);
elNameModal.addEventListener('click', (event: MouseEvent) => {
  if (event.target === elNameModal) {
    closeNameModal();
  }
});

elBtnSaveProjectSettings.addEventListener('click', () => {
  void saveProjectSettings();
});
elBtnDeleteProject.addEventListener('click', () => {
  void deleteProjectFromSettings();
});
elBtnCloseProjectSettings.addEventListener('click', closeProjectSettings);
elBtnCloseProjectSettingsX.addEventListener('click', closeProjectSettings);
elProjectSettingsModal.addEventListener('click', (event: MouseEvent) => {
  if (event.target === elProjectSettingsModal) {
    closeProjectSettings();
  }
});

elAppNameInput.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    elBtnConfirmName.click();
  }
});

elProjectNameInput.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    void saveProjectSettings();
  }
});

elBtnCreateFirstApp.addEventListener('click', () => {
  void createFirstAppFromForm();
});

elBtnCreateTodoSample.addEventListener('click', () => {
  void createTodoSampleAppFromForm();
});

elFirstAppNameInput.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    void createFirstAppFromForm();
  }
});

elChatInput.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    void handleGenerate();
  }
});

elAppSelect.addEventListener('change', () => {
  const value = elAppSelect.value;

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
  const next = elFileSelect.value;

  if (next === '' || next === state.activeFileName) {
    return;
  }

  void persistCurrentFile();
  state.activeFileName = next;
});

elFileContent.addEventListener('blur', () => {
  void persistCurrentFile();
});

elImportFile.addEventListener('change', () => {
  void handleImportFile();
});

window.listFileset = appRuntimeTools.listFileset;
window.readFile = appRuntimeTools.readFile;
window.setFileContent = appRuntimeTools.setFileContent;
window.replaceFilePart = appRuntimeTools.replaceFilePart;
window.deleteFile = appRuntimeTools.deleteFile;
window.evalInApp = appRuntimeTools.evalInApp;
window.getAppDiagnostics = appRuntimeTools.getAppDiagnostics;
window.runAppAndCollectDiagnostics = appRuntimeTools.runAppAndCollectDiagnostics;

async function init(): Promise<void> {
  applyAppearanceSettings();

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
    renderWorkspace();
    elFirstAppNameInput.focus();
  }
}

init().catch(error => {
  console.error('App Builder init failed:', error);
});
