import { state } from './state.js';
import {
  listApps,
  saveApp,
  deleteApp,
  listFiles,
  saveFile,
  replaceFiles,
} from './storage.js';
import { generateApp } from './ai.js';
import { renderPreview } from './preview.js';
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
const elFileTabs = mustElement<HTMLElement>('file-tabs');
const elFileContent = mustElement<HTMLTextAreaElement>('file-content');
const elChatMessages = mustElement<HTMLElement>('chat-messages');
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

const elSettingsModal = mustElement<HTMLElement>('settings-modal');
const elBtnCloseSettings =
  mustElement<HTMLButtonElement>('btn-close-settings');
const elBtnSaveSettings = mustElement<HTMLButtonElement>('btn-save-settings');
const elBtnCancelSettings =
  mustElement<HTMLButtonElement>('btn-cancel-settings');
const elApiKeyInput = mustElement<HTMLInputElement>('api-key-input');

const elNameModal = mustElement<HTMLElement>('name-modal');
const elNameModalTitle = mustElement<HTMLElement>('name-modal-title');
const elAppNameInput = mustElement<HTMLInputElement>('app-name-input');
const elBtnConfirmName = mustElement<HTMLButtonElement>('btn-confirm-name');
const elBtnCancelName = mustElement<HTMLButtonElement>('btn-cancel-name');
const elBtnCloseNameModal =
  mustElement<HTMLButtonElement>('btn-close-name-modal');

const elImportFile = mustElement<HTMLInputElement>('import-file');

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

  renderFileTabs();
  renderFileContent();
}

function renderFileTabs(): void {
  elFileTabs.replaceChildren();

  for (const file of state.files) {
    const tab = document.createElement('div');
    tab.className =
      'file-tab' + (file.name === state.activeFileName
? ' active'
: '');
    tab.textContent = file.name;

    tab.addEventListener('click', () => {
      void persistCurrentFile();
      state.activeFileName = file.name;
    });

    elFileTabs.appendChild(tab);
  }
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

  try {
    const result = await generateApp(prompt, apiKey);

    const files: FileRecord[] = result.files.map(file => ({
      id: randomId(),
      appId: state.currentAppId as string,
      name: file.name,
      content: file.content,
    }));

    await replaceFiles(state.currentAppId, files);

    state.files = files;
    state.activeFileName = files[0]?.name ?? null;

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
      `Generated ${files.length} file(s). ${result.description}`.trim(),
    );

    renderPreview(elPreviewFrame, files);
  } catch (error) {
    const message = error instanceof Error
? error.message
: String(error);
    appendChatMessage('assistant', `Error: ${message}`);
  } finally {
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
  elSettingsModal.classList.remove('hidden');
  elApiKeyInput.focus();
}

function closeSettings(): void {
  elSettingsModal.classList.add('hidden');
}

function saveSettingsFromModal(): void {
  const settings = loadSettings();
  settings.apiKey = elApiKeyInput.value.trim();
  saveSettings(settings);
  closeSettings();
}

state.on('set:apps', () => renderAppList());
state.on('set:currentAppId', () => {
  renderAppList();
  renderWorkspace();
});
state.on('set:files', () => {
  renderFileTabs();
  renderFileContent();
});
state.on('set:activeFileName', () => {
  renderFileTabs();
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

elBtnCloseSettings.addEventListener('click', closeSettings);
elBtnSaveSettings.addEventListener('click', saveSettingsFromModal);
elBtnCancelSettings.addEventListener('click', closeSettings);
elSettingsModal.addEventListener('click', (event: MouseEvent) => {
  if (event.target === elSettingsModal) {
    closeSettings();
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
