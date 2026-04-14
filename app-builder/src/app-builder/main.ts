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
  getPreviewDiagnostics,
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
const elBtnExport = mustElement<HTMLButtonElement>('btn-export');
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
const elBtnSaveProjectSettings =
  mustElement<HTMLButtonElement>('btn-save-project-settings');
const elBtnDeleteProject = mustElement<HTMLButtonElement>('btn-delete-project');
const elBtnCloseProjectSettings =
  mustElement<HTMLButtonElement>('btn-close-project-settings');
const elBtnCloseProjectSettingsX =
  mustElement<HTMLButtonElement>('btn-close-project-settings-x');

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

function requireCurrentAppId(): string {
  if (state.currentAppId === null) {
    throw new Error('No active app. Create or open an app first.');
  }

  return state.currentAppId;
}

function normalizeToolPath(path: string): string {
  const normalized = path
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '');

  if (normalized === '') {
    throw new Error('Path cannot be empty.');
  }

  if (normalized.includes('..')) {
    throw new Error('Parent path segments are not allowed.');
  }

  return normalized;
}

function resolveExistingPath(path: string): string | null {
  const normalizedPath = normalizeToolPath(path);

  const found = state.files.find(item =>
    normalizeToolPath(item.name).toLowerCase() === normalizedPath.toLowerCase(),
  );

  return found?.name ?? null;
}

async function listFilesetTool(): Promise<string[]> {
  return [...state.files]
    .map(file => file.name)
    .sort((left, right) => left.localeCompare(right));
}

async function readFileTool(path: string): Promise<string> {
  const resolvedPath = resolveExistingPath(path);

  const file = resolvedPath === null
    ? undefined
    : state.files.find(item => item.name === resolvedPath);

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
  const normalizedPath = normalizeToolPath(path);
  const resolvedPath = resolveExistingPath(normalizedPath);

  const existing = state.files.find(item => item.name === (resolvedPath ?? normalizedPath));

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
    name: normalizedPath,
    content,
  };

  await saveFile(created);
  state.files = [...state.files, created];
  state.activeFileName = created.name;
}

async function deleteFileTool(path: string): Promise<void> {
  const resolvedPath = resolveExistingPath(path);
  const file = resolvedPath === null
    ? undefined
    : state.files.find(item => item.name === resolvedPath);

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

  const resolvedPath = resolveExistingPath(path);

  if (resolvedPath === null) {
    throw new Error(`File not found: ${path}`);
  }

  const original = await readFileTool(resolvedPath);

  if (!original.includes(search)) {
    throw new Error(`Search text not found in ${resolvedPath}.`);
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

  await setFileContentTool(resolvedPath, next);
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

async function getAppDiagnosticsTool(): Promise<unknown> {
  return getPreviewDiagnostics(elPreviewFrame);
}

async function runAppAndCollectDiagnosticsTool(): Promise<unknown> {
  handleRun();
  await wait(350);
  return getPreviewDiagnostics(elPreviewFrame);
}

function wait(milliseconds: number): Promise<void> {
  return new Promise(resolve => {
    window.setTimeout(resolve, milliseconds);
  });
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

function renderAppList(): void {
  elAppSelect.replaceChildren();

  const apps = [...state.apps].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  for (const app of apps) {
    const option = document.createElement('option');
    option.value = app.id;
    option.textContent = app.name;
    elAppSelect.appendChild(option);
  }

  if (apps.length > 0) {
    const separator = document.createElement('option');
    separator.value = '__separator__';
    separator.textContent = '────────';
    separator.disabled = true;
    elAppSelect.appendChild(separator);
  }

  const newOption = document.createElement('option');
  newOption.value = APP_ACTION_NEW;
  newOption.textContent = 'New...';
  elAppSelect.appendChild(newOption);

  const importOption = document.createElement('option');
  importOption.value = APP_ACTION_IMPORT;
  importOption.textContent = 'Import...';
  elAppSelect.appendChild(importOption);

  if (state.currentAppId !== null) {
    elAppSelect.value = state.currentAppId;
  }
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
    name,
    createdAt: now(),
    updatedAt: now(),
  };

  await saveApp(app);
  state.apps = [...state.apps, app];
  await openApp(app.id);
}

async function createTodoSampleAppFromForm(): Promise<void> {
  const rawName = elFirstAppNameInput.value.trim();
  const name = rawName === ''
    ? 'TODO Sample'
    : rawName;

  const apiKey = elFirstApiKeyInput.value.trim();

  if (apiKey !== '') {
    const settings = loadSettings();
    settings.apiKey = apiKey;
    saveSettings(settings);
  }

  const appId = randomId();

  const app: AppRecord = {
    id: appId,
    name,
    createdAt: now(),
    updatedAt: now(),
  };

  const files = buildTodoSampleFiles(appId);

  await saveApp(app);
  await replaceFiles(appId, files);

  state.apps = [...state.apps, app];
  await openApp(appId);
}

function buildTodoSampleFiles(appId: string): FileRecord[] {
  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TODO Sample</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main class="app">
    <h1>TODO Sample</h1>
    <form id="todo-form">
      <input id="todo-input" type="text" placeholder="What needs doing?" required />
      <button type="submit">Add</button>
    </form>
    <section class="list-section">
      <h2>Todo</h2>
      <ul id="todo-list" class="todo-list"></ul>
    </section>
    <section class="list-section">
      <h2>Done</h2>
      <ul id="done-list" class="todo-list"></ul>
    </section>
  </main>
  <script type="module" src="app.js"></script>
</body>
</html>`;

  const styleCss = `:root {
  color-scheme: light dark;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #0b1220;
  color: #e7edf7;
}

.app {
  max-width: 560px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #2b3954;
  border-radius: 8px;
  background: #121b2d;
}

#todo-form {
  display: flex;
  gap: 0.5rem;
}

#todo-input {
  flex: 1;
  padding: 0.5rem;
}

.list-section {
  margin-top: 1rem;
}

.list-section h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.todo-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid #2b3954;
  border-radius: 6px;
  background: #0f1a2f;
}

.todo-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.todo-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.done .todo-text {
  text-decoration: line-through;
  opacity: 0.75;
}

.bin-btn {
  border: 1px solid #3b4e7a;
  background: transparent;
  color: #e7edf7;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
}

.check-btn {
  border: 1px solid #3b4e7a;
  background: #1b2b4b;
  color: #e7edf7;
  border-radius: 6px;
  padding: 0.35rem 0.55rem;
  cursor: pointer;
}

.todo-empty {
  color: #9fb2d8;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}`;

  const appJs = `const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');

if (!(form instanceof HTMLFormElement)
    || !(input instanceof HTMLInputElement)
    || !(list instanceof HTMLUListElement)
    || !(doneList instanceof HTMLUListElement))
{
  throw new Error('Missing TODO app elements.');
}

const state = {
  todos: [],
  done: [],
};

function uid() {
  return crypto.randomUUID();
}

function render() {
  list.replaceChildren();
  doneList.replaceChildren();

  for (const todo of state.todos) {
    const item = document.createElement('li');
    item.className = 'todo-item';

    const main = document.createElement('div');
    main.className = 'todo-main';

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const actions = document.createElement('div');

    const checkButton = document.createElement('button');
    checkButton.type = 'button';
    checkButton.className = 'check-btn';
    checkButton.textContent = '✓';
    checkButton.title = 'Mark done';
    checkButton.addEventListener('click', () => {
      state.todos = state.todos.filter(entry => entry.id !== todo.id);
      state.done.unshift(todo);
      render();
    });

    main.appendChild(checkButton);
    main.appendChild(text);

    const bin = document.createElement('button');
    bin.type = 'button';
    bin.className = 'bin-btn';
    bin.textContent = '🗑';
    bin.title = 'Delete todo';
    bin.addEventListener('click', () => {
      state.todos = state.todos.filter(entry => entry.id !== todo.id);
      render();
    });

    actions.appendChild(checkButton);
    actions.appendChild(bin);

    item.appendChild(main);
    item.appendChild(actions);
    list.appendChild(item);
  }

  for (const todo of state.done) {
    const item = document.createElement('li');
    item.className = 'todo-item done';

    const main = document.createElement('div');
    main.className = 'todo-main';

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    main.appendChild(text);

    const actions = document.createElement('div');

    const bin = document.createElement('button');
    bin.type = 'button';
    bin.className = 'bin-btn';
    bin.textContent = '🗑';
    bin.title = 'Delete todo';
    bin.addEventListener('click', () => {
      state.done = state.done.filter(entry => entry.id !== todo.id);
      render();
    });

    actions.appendChild(bin);

    item.appendChild(main);
    item.appendChild(actions);
    doneList.appendChild(item);
  }

  if (state.todos.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'todo-empty';
    empty.textContent = 'No active TODO items.';
    list.appendChild(empty);
  }

  if (state.done.length === 0) {
    const emptyDone = document.createElement('li');
    emptyDone.className = 'todo-empty';
    emptyDone.textContent = 'No completed TODO items yet.';
    doneList.appendChild(emptyDone);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === '') {
    return;
  }

  state.todos.unshift({
    id: uid(),
    text,
  });
  input.value = '';
  input.focus();
  render();
});

render();`;

  const packageJson = `{
  "name": "todo-sample",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "echo \"Open index.html in a browser\""
  }
}`;

  const readme = `# TODO Sample

Simple TODO sample application.

## Usage

Open index.html and add items using the input.

## Behavior

- Add TODO item on submit.
- Active TODO items show Check and Bin actions.
- Clicking Check moves an item immediately to Done.
- Each item has a bin icon to delete it.
`;

  return [
    {
      id: randomId(),
      appId,
      name: 'index.html',
      content: indexHtml,
    },
    {
      id: randomId(),
      appId,
      name: 'style.css',
      content: styleCss,
    },
    {
      id: randomId(),
      appId,
      name: 'app.js',
      content: appJs,
    },
    {
      id: randomId(),
      appId,
      name: 'package.json',
      content: packageJson,
    },
    {
      id: randomId(),
      appId,
      name: 'README.md',
      content: readme,
    },
  ];
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
    ? '<span class="spinner"></span> Sending…'
    : 'Send';
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

function openProjectSettings(): void {
  const app = state.apps.find(item => item.id === state.currentAppId);

  if (app === undefined) {
    return;
  }

  elProjectNameInput.value = app.name;
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

  const updated: AppRecord = {
    ...app,
    name,
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

    const result = await generateApp(prompt, apiKey, model, {
      listFileset: listFilesetTool,
      readFile: readFileTool,
      setFileContent: setFileContentTool,
      replaceFilePart: replaceFilePartTool,
      deleteFile: deleteFileTool,
      evalInApp: evalInAppTool,
      getAppDiagnostics: getAppDiagnosticsTool,
      runAppAndCollectDiagnostics: runAppAndCollectDiagnosticsTool,
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
    renderPreview(elPreviewFrame, state.files, {
      hostOpenAiApiKey: getApiKey(),
    });
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
  elAgentInstructionsText.value = getSystemPrompt();
  elAgentInstructionsModal.classList.remove('hidden');
  elAgentInstructionsText.scrollTop = 0;
}

function closeAgentInstructions(): void {
  elAgentInstructionsModal.classList.add('hidden');
}

function toggleAppsCollapsed(): void {
  const collapsed = !elPanelChat.classList.contains('collapsed');

  elBtnToggleChat.textContent = collapsed
    ? 'Chat ▸'
    : 'Chat ▾';
  elBtnToggleChat.setAttribute('aria-expanded', collapsed
    ? 'false'
    : 'true');

  elPanelChat.classList.toggle('collapsed', collapsed);
  elPanels.classList.toggle('chat-collapsed', collapsed);
}

function toggleFilesCollapsed(): void {
  const collapsed = !elPanelEditor.classList.contains('collapsed');

  elBtnToggleFiles.textContent = collapsed
    ? 'Files ▸'
    : 'Files ▾';
  elBtnToggleFiles.setAttribute('aria-expanded', collapsed
    ? 'false'
    : 'true');

  elPanelEditor.classList.toggle('collapsed', collapsed);
  elPanels.classList.toggle('files-collapsed', collapsed);
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

window.listFileset = listFilesetTool;
window.readFile = readFileTool;
window.setFileContent = setFileContentTool;
window.replaceFilePart = replaceFilePartTool;
window.deleteFile = deleteFileTool;
window.evalInApp = evalInAppTool;
window.getAppDiagnostics = getAppDiagnosticsTool;
window.runAppAndCollectDiagnostics = runAppAndCollectDiagnosticsTool;

async function init(): Promise<void> {
  applyAppearanceSettings();

  const apps = await listApps();
  state.apps = apps;

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
