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
  getSystemPrompt,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOOL_STEPS,
  type AiModel,
} from './ai.js';
import {
  renderPreview,
  evaluateInPreview,
} from './preview.js';
import {
  type AppRecord,
  type FileRecord,
  type Settings,
} from './types.js';

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

const elAppList = mustElement<HTMLElement>('app-list');
const elEmptyState = mustElement<HTMLElement>('empty-state');
const elAppWorkspace = mustElement<HTMLElement>('app-workspace');
const elAppNameDisplay = mustElement<HTMLElement>('app-name-display');
const elFileSelect = mustElement<HTMLSelectElement>('file-select');
const elEditorLayout = mustElement<HTMLElement>('editor-layout');
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
const elBtnNewApp2 = mustElement<HTMLButtonElement>('btn-new-app-2');
const elBtnRename = mustElement<HTMLButtonElement>('btn-rename');
const elBtnDeleteApp = mustElement<HTMLButtonElement>('btn-delete-app');
const elBtnExport = mustElement<HTMLButtonElement>('btn-export');
const elBtnSettings = mustElement<HTMLButtonElement>('btn-settings');
const elBtnAgentInstructions =
  mustElement<HTMLButtonElement>('btn-agent-instructions');
const elBtnToggleApps = mustElement<HTMLButtonElement>('btn-toggle-apps');
const elAppsContent = mustElement<HTMLElement>('apps-content');
const elBtnToggleFiles = mustElement<HTMLButtonElement>('btn-toggle-files');

const elSettingsModal = mustElement<HTMLElement>('settings-modal');
const elBtnCloseSettings =
  mustElement<HTMLButtonElement>('btn-close-settings');
const elBtnSaveSettings = mustElement<HTMLButtonElement>('btn-save-settings');
const elBtnCancelSettings =
  mustElement<HTMLButtonElement>('btn-cancel-settings');
const elApiKeyInput = mustElement<HTMLInputElement>('api-key-input');
const elModelSelect = mustElement<HTMLSelectElement>('model-select');
const elMaxToolStepsInput =
  mustElement<HTMLInputElement>('max-tool-steps-input');

const elNameModal = mustElement<HTMLElement>('name-modal');
const elNameModalTitle = mustElement<HTMLElement>('name-modal-title');
const elAppNameInput = mustElement<HTMLInputElement>('app-name-input');
const elBtnConfirmName = mustElement<HTMLButtonElement>('btn-confirm-name');
const elBtnCancelName = mustElement<HTMLButtonElement>('btn-cancel-name');
const elBtnCloseNameModal =
  mustElement<HTMLButtonElement>('btn-close-name-modal');

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

function requireCurrentAppId(): string {
  if (state.currentAppId === null) {
    throw new Error('No active app. Create or open an app first.');
  }

  return state.currentAppId;
}

async function listFilesetTool(): Promise<string[]> {
  return [...state.files]
    .map(file => file.name)
    .sort((left, right) => left.localeCompare(right));
}

async function readFileTool(path: string): Promise<string> {
  const file = state.files.find(item => item.name === path);

  if (file === undefined) {
    throw new Error(`File not found: ${path}`);
  }

  return file.content;
}

async function setFileContentTool(
  path: string,
  content: string,
): Promise<void> {
  const appId = requireCurrentAppId();

  const existing = state.files.find(item => item.name === path);

  if (existing !== undefined) {
    const updated: FileRecord = {
      ...existing,
      content,
    };

    await saveFile(updated);
    state.files = state.files.map(item =>
      item.id === updated.id
? updated
: item,
    );
    state.activeFileName = updated.name;
    return;
  }

  const created: FileRecord = {
    id: randomId(),
    appId,
    name: path,
    content,
  };

  await saveFile(created);
  state.files = [...state.files, created];
  state.activeFileName = created.name;
}

async function deleteFileTool(path: string): Promise<void> {
  const file = state.files.find(item => item.name === path);

  if (file === undefined) {
    return;
  }

  await deleteFile(file.id);

  const remaining = state.files.filter(item => item.id !== file.id);
  state.files = remaining;

  if (state.activeFileName === path) {
    state.activeFileName = remaining[0]?.name ?? null;
  }
}

async function replaceFilePartTool(
  path: string,
  search: string,
  replacement: string,
  replaceAll = false,
): Promise<void> {
  if (search === '') {
    throw new Error('Search text cannot be empty.');
  }

  const original = await readFileTool(path);

  if (!original.includes(search)) {
    throw new Error(`Search text not found in ${path}.`);
  }

  let next = original;

  if (replaceAll) {
    next = original.split(search).join(replacement);
  } else {
    const firstIndex = original.indexOf(search);
    const secondIndex = original.indexOf(search, firstIndex + search.length);

    if (secondIndex !== -1) {
      throw new Error(
        'Search text is ambiguous. Use replaceAll=true or provide a more specific search block.',
      );
    }

    next =
      original.slice(0, firstIndex)
      + replacement
      + original.slice(firstIndex + search.length);
  }

  await setFileContentTool(path, next);
}

async function evalInAppTool(code: string): Promise<unknown> {
  if (state.files.length === 0) {
    throw new Error('No files available to run.');
  }

  handleRun();

  try {
    return await evaluateInPreview(elPreviewFrame, code);
  } catch {
    // Retry once after a second run to handle initial iframe startup timing.
    handleRun();
    return evaluateInPreview(elPreviewFrame, code);
  }
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
  }
}

function renderAppList(): void {
  elAppList.replaceChildren();

  const apps = [...state.apps].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  for (const app of apps) {
    const item = document.createElement('div');
    item.className =
      'app-item' + (app.id === state.currentAppId
? ' active'
: '');
    item.dataset.id = app.id;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'app-item-name';
    nameSpan.textContent = app.name;

    item.appendChild(nameSpan);
    item.addEventListener('click', () => {
      void openApp(app.id);
    });

    elAppList.appendChild(item);
  }
}

function renderWorkspace(): void {
  const app = state.apps.find(item => item.id === state.currentAppId);

  if (app === undefined) {
    elEmptyState.classList.remove('hidden');
    elAppWorkspace.classList.add('hidden');
    return;
  }

  elEmptyState.classList.add('hidden');
  elAppWorkspace.classList.remove('hidden');
  elAppNameDisplay.textContent = app.name;

  renderFileSelect();
  renderFileContent();
}

function renderFileSelect(): void {
  elFileSelect.replaceChildren();

  if (state.files.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No files';
    elFileSelect.appendChild(option);
    elFileSelect.value = '';
    elFileSelect.disabled = true;
    return;
  }

  for (const file of state.files) {
    const option = document.createElement('option');
    option.value = file.name;
    option.textContent = file.name;
    elFileSelect.appendChild(option);
  }

  const active = state.activeFileName ?? state.files[0].name;
  elFileSelect.value = active;
  elFileSelect.disabled = false;
}

function renderFileContent(): void {
  const file = state.files.find(item => item.name === state.activeFileName);
  elFileContent.value = file?.content ?? '';
  elFileContent.disabled = file === undefined;
}

function setGenerating(value: boolean): void {
  state.generating = value;
  elBtnGenerate.disabled = value;
  elBtnGenerate.innerHTML = value
    ? '<span class="spinner"></span> Generating…'
    : 'Generate';
}

function setChatProgress(message: string, visible: boolean): void {
  elChatProgress.textContent = message;
  elChatProgress.classList.toggle('hidden', !visible);
}

function appendChatMessage(role: 'user' | 'assistant', text: string): void {
  const msg = document.createElement('div');
  msg.className = `chat-msg ${role}`;

  const roleLabel = document.createElement('div');
  roleLabel.className = 'chat-msg-role';
  roleLabel.textContent = role === 'user'
? 'You'
: 'Assistant';

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;

  msg.appendChild(roleLabel);
  msg.appendChild(bubble);
  elChatMessages.appendChild(msg);
  elChatMessages.scrollTop = elChatMessages.scrollHeight;
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

    const result = await generateApp(prompt, apiKey, model, {
      listFileset: listFilesetTool,
      readFile: readFileTool,
      setFileContent: setFileContentTool,
      replaceFilePart: replaceFilePartTool,
      deleteFile: deleteFileTool,
      evalInApp: evalInAppTool,
    }, {
      initialToolStepLimit: maxToolSteps,
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
    renderPreview(elPreviewFrame, state.files);
  });
}

async function handleExport(): Promise<void> {
  const app = state.apps.find(item => item.id === state.currentAppId);

  if (app === undefined) {
    return;
  }

  await persistCurrentFile();

  const payload = {
    app,
    files: state.files,
    exportedAt: now(),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${app.name.replace(/\s+/g, '-')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function handleImportClick(): void {
  elImportFile.value = '';
  elImportFile.click();
}

type ImportedPayload = {
  app: Partial<AppRecord> & { name: string };
  files: Array<Partial<FileRecord> & { name: string; content: string }>;
};

async function handleImportFile(): Promise<void> {
  const file = elImportFile.files?.[0];

  if (file === undefined) {
    return;
  }

  try {
    const text = await file.text();
    const payload = JSON.parse(text) as ImportedPayload;

    if (
      payload.app === undefined
      || typeof payload.app.name !== 'string'
      || !Array.isArray(payload.files)
    ) {
      throw new Error('Invalid app JSON format.');
    }

    const newId = randomId();
    const app: AppRecord = {
      id: newId,
      name: `${payload.app.name} (imported)`,
      createdAt: payload.app.createdAt ?? now(),
      updatedAt: now(),
    };

    const files: FileRecord[] = payload.files
      .filter(
        item =>
          typeof item.name === 'string' && typeof item.content === 'string',
      )
      .map(item => ({
        id: randomId(),
        appId: newId,
        name: item.name,
        content: item.content,
      }));

    await saveApp(app);
    await replaceFiles(newId, files);

    state.apps = [...state.apps, app];
    await openApp(newId);
  } catch (error) {
    const message = error instanceof Error
? error.message
: String(error);
    alert(`Import failed: ${message}`);
  }
}

function openSettings(): void {
  elApiKeyInput.value = getApiKey();
  elModelSelect.value = getModel();
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

  const parsed = Number.parseInt(elMaxToolStepsInput.value, 10);
  settings.maxToolSteps = Number.isFinite(parsed) && parsed >= 1
    ? parsed
    : DEFAULT_MAX_TOOL_STEPS;

  saveSettings(settings);
  closeSettings();
}

function openAgentInstructions(): void {
  elAgentInstructionsText.value = getSystemPrompt();
  elAgentInstructionsModal.classList.remove('hidden');
  elAgentInstructionsText.scrollTop = 0;
}

function closeAgentInstructions(): void {
  elAgentInstructionsModal.classList.add('hidden');
}

function setCollapsed(
  button: HTMLButtonElement,
  target: HTMLElement,
  collapsed: boolean,
): void {
  button.textContent = collapsed
    ? '▸'
    : '▾';
  button.setAttribute('aria-expanded', collapsed
    ? 'false'
    : 'true');

  target.classList.toggle('collapsed', collapsed);
}

function toggleAppsCollapsed(): void {
  const collapsed = !elAppsContent.classList.contains('collapsed');
  setCollapsed(elBtnToggleApps, elAppsContent, collapsed);
}

function toggleFilesCollapsed(): void {
  const collapsed = !elEditorLayout.classList.contains('collapsed');
  setCollapsed(elBtnToggleFiles, elEditorLayout, collapsed);
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
elBtnNewApp2.addEventListener('click', promptNewApp);
elBtnRename.addEventListener('click', promptRenameApp);
elBtnDeleteApp.addEventListener('click', () => {
  void confirmDeleteApp();
});
elBtnExport.addEventListener('click', () => {
  void handleExport();
});
elBtnGenerate.addEventListener('click', () => {
  void handleGenerate();
});
elBtnRun.addEventListener('click', handleRun);
elBtnRefreshPreview.addEventListener('click', handleRun);
elBtnSettings.addEventListener('click', openSettings);
elBtnAgentInstructions.addEventListener('click', openAgentInstructions);
elBtnToggleApps.addEventListener('click', toggleAppsCollapsed);
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

elBtnConfirmName.addEventListener('click', () => {});
elBtnCancelName.addEventListener('click', closeNameModal);
elBtnCloseNameModal.addEventListener('click', closeNameModal);
elNameModal.addEventListener('click', (event: MouseEvent) => {
  if (event.target === elNameModal) {
    closeNameModal();
  }
});

elAppNameInput.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    elBtnConfirmName.click();
  }
});

elChatInput.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    void handleGenerate();
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

const btnImport = document.createElement('button');
btnImport.className = 'btn btn-ghost btn-full';
btnImport.textContent = '↑ Import';
btnImport.addEventListener('click', handleImportClick);

const sidebarFooter = document.querySelector('.sidebar-footer');
const settingsButton = document.getElementById('btn-settings');

if (sidebarFooter !== null && settingsButton !== null) {
  sidebarFooter.insertBefore(btnImport, settingsButton);
}

window.listFileset = listFilesetTool;
window.readFile = readFileTool;
window.setFileContent = setFileContentTool;
window.replaceFilePart = replaceFilePartTool;
window.deleteFile = deleteFileTool;
window.evalInApp = evalInAppTool;

async function init(): Promise<void> {
  const apps = await listApps();
  state.apps = apps;

  if (apps.length > 0) {
    const sorted = [...apps].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );

    await openApp(sorted[0].id);
  } else {
    renderWorkspace();
  }
}

init().catch(error => {
  console.error('App Builder init failed:', error);
});
