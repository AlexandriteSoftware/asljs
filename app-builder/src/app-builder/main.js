/**
 * ASLJS App Builder — main entry point.
 *
 * Wires together state (asljs-observable), storage (asljs-dali via IndexedDB),
 * AI generation, and the preview sandbox.
 */

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

// ── Helpers ────────────────────────────────────────────────

function randomId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

// ── DOM refs ───────────────────────────────────────────────

const elAppList = /** @type {HTMLElement} */ (document.getElementById('app-list'));
const elEmptyState = /** @type {HTMLElement} */ (document.getElementById('empty-state'));
const elAppWorkspace = /** @type {HTMLElement} */ (document.getElementById('app-workspace'));
const elAppNameDisplay = /** @type {HTMLElement} */ (document.getElementById('app-name-display'));
const elFileTabs = /** @type {HTMLElement} */ (document.getElementById('file-tabs'));
const elFileContent = /** @type {HTMLTextAreaElement} */ (document.getElementById('file-content'));
const elChatMessages = /** @type {HTMLElement} */ (document.getElementById('chat-messages'));
const elChatInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('chat-input'));
const elBtnGenerate = /** @type {HTMLButtonElement} */ (document.getElementById('btn-generate'));
const elBtnRun = /** @type {HTMLButtonElement} */ (document.getElementById('btn-run'));
const elBtnRefreshPreview = /** @type {HTMLButtonElement} */ (document.getElementById('btn-refresh-preview'));
const elPreviewFrame = /** @type {HTMLIFrameElement} */ (document.getElementById('preview-frame'));
const elBtnNewApp = /** @type {HTMLButtonElement} */ (document.getElementById('btn-new-app'));
const elBtnNewApp2 = /** @type {HTMLButtonElement} */ (document.getElementById('btn-new-app-2'));
const elBtnRename = /** @type {HTMLButtonElement} */ (document.getElementById('btn-rename'));
const elBtnDeleteApp = /** @type {HTMLButtonElement} */ (document.getElementById('btn-delete-app'));
const elBtnExport = /** @type {HTMLButtonElement} */ (document.getElementById('btn-export'));
const elBtnSettings = /** @type {HTMLButtonElement} */ (document.getElementById('btn-settings'));

const elSettingsModal = /** @type {HTMLElement} */ (document.getElementById('settings-modal'));
const elBtnCloseSettings = /** @type {HTMLButtonElement} */ (document.getElementById('btn-close-settings'));
const elBtnSaveSettings = /** @type {HTMLButtonElement} */ (document.getElementById('btn-save-settings'));
const elBtnCancelSettings = /** @type {HTMLButtonElement} */ (document.getElementById('btn-cancel-settings'));
const elApiKeyInput = /** @type {HTMLInputElement} */ (document.getElementById('api-key-input'));

const elNameModal = /** @type {HTMLElement} */ (document.getElementById('name-modal'));
const elNameModalTitle = /** @type {HTMLElement} */ (document.getElementById('name-modal-title'));
const elAppNameInput = /** @type {HTMLInputElement} */ (document.getElementById('app-name-input'));
const elBtnConfirmName = /** @type {HTMLButtonElement} */ (document.getElementById('btn-confirm-name'));
const elBtnCancelName = /** @type {HTMLButtonElement} */ (document.getElementById('btn-cancel-name'));
const elBtnCloseNameModal = /** @type {HTMLButtonElement} */ (document.getElementById('btn-close-name-modal'));

const elImportFile = /** @type {HTMLInputElement} */ (document.getElementById('import-file'));

// ── Settings (localStorage) ────────────────────────────────

const SETTINGS_KEY = 'asljs-app-builder-settings';

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function getApiKey() {
  return loadSettings().apiKey ?? '';
}

// ── Render: app list ───────────────────────────────────────

function renderAppList() {
  elAppList.innerHTML = '';

  const apps = [ ...state.apps ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  for (const app of apps) {
    const item = document.createElement('div');
    item.className =
      'app-item'
      + (app.id === state.currentAppId ? ' active' : '');
    item.dataset.id = app.id;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'app-item-name';
    nameSpan.textContent = app.name;

    item.appendChild(nameSpan);

    item.addEventListener('click', () => {
      openApp(app.id);
    });

    elAppList.appendChild(item);
  }
}

// ── Render: workspace ──────────────────────────────────────

function renderWorkspace() {
  const app =
    state.apps.find(a => a.id === state.currentAppId);

  if (!app) {
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

function renderFileTabs() {
  elFileTabs.innerHTML = '';

  for (const file of state.files) {
    const tab = document.createElement('div');
    tab.className =
      'file-tab'
      + (file.name === state.activeFileName ? ' active' : '');
    tab.textContent = file.name;

    tab.addEventListener('click', () => {
      // Save current file before switching
      persistCurrentFile();
      state.activeFileName = file.name;
    });

    elFileTabs.appendChild(tab);
  }
}

function renderFileContent() {
  const file =
    state.files.find(f => f.name === state.activeFileName);

  elFileContent.value = file?.content ?? '';
  elFileContent.disabled = !file;
}

// ── Render: generating indicator ──────────────────────────

function setGenerating(value) {
  state.generating = value;
  elBtnGenerate.disabled = value;
  elBtnGenerate.innerHTML =
    value
      ? '<span class="spinner"></span> Generating…'
      : 'Generate';
}

// ── Chat messages ─────────────────────────────────────────

function appendChatMessage(role, text) {
  const msg = document.createElement('div');
  msg.className = `chat-msg ${role}`;

  const roleLabel = document.createElement('div');
  roleLabel.className = 'chat-msg-role';
  roleLabel.textContent = role === 'user' ? 'You' : 'Assistant';

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;

  msg.appendChild(roleLabel);
  msg.appendChild(bubble);
  elChatMessages.appendChild(msg);
  elChatMessages.scrollTop = elChatMessages.scrollHeight;
}

// ── Persist file content ───────────────────────────────────

async function persistCurrentFile() {
  if (!state.activeFileName || !state.currentAppId) {
    return;
  }

  const file =
    state.files.find(f => f.name === state.activeFileName);

  if (!file) {
    return;
  }

  const newContent = elFileContent.value;

  if (file.content === newContent) {
    return;
  }

  file.content = newContent;
  await saveFile(file);
}

// ── Open app ───────────────────────────────────────────────

async function openApp(id) {
  state.currentAppId = id;

  const files = await listFiles(id);
  state.files = files;
  state.activeFileName = files[0]?.name ?? null;

  // Clear chat when switching apps
  elChatMessages.innerHTML = '';
}

// ── Create app ─────────────────────────────────────────────

function promptNewApp() {
  elNameModalTitle.textContent = 'New App';
  elAppNameInput.value = '';
  elNameModal.classList.remove('hidden');
  elAppNameInput.focus();

  elBtnConfirmName.onclick = async () => {
    const name = elAppNameInput.value.trim();

    if (!name) {
      return;
    }

    elNameModal.classList.add('hidden');

    const app = {
      id: randomId(),
      name,
      createdAt: now(),
      updatedAt: now(),
    };

    await saveApp(app);
    state.apps = [ ...state.apps, app ];
    await openApp(app.id);
  };
}

function closeNameModal() {
  elNameModal.classList.add('hidden');
  elBtnConfirmName.onclick = null;
}

// ── Rename app ─────────────────────────────────────────────

function promptRenameApp() {
  const app =
    state.apps.find(a => a.id === state.currentAppId);

  if (!app) {
    return;
  }

  elNameModalTitle.textContent = 'Rename App';
  elAppNameInput.value = app.name;
  elNameModal.classList.remove('hidden');
  elAppNameInput.focus();
  elAppNameInput.select();

  elBtnConfirmName.onclick = async () => {
    const name = elAppNameInput.value.trim();

    if (!name) {
      return;
    }

    elNameModal.classList.add('hidden');

    const updated = { ...app, name, updatedAt: now() };
    await saveApp(updated);
    state.apps =
      state.apps.map(a =>
        a.id === app.id
          ? updated
          : a);
  };
}

// ── Delete app ─────────────────────────────────────────────

async function confirmDeleteApp() {
  const app =
    state.apps.find(a => a.id === state.currentAppId);

  if (!app) {
    return;
  }

  if (!confirm(`Delete "${app.name}"? This cannot be undone.`)) {
    return;
  }

  await deleteApp(app.id);
  state.apps = state.apps.filter(a => a.id !== app.id);
  state.currentAppId = null;
  state.files = [];
  state.activeFileName = null;
  elChatMessages.innerHTML = '';
  elPreviewFrame.src = 'about:blank';
}

// ── Generate ───────────────────────────────────────────────

async function handleGenerate() {
  const prompt = elChatInput.value.trim();

  if (!prompt) {
    return;
  }

  const apiKey = getApiKey();

  if (!apiKey) {
    appendChatMessage(
      'assistant',
      'No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.');
    return;
  }

  if (!state.currentAppId) {
    appendChatMessage(
      'assistant',
      'Please create or open an app first.');
    return;
  }

  elChatInput.value = '';
  appendChatMessage('user', prompt);
  setGenerating(true);

  try {
    const result = await generateApp(prompt, apiKey);

    const files = result.files.map(f => ({
      id: randomId(),
      appId: state.currentAppId,
      name: f.name,
      content: f.content,
    }));

    await replaceFiles(state.currentAppId, files);
    state.files = files;
    state.activeFileName = files[0]?.name ?? null;

    // Update app timestamp
    const app =
      state.apps.find(a => a.id === state.currentAppId);

    if (app) {
      const updated = { ...app, updatedAt: now() };
      await saveApp(updated);
      state.apps =
        state.apps.map(a =>
          a.id === app.id
            ? updated
            : a);
    }

    appendChatMessage(
      'assistant',
      `Generated ${files.length} file(s). ${result.description ?? ''}`);

    // Auto-run the preview
    renderPreview(elPreviewFrame, files);
  } catch (err) {
    appendChatMessage('assistant', `Error: ${err.message}`);
  } finally {
    setGenerating(false);
  }
}

// ── Run preview ────────────────────────────────────────────

function handleRun() {
  persistCurrentFile().then(() => {
    renderPreview(elPreviewFrame, state.files);
  });
}

// ── Export / Import ────────────────────────────────────────

async function handleExport() {
  const app =
    state.apps.find(a => a.id === state.currentAppId);

  if (!app) {
    return;
  }

  await persistCurrentFile();

  const payload = {
    app,
    files: state.files,
    exportedAt: now(),
  };

  const blob =
    new Blob(
      [ JSON.stringify(payload, null, 2) ],
      { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${app.name.replace(/\s+/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleImportClick() {
  elImportFile.value = '';
  elImportFile.click();
}

async function handleImportFile() {
  const file = elImportFile.files?.[0];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const payload = JSON.parse(text);

    if (!payload?.app || !Array.isArray(payload?.files)) {
      throw new Error('Invalid app JSON format.');
    }

    // Give the app a new ID to avoid collision
    const newId = randomId();
    const app = {
      ...payload.app,
      id: newId,
      name: `${payload.app.name} (imported)`,
      updatedAt: now(),
    };

    const files = payload.files.map(f => ({
      ...f,
      id: randomId(),
      appId: newId,
    }));

    await saveApp(app);
    await replaceFiles(newId, files);

    state.apps = [ ...state.apps, app ];
    await openApp(newId);
  } catch (err) {
    alert(`Import failed: ${err.message}`);
  }
}

// ── Settings modal ─────────────────────────────────────────

function openSettings() {
  elApiKeyInput.value = getApiKey();
  elSettingsModal.classList.remove('hidden');
  elApiKeyInput.focus();
}

function closeSettings() {
  elSettingsModal.classList.add('hidden');
}

function saveSettingsFromModal() {
  const settings = loadSettings();
  settings.apiKey = elApiKeyInput.value.trim();
  saveSettings(settings);
  closeSettings();
}

// ── State subscriptions ────────────────────────────────────

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

// ── Event listeners ────────────────────────────────────────

elBtnNewApp.addEventListener('click', promptNewApp);
elBtnNewApp2.addEventListener('click', promptNewApp);
elBtnRename.addEventListener('click', promptRenameApp);
elBtnDeleteApp.addEventListener('click', confirmDeleteApp);
elBtnExport.addEventListener('click', handleExport);
elBtnGenerate.addEventListener('click', handleGenerate);
elBtnRun.addEventListener('click', handleRun);
elBtnRefreshPreview.addEventListener('click', handleRun);
elBtnSettings.addEventListener('click', openSettings);

elBtnCloseSettings.addEventListener('click', closeSettings);
elBtnSaveSettings.addEventListener('click', saveSettingsFromModal);
elBtnCancelSettings.addEventListener('click', closeSettings);
elSettingsModal.addEventListener('click', e => {
  if (e.target === elSettingsModal) {
    closeSettings();
  }
});

elBtnConfirmName.addEventListener('click', () => {});
elBtnCancelName.addEventListener('click', closeNameModal);
elBtnCloseNameModal.addEventListener('click', closeNameModal);
elNameModal.addEventListener('click', e => {
  if (e.target === elNameModal) {
    closeNameModal();
  }
});

elAppNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    elBtnConfirmName.click();
  }
});

elChatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleGenerate();
  }
});

elFileContent.addEventListener('blur', () => {
  persistCurrentFile();
});

elBtnExport.addEventListener('click', handleExport);
elImportFile.addEventListener('change', handleImportFile);

// Add import button to sidebar footer
const btnImport = document.createElement('button');
btnImport.className = 'btn btn-ghost btn-full';
btnImport.textContent = '↑ Import';
btnImport.addEventListener('click', handleImportClick);
document.querySelector('.sidebar-footer').insertBefore(
  btnImport,
  document.getElementById('btn-settings'));

// ── Init ───────────────────────────────────────────────────

async function init() {
  const apps = await listApps();
  state.apps = apps;

  // Auto-open most recently updated app
  if (apps.length > 0) {
    const sorted = [ ...apps ]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    await openApp(sorted[0].id);
  } else {
    renderWorkspace();
  }
}

init().catch(err => {
  console.error('App Builder init failed:', err);
});
