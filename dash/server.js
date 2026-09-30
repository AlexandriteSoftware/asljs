import express from 'express';
import path from 'node:path';
import * as config from './config.js';
import * as store from './store.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.text({ type: '*/*', limit: '4mb' }));

const handlePut = (req, res) =>
{
  const key = req.params.key;
  if (!config.isKey(key)) {
    return res.status(400).type('text/plain').send('invalid key');
  }

  const value = typeof req.body === 'string'
    ? req.body
    : '';
  const result = store.put(key, value);
  res.set('X-Dash-Changed', String(result.changed)).type('text/plain').send(
    value
  );
};

app.put('/api/put/:key', handlePut);
app.post('/api/put/:key', handlePut);
app.post('/api/set/:key', handlePut); // deprecated alias
app.put('/api/set/:key', handlePut);

app.get('/api/get/:keys', (req, res) =>
{
  const keys = req.params.keys.split(',').filter(Boolean).filter(config.isKey);

  if (keys.length === 1) {
    const sample = store.get(keys[0]);
    return res.type('text/plain').send(
      sample
        ? sample.value
        : ''
    );
  }

  const values = Object.fromEntries(keys.map(key =>
  {
    const sample = store.get(key);
    return [
      key,
      sample
        ? sample.value
        : null
    ];
  }));

  res.json(values);
});

// Companion of /api/get: the same keys with their ts/seen, for freshness and change detection.
app.get('/api/meta/:keys', (req, res) =>
{
  const keys = req.params.keys.split(',').filter(Boolean).filter(config.isKey);
  res.json(Object.fromEntries(keys.map(key => [key, store.get(key)])));
});

app.get('/api/history/:key', (req, res) =>
{
  const key = req.params.key;
  if (!config.isKey(key)) {
    return res.status(400).json({ error: 'invalid key' });
  }

  res.json(store.history(key, {
    limit: Math.min(Number(req.query.limit) || 500, 5000),
    since: Number(req.query.since) || 0
  }));
});

// A scheduled minute that has passed without the key being written is first "due",
// and "stale" once it has stayed unwritten for longer than this.
const DUE_MS = 5000;

/**
 * How the key stands against its schedule: `wait` with the milliseconds left until
 * its counter next runs, or `due` / `stale` with the milliseconds it is overdue by.
 * Null for a key nothing is scheduled to write.
 */
const waitFor = (key, now) =>
{
  const next = config.nextRun(key, now);
  if (next === null) {
    return null;
  }

  // Sticky puts bump `seen` whether or not the value changed, so `seen` is when the
  // counter last reported, which is what "no update" asks about.
  const last = config.lastRun(key, now);
  const seen = store.get(key)?.seen ?? 0;
  const at = now.getTime();

  if (last !== null && seen < last) {
    const overdue = at - last;
    return {
      state: overdue > DUE_MS
        ? 'stale'
        : 'due',
      ms: overdue
    };
  }

  return { state: 'wait', ms: Math.max(0, next - at) };
};

// The countdown in the bar: per key, how long until its counter next writes it.
app.get('/api/next/:keys', (req, res) =>
{
  const now = new Date();
  const keys = req.params.keys.split(',').filter(Boolean).filter(config.isKey);
  res.json(Object.fromEntries(keys.map(key => [key, waitFor(key, now)])));
});

app.get('/api/keys', (req, res) => res.json(store.keys()));

// Projects and their tabs, so the page does not embed its own config. Database
// paths and counter commands stay on the server.
app.get('/api/dashboards', (req, res) =>
{
  res.json({
    projects: config.projects().map(({ project, label }) => ({
      project,
      label
    })),
    tabs: config.tabs(),
    errors: config.errors()
  });
});

// Only the page assets are served. The stores, the agents and the configs stay off the wire.
const sendAsset = file => (req, res) =>
  res.sendFile(path.join(import.meta.dirname, file));

app.get('/', sendAsset('index.html'));
app.get('/dash.js', sendAsset('dash.js'));
app.get('/layout.js', sendAsset('layout.js'));
app.use(
  '/renderers',
  express.static(path.join(import.meta.dirname, 'renderers'), {
    extensions: ['js']
  })
);

// Configs are read once here and then reloaded whenever one of them changes.
config.load();
config.watch(() => store.openAll());

// Open every configured database at startup, so a bad path fails now and not on
// the first put.
store.openAll();

// Retention is a clock rule, not a write rule: sweep keys nobody is writing to.
const sweep = setInterval(() => store.sweep(), 60000);
sweep.unref();

app.listen(port, () =>
{
  console.log(`dash server on http://localhost:${port}`);
  for (const project of config.projects()) {
    console.log(`  ${project.project} -> ${project.db}`);
  }
  for (const file of config.files()) {
    console.log(`  config ${file}`);
  }
});
