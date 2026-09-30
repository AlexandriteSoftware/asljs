import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import * as samples from './samples.js';
import * as store from './store.js';

const app = express();
const port = Number(process.env.PORT) || 3000;
const configPath = path.join(import.meta.dirname, 'dashboards.json');

app.use(express.text({ type: '*/*', limit: '4mb' }));

const readConfig = () =>
{
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.tabs = Array.isArray(config.tabs)
    ? config.tabs
    : [];
  return config;
};

const handlePut = (req, res) =>
{
  const key = req.params.key;
  if (!store.isKey(key)) {
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
  const keys = req.params.keys.split(',').filter(Boolean).filter(store.isKey);

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
  const keys = req.params.keys.split(',').filter(Boolean).filter(store.isKey);
  res.json(Object.fromEntries(keys.map(key => [key, store.get(key)])));
});

app.get('/api/history/:key', (req, res) =>
{
  const key = req.params.key;
  if (!store.isKey(key)) {
    return res.status(400).json({ error: 'invalid key' });
  }

  res.json(store.history(key, {
    limit: Math.min(Number(req.query.limit) || 500, 5000),
    since: Number(req.query.since) || 0
  }));
});

app.get('/api/keys', (req, res) => res.json(store.keys()));

app.get('/api/dashboards', (req, res) =>
{
  try {
    res.json(readConfig());
  } catch (error) {
    res.status(500).json({ error: `dashboards.json: ${error.message}` });
  }
});

// Only the page assets are served. The store, the agents and the configs stay off the wire.
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

// Sample policies are read once here and then reloaded whenever samples.json changes.
samples.load();
samples.watch();

// Retention is a clock rule, not a write rule: sweep keys nobody is writing to.
const sweep = setInterval(() => store.sweep(), 60000);
sweep.unref();

app.listen(port, () =>
{
  console.log(`dash server on http://localhost:${port}`);
  console.log(`sample policies from ${samples.configPath}`);
});
