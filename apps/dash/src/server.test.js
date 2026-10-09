import {
  waitFor
} from 'asljs-testing';
import {
  TmpDir
} from 'asljs-tmpdir';
import assert from 'node:assert/strict';
import {
  spawn
} from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import test from 'node:test';
import * as config from './config.js';
import {
  createApp
} from './server.js';
import * as store from './store.js';

/**
 * Loads one project from a config in a temporary folder and serves the app on a
 * free port. Everything is closed after the test.
 */
const serve = async (t, raw) =>
{
  const dir = new TmpDir();
  const file = await dir.writeText('dash.config.json', JSON.stringify(raw));

  t.mock.method(console, 'error', () =>
  {});
  config.load(['--config', file]);

  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));

  t.after(async () =>
  {
    await new Promise(resolve => server.close(resolve));
    store.close();
    await dir[Symbol.asyncDispose]();
  });

  const base = `http://127.0.0.1:${server.address().port}`;
  return (pathname, options) => fetch(`${base}${pathname}`, options);
};

const PROJECT = {
  project: 'web',
  label: 'Web',
  db: 'web.sqlite',
  counters: {
    'web.every': {
      schedule: '* * * * *',
      command: 'secret-command --token x'
    },
    'web.mem': { samples: 'memory, 1h, 10, 1Kb' },
    'web.manual': {}
  },
  tabs: [{ tab: 'web', label: 'Web', cards: [{ key: 'web.every', render: 'value' }] }]
};

test('PUT, POST and the deprecated set store the body as text, echo it, and say whether it changed', async t =>
{
  const call = await serve(t, PROJECT);

  const first = await call('/api/put/web.manual', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: '{"a":1}'
  });
  assert.equal(first.status, 200);
  assert.equal(await first.text(), '{"a":1}');
  assert.equal(first.headers.get('X-Dash-Changed'), 'true');

  for (const [method, path] of [['POST', '/api/put/web.manual'], ['PUT', '/api/set/web.manual'], ['POST', '/api/set/web.manual']]) {
    const again = await call(path, { method, body: '{"a":1}' });
    assert.equal(again.headers.get('X-Dash-Changed'), 'false', `${method} ${path}`);
  }

  assert.equal(await (await call('/api/get/web.manual')).text(), '{"a":1}');
});

test('a key outside the key pattern is rejected with 400', async t =>
{
  const call = await serve(t, PROJECT);

  const put = await call('/api/put/bad%20key', { method: 'PUT', body: 'x' });
  assert.equal(put.status, 400);
  assert.equal(await put.text(), 'invalid key');

  const history = await call('/api/history/bad%20key');
  assert.equal(history.status, 400);
  assert.deepEqual(await history.json(), { error: 'invalid key' });
});

test('get answers one key as text and several as JSON, with empty and null for keys never written', async t =>
{
  const call = await serve(t, PROJECT);

  await call('/api/put/web.manual', { method: 'PUT', body: 'online' });
  await call('/api/put/web.mem', { method: 'PUT', body: '41.3' });

  const one = await call('/api/get/web.manual');
  assert.match(one.headers.get('Content-Type'), /^text\/plain/);
  assert.equal(await one.text(), 'online');

  assert.equal(await (await call('/api/get/web.never')).text(), '');

  assert.deepEqual(
    await (await call('/api/get/web.manual,web.mem,web.never,bad%20key')).json(),
    { 'web.manual': 'online', 'web.mem': '41.3', 'web.never': null }
  );
});

test('meta answers the keys with their ts and seen, and history the samples newest first', async t =>
{
  const call = await serve(t, PROJECT);

  await call('/api/put/web.manual', { method: 'PUT', body: '1' });
  await call('/api/put/web.manual', { method: 'PUT', body: '2' });
  await call('/api/put/web.manual', { method: 'PUT', body: '2' });

  const meta = await (await call('/api/meta/web.manual,web.never')).json();
  assert.deepEqual(Object.keys(meta['web.manual']).sort(), ['seen', 'ts', 'value']);
  assert.ok(meta['web.manual'].seen >= meta['web.manual'].ts);
  assert.equal(meta['web.never'], null);

  const history = await (await call('/api/history/web.manual')).json();
  assert.deepEqual(history.map(sample => sample.value), ['2', '1']);

  const limited = await (await call('/api/history/web.manual?limit=1')).json();
  assert.deepEqual(limited.map(sample => sample.value), ['2']);

  const since = await (await call(`/api/history/web.manual?since=${history[0].ts}`)).json();
  assert.deepEqual(since.map(sample => sample.value), ['2']);
});

test('next is wait until the next run, due just after a run that did not report, then stale, and null without a schedule', async t =>
{
  const call = await serve(t, PROJECT);

  // Only Date is mocked, so the server's sockets and timers still run.
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 9, 9, 12, 0, 3) });

  // Nothing reported for the run at 12:00: due, three seconds over.
  assert.deepEqual(await (await call('/api/next/web.every,web.manual')).json(), {
    'web.every': { state: 'due', ms: 3000 },
    'web.manual': null
  });

  t.mock.timers.setTime(new Date(2026, 9, 9, 12, 0, 30).getTime());
  assert.deepEqual(await (await call('/api/next/web.every')).json(), {
    'web.every': { state: 'stale', ms: 30000 }
  });

  // A report, changed or not, counts: it waits for the run at 12:01.
  await call('/api/put/web.every', { method: 'PUT', body: 'ok' });
  assert.deepEqual(await (await call('/api/next/web.every')).json(), {
    'web.every': { state: 'wait', ms: 30000 }
  });
});

test('next is due up to five seconds after a missed run and stale after that', async t =>
{
  const call = await serve(t, PROJECT);

  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 9, 9, 12, 0, 5) });
  assert.deepEqual(await (await call('/api/next/web.every')).json(), {
    'web.every': { state: 'due', ms: 5000 }
  });

  t.mock.timers.setTime(new Date(2026, 9, 9, 12, 0, 5).getTime() + 1);
  assert.deepEqual(await (await call('/api/next/web.every')).json(), {
    'web.every': { state: 'stale', ms: 5001 }
  });
});

test('next judges freshness by seen: an unchanged report keeps the key waiting though its value is old', async t =>
{
  const call = await serve(t, PROJECT);

  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 9, 9, 12, 0, 10) });
  await call('/api/put/web.every', { method: 'PUT', body: 'steady' });

  // The run at 12:01 did not report: stale.
  t.mock.timers.setTime(new Date(2026, 9, 9, 12, 1, 30).getTime());
  assert.equal((await (await call('/api/next/web.every')).json())['web.every'].state, 'stale');

  // It reports the same value: its ts stays at 12:00:10, but it was seen now.
  await call('/api/put/web.every', { method: 'PUT', body: 'steady' });
  const meta = (await (await call('/api/meta/web.every')).json())['web.every'];
  assert.equal(meta.ts, new Date(2026, 9, 9, 12, 0, 10).getTime());
  assert.deepEqual(await (await call('/api/next/web.every')).json(), {
    'web.every': { state: 'wait', ms: 30000 }
  });
});

test('history answers 500 samples by default and at most 5000', async t =>
{
  const call = await serve(t, {
    ...PROJECT,
    counters: { 'web.many': { samples: 'memory, 24h, 10k, 10Mb' } }
  });

  for (let index = 0; index < 5001; index += 1) {
    store.put('web.many', String(index), Date.now() - 5001 + index);
  }

  assert.equal((await (await call('/api/history/web.many')).json()).length, 500);
  assert.equal(
    (await (await call('/api/history/web.many?limit=6000')).json()).length,
    5000
  );
  assert.equal(
    (await (await call('/api/history/web.many?limit=7')).json())[0].value,
    '5000'
  );
});

test('keys lists the stored keys, and dashboards the projects, tabs and errors without paths or commands', async t =>
{
  const call = await serve(t, PROJECT);

  await call('/api/put/web.manual', { method: 'PUT', body: 'x' });
  await call('/api/put/web.mem', { method: 'PUT', body: 'y' });
  const keys = await (await call('/api/keys')).json();
  assert.ok(keys.includes('web.manual'));
  assert.ok(keys.includes('web.mem'));

  const response = await call('/api/dashboards');
  const text = await response.text();
  assert.deepEqual(JSON.parse(text), {
    projects: [{ project: 'web', label: 'Web' }],
    tabs: [{
      tab: 'web',
      label: 'Web',
      project: 'web',
      cards: [{ key: 'web.every', render: 'value' }]
    }],
    errors: []
  });
  assert.doesNotMatch(text, /secret-command|web\.sqlite/);
});

test('dashboards reports the errors of the loaded configs', async t =>
{
  const call = await serve(t, {
    ...PROJECT,
    counters: { 'web.half': { schedule: '* * * * *' } }
  });

  const { errors } = await (await call('/api/dashboards')).json();
  assert.equal(errors.length, 1);
  assert.match(errors[0], /counter web\.half needs both schedule and command$/);
});

test('only the page and its modules are served, not the configs, the stores, the agents or the tests', async t =>
{
  const call = await serve(t, PROJECT);

  for (const url of ['/', '/dash.js', '/layout.js', '/renderers/value.js', '/renderers/value']) {
    assert.equal((await call(url)).status, 200, url);
  }
  // Served as written: there is no build step between the files and the page.
  for (
    const [url, file] of [
      ['/', 'index.html'],
      ['/dash.js', 'dash.js'],
      ['/renderers/value.js', 'renderers/value.js']
    ]
  ) {
    assert.equal(
      await (await call(url)).text(),
      fs.readFileSync(path.join(import.meta.dirname, file), 'utf8'),
      url
    );
  }

  for (
    const url of [
      '/dash.config.json',
      '/server.js',
      '/store.js',
      '/schema.sql',
      '/web.sqlite',
      '/dash.sqlite',
      '/.dash/dash.sqlite',
      '/agents/git.ps1',
      '/renderers/value.test.js',
      '/renderers/value.test',
      '/renderers/../server.js'
    ]
  ) {
    assert.equal((await call(url)).status, 404, url);
  }
});

/** A port nothing listens on, for a server run as a program. */
const freePort = async () =>
{
  const probe = net.createServer().listen(0, '127.0.0.1');
  await new Promise(resolve => probe.once('listening', resolve));
  const { port } = probe.address();
  await new Promise(resolve => probe.close(resolve));
  return port;
};

test('server.js as a program opens every configured database at startup, listens on PORT, runs the counters with --with-runner, and reloads a config that changes', async t =>
{
  const dir = new TmpDir();
  const file = await dir.writeText('dash.config.json', JSON.stringify({
    project: 'proc',
    db: 'proc.sqlite',
    counters: {
      'proc.start': {
        schedule: '0 0 1 1 *',
        command: `"${process.execPath}" -e "console.log('started')"`,
        startup: true
      }
    }
  }));
  const port = await freePort();

  const child = spawn(
    process.execPath,
    [path.join(import.meta.dirname, 'server.js'), '--with-runner', '--config', file],
    { env: { ...process.env, PORT: String(port) } }
  );
  const exited = new Promise(resolve => child.once('exit', resolve));
  t.after(async () =>
  {
    child.kill();
    await exited;
    await dir[Symbol.asyncDispose]();
  });

  let out = '';
  child.stdout.on('data', chunk =>
  {
    out += chunk;
  });
  await waitFor(() => out.includes('dash server on'), 10000);

  assert.match(out, new RegExp(`dash server on http://localhost:${port}`));
  assert.ok(fs.existsSync(dir.resolve('proc.sqlite')), 'opened before any put');

  let value = '';
  for (let attempt = 0; attempt < 100 && value !== 'started'; attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 100));
    value = await (await fetch(`http://localhost:${port}/api/get/proc.start`)).text();
  }
  assert.equal(value, 'started');

  // A config that changes on disk is loaded again, with no restart.
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(file, JSON.stringify({ ...raw, tabs: [{ tab: 'added' }] }));

  let tabs = [];
  for (let attempt = 0; attempt < 100 && tabs.length === 0; attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 100));
    tabs = (await (await fetch(`http://localhost:${port}/api/dashboards`)).json()).tabs;
  }
  assert.deepEqual(tabs.map(tab => tab.tab), ['added']);
});
