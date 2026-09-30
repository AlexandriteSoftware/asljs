import {
  layout,
  layoutRows
} from './layout.js';

const GRID_STEP = 36;
const POLL_MS = 5000;
const CHART_POLL_MS = 60000;

const bar = document.querySelector('#tabs');
const grid = document.querySelector('#grid');

const state = {
  config: { tabs: [] },
  tab: location.hash.slice(1) || null,
  cards: [], // live cards on the active tab: { card, node, body, render, value }
  values: {},
  wakeLock: null
};

const renderers = new Map();

const loadRenderer = async name =>
{
  if (!renderers.has(name)) {
    renderers.set(
      name,
      import(`./renderers/${name}.js`).then(module => module.default)
    );
  }
  return renderers.get(name);
};

const parse = raw =>
{
  if (raw === null || raw === undefined) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const historyFor = key => async ({ limit = 200, since = 0 } = {}) =>
{
  const response = await fetch(
    `/api/history/${encodeURIComponent(key)}?limit=${limit}&since=${since}`
  );
  if (!response.ok) {
    throw new Error(`history ${response.status}`);
  }
  return response.json();
};

// --- cards -----------------------------------------------------------------

const buildCard = placed =>
{
  const { card } = placed;
  const node = document.createElement('article');
  node.className = 'card';
  node.style.setProperty('--left', placed.left);
  node.style.setProperty('--top', placed.top);
  node.style.setProperty('--width', placed.width);
  node.style.setProperty('--height', placed.height);

  const label = document.createElement('span');
  label.className = 'card-label';
  label.textContent = card.label || card.key || '';
  node.append(label);

  const body = document.createElement('div');
  body.className = 'card-body';
  node.append(body);

  return { card, node, body };
};

const fail = (body, message) =>
{
  body.replaceChildren();
  const note = document.createElement('p');
  note.className = 'card-error';
  note.textContent = message;
  body.append(note);
};

const paint = async (entry, value) =>
{
  const render = await loadRenderer(entry.card.render || 'value').catch(() =>
    null
  );
  if (typeof render !== 'function') {
    return fail(entry.body, `no renderer "${entry.card.render}"`);
  }

  try {
    render(entry.body, value, entry.card.params || {}, {
      key: entry.card.key,
      card: entry.card,
      history: entry.card.key
        ? historyFor(entry.card.key)
        : null
    });
  } catch (error) {
    fail(entry.body, error.message);
  }
};

// --- tabs and placement ----------------------------------------------------

const activeTab = () =>
  state.config.tabs.find(tab => tab.tab === state.tab)
  || state.config.tabs[0]
  || null;

const columns = () => Math.max(1, Math.floor(grid.clientWidth / GRID_STEP));

const buildTab = () =>
{
  const tab = activeTab();
  grid.replaceChildren();
  state.cards = [];

  if (!tab) {
    grid.append(Object.assign(document.createElement('p'), {
      className: 'empty',
      textContent: 'No tabs in dashboards.json'
    }));
    return;
  }

  state.tab = tab.tab;
  const placed = layout(tab.cards || [], columns());
  grid.style.setProperty('--rows', layoutRows(placed));

  for (const item of placed) {
    const entry = buildCard(item);
    grid.append(entry.node);
    state.cards.push(entry);
  }

  paintTabs();
  refresh(true);
};

const paintTabs = () =>
{
  bar.replaceChildren();
  for (const tab of state.config.tabs) {
    const link = document.createElement('a');
    link.href = `#${tab.tab}`;
    link.textContent = tab.label || tab.tab;
    link.className = tab.tab === state.tab
      ? 'tab tab-active'
      : 'tab';
    bar.append(link);
  }
};

// --- polling ---------------------------------------------------------------

const refresh = async (force = false) =>
{
  const keys = [
    ...new Set(state.cards.map(entry => entry.card.key).filter(Boolean))
  ];
  if (keys.length === 0) {
    return;
  }

  let values;
  try {
    const response = await fetch(
      `/api/get/${keys.map(encodeURIComponent).join(',')}`
    );
    if (!response.ok) {
      throw new Error(`get ${response.status}`);
    }
    // A single key returns text/plain; ask for a pair to keep the JSON shape.
    values = keys.length === 1
      ? { [keys[0]]: await response.text() }
      : await response.json();
  } catch (error) {
    console.error('refresh failed:', error);
    return;
  }

  for (const entry of state.cards) {
    const key = entry.card.key;
    const raw = key
      ? values[key] ?? null
      : null;
    const isChart = (entry.card.render || 'value') === 'chart';

    if (!force && !isChart && raw === state.values[key] && entry.painted) {
      continue;
    }

    entry.value = parse(raw);
    entry.painted = true;
    if (!isChart || force) {
      paint(entry, entry.value);
    }
  }

  Object.assign(state.values, values);
};

const refreshCharts = () =>
{
  for (const entry of state.cards) {
    if ((entry.card.render || 'value') === 'chart') {
      paint(entry, entry.value);
    }
  }
};

// --- wake lock -------------------------------------------------------------

const requestWakeLock = async () =>
{
  if (
    !('wakeLock' in navigator)
    || document.visibilityState !== 'visible'
    || state.wakeLock
  ) {
    return;
  }
  try {
    state.wakeLock = await navigator.wakeLock.request('screen');
    state.wakeLock.addEventListener('release', () =>
    {
      state.wakeLock = null;
    });
  } catch (error) {
    console.warn('screen wake lock unavailable:', error);
  }
};

// --- boot ------------------------------------------------------------------

const boot = async () =>
{
  try {
    const response = await fetch('/api/dashboards');
    state.config = await response.json();
    if (state.config.error) {
      throw new Error(state.config.error);
    }
  } catch (error) {
    grid.replaceChildren(Object.assign(document.createElement('p'), {
      className: 'card-error',
      textContent: `Cannot read dashboards.json: ${error.message}`
    }));
    return;
  }

  buildTab();

  setInterval(refresh, POLL_MS);
  setInterval(refreshCharts, CHART_POLL_MS);
  requestWakeLock();

  window.addEventListener('hashchange', () =>
  {
    state.tab = location.hash.slice(1) || null;
    buildTab();
  });

  let width = columns();
  window.addEventListener('resize', () =>
  {
    if (columns() !== width) {
      width = columns();
      buildTab();
    }
  });

  document.addEventListener('visibilitychange', requestWakeLock);
};

boot();
