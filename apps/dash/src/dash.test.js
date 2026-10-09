import {
  TmpGlobals
} from 'asljs-testing';
import {
  JSDOM
} from 'jsdom';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test, {
  mock
} from 'node:test';

// The page boots when it is imported, so each test loads a fresh copy of it, by
// a query string, into a document of its own built from the real index.html.
// Its polling intervals are mocked: they run only when a test advances them.

const HTML = fs.readFileSync(path.join(import.meta.dirname, 'index.html'), 'utf8');

const DASHBOARDS = {
  projects: [{ project: 'p', label: 'P' }, { project: 'q', label: 'Q' }],
  tabs: [
    {
      tab: 'main',
      label: 'Main',
      project: 'p',
      cards: [
        { key: 'a.value', label: 'A', render: 'value', params: { unit: '%' }, width: 4, height: 2 },
        { key: 'a.text', render: 'missing' },
        { label: 'No key', render: 'text' },
        { key: 'a.value', label: 'Again', left: 8, top: 0, width: 4, height: 2 }
      ]
    },
    {
      tab: 'second',
      project: 'q',
      cards: [{ key: 'b.status', render: 'status' }]
    }
  ],
  errors: []
};

let loads = 0;

/**
 * Boots a copy of the page against `routes`, a map of request path to a JSON
 * value, text, or an Error to fail with. Returns its document and the paths it
 * fetched.
 */
const boot = async (t, routes, { hash = '', width = 432 } = {}) =>
{
  const dom = new JSDOM(HTML, { url: `http://dash.test/${hash}` });
  const { window } = dom;
  Object.defineProperty(window.document.querySelector('#grid'), 'clientWidth', {
    value: width
  });

  const fetched = [];
  const fetch = async url =>
  {
    fetched.push(url);
    const route = routes[url];
    if (route instanceof Error) {
      throw route;
    }
    if (route === undefined) {
      return new Response('', { status: 404 });
    }
    return typeof route === 'string'
      ? new Response(route)
      : Response.json(route);
  };

  const globals = new TmpGlobals({
    window,
    document: window.document,
    location: window.location,
    navigator: window.navigator,
    fetch
  });
  mock.timers.enable({ apis: ['setInterval'] });
  t.mock.method(console, 'error', () =>
  {});

  t.after(() =>
  {
    mock.timers.reset();
    globals.restore();
    window.close();
  });

  loads += 1;
  await import(`./dash.js?load=${loads}`);

  return { document: window.document, fetched, window };
};

/** Lets the page's fetches and renderer imports settle. */
const settle = async () =>
{
  for (let turn = 0; turn < 20; turn += 1) {
    await new Promise(resolve => setImmediate(resolve));
  }
};

const MAIN = {
  '/api/dashboards': DASHBOARDS,
  '/api/get/a.value,a.text': { 'a.value': '41', 'a.text': 'x' },
  '/api/next/a.value,a.text': {
    'a.value': { state: 'wait', ms: 125000 },
    'a.text': { state: 'stale', ms: 9000 }
  }
};

test('the page shows the tabs of every project, the first active, and places its cards on the grid', async t =>
{
  const { document } = await boot(t, MAIN);
  await settle();

  assert.deepEqual(
    [...document.querySelectorAll('#tabs a')].map(link =>
      [link.getAttribute('href'), link.textContent, link.className]
    ),
    [['#main', 'Main', 'tab tab-active'], ['#second', 'second', 'tab']]
  );

  const cards = [...document.querySelectorAll('#grid .card')];
  assert.deepEqual(
    cards.map(card => card.querySelector('.card-title').textContent),
    ['A', 'a.text', 'No key', 'Again']
  );
  // 432px is twelve 36px steps: the anchored card keeps its place, the others
  // flow around it, and a card without geometry is six by six.
  assert.deepEqual(
    cards.map(card =>
      ['--left', '--top', '--width', '--height'].map(name => card.style.getPropertyValue(name))
    ),
    [['0', '0', '4', '2'], ['0', '2', '6', '6'], ['6', '2', '6', '6'], ['8', '0', '4', '2']]
  );
  assert.equal(document.querySelector('#grid').style.getPropertyValue('--rows'), '8');
});

test('the page reads the values and the countdowns of the active tab, each key once', async t =>
{
  const { document, fetched } = await boot(t, MAIN);
  await settle();

  assert.ok(fetched.includes('/api/get/a.value,a.text'));
  assert.ok(fetched.includes('/api/next/a.value,a.text'));

  const cards = [...document.querySelectorAll('#grid .card')];
  assert.equal(cards[0].querySelector('.card-body').textContent, '41%');
  // The same key on a card without a unit: the renderer is per card.
  assert.equal(cards[3].querySelector('.card-body').textContent, '41');

  // The countdown sits in the card's label row, after the title.
  assert.ok(cards.every(card => card.querySelector('.card-label > .card-title + .card-next')));
  assert.deepEqual(
    cards.map(card => {
      const next = card.querySelector('.card-next');
      return [next.textContent, next.className];
    }),
    [
      ['2m', 'card-next'],
      ['stale', 'card-next status-error'],
      ['', 'card-next'],
      ['2m', 'card-next']
    ]
  );
});

test('a card with a renderer that does not exist shows a placeholder, not an exception', async t =>
{
  const { document } = await boot(t, MAIN);
  await settle();

  const missing = document.querySelectorAll('#grid .card')[1];
  assert.equal(
    missing.querySelector('.card-error').textContent,
    'no renderer "missing"'
  );
});

test('the page polls the values every five seconds and repaints a card whose value changed', async t =>
{
  const routes = { ...MAIN };
  const { document } = await boot(t, routes);
  await settle();

  routes['/api/get/a.value,a.text'] = { 'a.value': '42', 'a.text': 'x' };
  routes['/api/next/a.value,a.text'] = {
    'a.value': { state: 'due', ms: 1000 },
    'a.text': { state: 'wait', ms: 3 * 3600 * 1000 + 5000 }
  };
  mock.timers.tick(5000);
  await settle();

  const cards = [...document.querySelectorAll('#grid .card')];
  assert.equal(cards[0].querySelector('.card-body').textContent, '42%');
  assert.deepEqual(
    cards.slice(0, 2).map(card => card.querySelector('.card-next').textContent),
    ['due', '3h']
  );
  assert.equal(cards[0].querySelector('.card-next').className, 'card-next status-warn');

  routes['/api/next/a.value,a.text'] = {
    'a.value': { state: 'wait', ms: 45000 },
    'a.text': { state: 'wait', ms: 59 * 60 * 1000 }
  };
  mock.timers.tick(5000);
  await settle();
  assert.deepEqual(
    cards.slice(0, 2).map(card => card.querySelector('.card-next').textContent),
    ['45s', '59m']
  );
});

test('a card whose value did not change is not drawn again', async t =>
{
  const { document } = await boot(t, MAIN);
  await settle();

  const hero = document.querySelector('#grid .card .hero-number');
  mock.timers.tick(5000);
  await settle();

  assert.equal(document.querySelector('#grid .card .hero-number'), hero);
});

test('a renderer gets the value parsed when it is JSON, and as text when it is not', async t =>
{
  const { document } = await boot(t, {
    '/api/dashboards': {
      projects: [],
      tabs: [{
        tab: 't',
        cards: [
          { key: 'j.json', render: 'value', params: { field: 'free' } },
          { key: 'j.text', render: 'status' }
        ]
      }],
      errors: []
    },
    '/api/get/j.json,j.text': { 'j.json': '{"free":12.5}', 'j.text': 'online' },
    '/api/next/j.json,j.text': {}
  });
  await settle();

  const bodies = [...document.querySelectorAll('#grid .card-body')];
  assert.equal(bodies[0].textContent, '12.5');
  assert.equal(bodies[1].querySelector('.status').className, 'status status-ok');
});

test('a chart card reads its history when the tab is built and again every minute', async t =>
{
  const { fetched } = await boot(t, {
    '/api/dashboards': {
      projects: [],
      tabs: [{ tab: 't', cards: [{ key: 'c.ms', render: 'chart', params: { limit: 20 } }] }],
      errors: []
    },
    '/api/get/c.ms': '5',
    '/api/next/c.ms': {},
    '/api/history/c.ms?limit=20&since=0': [{ ts: 1, seen: 2, value: '5' }]
  });
  await settle();

  const reads = () => fetched.filter(url => url.startsWith('/api/history/c.ms')).length;
  assert.equal(reads(), 1);

  mock.timers.tick(5000);
  await settle();
  assert.equal(reads(), 1);

  mock.timers.tick(55000);
  await settle();
  assert.equal(reads(), 2);
});

test('the tab in the fragment is shown, and a change of fragment switches tabs', async t =>
{
  const routes = {
    ...MAIN,
    '/api/get/b.status': 'online',
    '/api/next/b.status': { 'b.status': null }
  };
  const { document, window } = await boot(t, routes, { hash: '#second' });
  await settle();

  assert.equal(document.querySelector('.tab-active').textContent, 'second');
  assert.equal(document.querySelectorAll('#tabs a').length, 2);
  assert.equal(
    document.querySelector('#grid .card-body').textContent,
    'online'
  );

  window.location.hash = '#main';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  await settle();

  assert.equal(document.querySelector('.tab-active').textContent, 'Main');
  assert.equal(document.querySelectorAll('#grid .card').length, 4);
});

test('the page says when it cannot read the dashboards', async t =>
{
  const failed = await boot(t, { '/api/dashboards': new Error('offline') });
  await settle();

  assert.equal(
    failed.document.querySelector('#grid .card-error').textContent,
    'Cannot read dashboards.json: offline'
  );
});

test('the page says when no config has a tab', async t =>
{
  const { document } = await boot(t, {
    '/api/dashboards': { projects: [], tabs: [], errors: [] }
  });
  await settle();

  assert.equal(
    document.querySelector('#grid .empty').textContent,
    'No tabs in dashboards.json'
  );
});
