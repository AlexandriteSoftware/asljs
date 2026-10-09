import {
  TmpEnv,
  waitFor
} from 'asljs-testing';
import {
  TmpDir
} from 'asljs-tmpdir';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import * as config from './config.js';
import {
  DEFAULT_POLICY,
  parsePolicy
} from './samples.js';

/** Loads the configs, keeping the errors config.load prints off the test output. */
const load = (t, ...files) =>
{
  t.mock.method(console, 'error', () =>
  {});
  return config.load(files.flatMap(file => ['--config', file]));
};

const writeConfig = async (dir, name, value) =>
  await dir.writeText(
    name,
    typeof value === 'string'
      ? value
      : JSON.stringify(value)
  );

test('parseArgs takes every --config, -c and --config=, and reports one without a path', () =>
{
  assert.deepEqual(
    config.parseArgs(['--config', 'a.json', '-c', 'b.json', '--config=c.json', '--with-runner']),
    {
      configs: [path.resolve('a.json'), path.resolve('b.json'), path.resolve('c.json')],
      errors: []
    }
  );

  assert.deepEqual(config.parseArgs(['--config', 'a.json', '-c']).errors, [
    '-c needs a path'
  ]);
  assert.deepEqual(config.parseArgs(['--config', '--once']).errors, [
    '--config needs a path'
  ]);
});

test('parseArgs falls back to DASH_CONFIG, then to the package dash.config.json', () =>
{
  using env = new TmpEnv({
    DASH_CONFIG: ['one.json', '', 'two.json'].join(path.delimiter)
  });

  assert.deepEqual(config.parseArgs([]).configs, [
    path.resolve('one.json'),
    path.resolve('two.json')
  ]);

  env.set('DASH_CONFIG', undefined);

  assert.deepEqual(config.parseArgs([]).configs, [
    path.join(import.meta.dirname, '..', 'dash.config.json')
  ]);
});

test('load reads a project, its counters and tabs, resolving db against the config folder', async t =>
{
  await using dir = new TmpDir();

  const file = await writeConfig(dir, 'site/dash.config.json', {
    project: 'site',
    db: 'data/site.sqlite',
    samples: 'memory, 1h, 10, 1Kb',
    counters: {
      'site.ping': {
        schedule: '*/5 * * * *',
        command: ' pwsh -File ping.ps1 ',
        startup: true,
        samples: 'database, 2h, 20, 2Kb'
      },
      'site.manual': {}
    },
    tabs: [{ tab: 'site', label: 'Site', cards: [{ key: 'site.ping' }] }]
  });

  const loaded = load(t, file);

  assert.deepEqual(loaded.errors, []);
  assert.deepEqual(config.files(), [file]);
  assert.deepEqual(config.projects(), [
    {
      project: 'site',
      label: 'site',
      db: path.join(dir.path, 'site', 'data', 'site.sqlite')
    }
  ]);
  assert.deepEqual(config.tabs(), [
    { tab: 'site', label: 'Site', project: 'site', cards: [{ key: 'site.ping' }] }
  ]);

  const [ping] = config.scheduled();
  assert.equal(config.scheduled().length, 1);
  assert.equal(ping.key, 'site.ping');
  assert.equal(ping.command, 'pwsh -File ping.ps1');
  assert.equal(ping.schedule, '*/5 * * * *');
  assert.equal(ping.startup, true);
  assert.equal(ping.cwd, path.join(dir.path, 'site'));

  assert.deepEqual(
    config.policyFor('site.ping'),
    parsePolicy('database, 2h, 20, 2Kb')
  );
  assert.deepEqual(
    config.policyFor('site.manual'),
    parsePolicy('memory, 1h, 10, 1Kb')
  );
});

test('a key no counter declares belongs to the first project, with its default policy', async t =>
{
  await using dir = new TmpDir();

  const first = await writeConfig(dir, 'a.json', { project: 'a', db: 'a.sqlite' });
  const second = await writeConfig(dir, 'b.json', {
    project: 'b',
    db: 'b.sqlite',
    label: 'Bee',
    counters: { 'b.key': {} }
  });

  load(t, first, second);

  assert.equal(config.projectOf('b.key').project, 'b');
  assert.equal(config.projectOf('anything.else').project, 'a');
  assert.deepEqual(config.policyFor('anything.else'), parsePolicy(DEFAULT_POLICY));
  assert.deepEqual(config.projects().map(project => project.label), ['a', 'Bee']);
});

test('db defaults to DASH_DB, then to dash.sqlite beside the config', async t =>
{
  await using dir = new TmpDir();

  const file = await writeConfig(dir, 'p/dash.config.json', { project: 'p' });

  load(t, file);
  assert.equal(config.projects()[0].db, path.join(dir.path, 'p', 'dash.sqlite'));

  const env = new TmpEnv({ DASH_DB: 'shared/all.sqlite' });
  t.after(() => env.restore());
  load(t, file);
  assert.equal(
    config.projects()[0].db,
    path.join(dir.path, 'p', 'shared', 'all.sqlite')
  );
});

test('load reports a malformed entry and skips it, and the rest of the file still loads', async t =>
{
  await using dir = new TmpDir();

  const file = await writeConfig(dir, 'c.json', {
    project: 'c',
    samples: 'memory, 0, 1, 1',
    counters: {
      'bad key!': {},
      'c.null': null,
      'c.half': { schedule: '* * * * *' },
      'c.startup': { startup: 'yes' },
      'c.startup.manual': { startup: true },
      'c.policy': { samples: 'disk, 1h, 1, 1Kb' },
      'c.cron': { schedule: '* * *', command: 'run' },
      'c.good': { schedule: '0 * * * *', command: 'run' }
    },
    tabs: [{ label: 'no name' }, { tab: 'c' }]
  });

  const { errors } = load(t, file);

  assert.deepEqual(errors, [
    `${file}: samples: retention must be greater than zero, got "0"`,
    `${file}: "bad key!" is not a key`,
    `${file}: counter c.null must be an object`,
    `${file}: counter c.half needs both schedule and command`,
    `${file}: counter c.startup: startup must be true or false`,
    `${file}: counter c.startup.manual: startup needs a schedule and command`,
    `${file}: counter c.policy: unknown store "disk", expected memory or database`,
    `${file}: counter c.cron: expected 5 cron fields, got 3`,
    `${file}: a tab needs a "tab" name matching /^[a-zA-Z0-9_.-]+$/`
  ]);

  assert.deepEqual(config.scheduled().map(counter => counter.key), ['c.good']);
  assert.deepEqual(config.tabs().map(tab => [tab.tab, tab.cards]), [['c', []]]);
  // The project's bad policy falls back to the default; c.policy, whose own policy
  // is bad, still exists and gets the project's.
  assert.deepEqual(config.policyFor('c.policy'), parsePolicy(DEFAULT_POLICY));
});

test('a file that does not parse, or has no project or an invalid one, is reported and the other configs still load', async t =>
{
  await using dir = new TmpDir();

  const broken = await writeConfig(dir, 'broken.json', '{ not json');
  const nameless = await writeConfig(dir, 'nameless.json', { project: 'a b' });
  const missing = await writeConfig(dir, 'missing.json', { label: 'No project' });
  const good = await writeConfig(dir, 'good.json', { project: 'good' });

  const { errors } = load(t, broken, nameless, missing, good);

  assert.equal(errors.length, 3);
  assert.match(errors[0], /^.*broken\.json: /);
  assert.equal(errors[1], `${nameless}: "project" must match /^[a-zA-Z0-9_.-]+$/`);
  assert.equal(errors[2], `${missing}: "project" must match /^[a-zA-Z0-9_.-]+$/`);
  assert.deepEqual(config.projects().map(project => project.project), ['good']);
  assert.deepEqual(config.errors(), errors);
});

test('a project, a key or a tab claimed twice is reported, and the first config keeps it', async t =>
{
  await using dir = new TmpDir();

  const first = await writeConfig(dir, 'first.json', {
    project: 'one',
    counters: { shared: { schedule: '* * * * *', command: 'first' } },
    tabs: [{ tab: 'main' }]
  });
  const second = await writeConfig(dir, 'second.json', {
    project: 'two',
    counters: {
      shared: { schedule: '* * * * *', command: 'second' },
      own: {}
    },
    tabs: [{ tab: 'main' }, { tab: 'other' }]
  });
  const again = await writeConfig(dir, 'again.json', { project: 'one' });

  const { errors } = load(t, first, second, again);

  assert.deepEqual(errors, [
    `${second}: key shared is already a counter of one`,
    `${second}: tab "main" is already defined by one`,
    `${again}: project "one" is already defined by ${first}`
  ]);
  assert.equal(config.scheduled()[0].command, 'first');
  assert.equal(config.projectOf('own').project, 'two');
  assert.deepEqual(config.tabs().map(tab => [tab.tab, tab.project]), [
    ['main', 'one'],
    ['other', 'two']
  ]);
});

test('load reports a --config without a path along with the config errors', async t =>
{
  await using dir = new TmpDir();

  const file = await writeConfig(dir, 'x.json', { project: 'x' });

  t.mock.method(console, 'error', () =>
  {});
  const { errors } = config.load(['--config', file, '-c']);

  assert.deepEqual(errors, ['-c needs a path']);
});

test('nextRun and lastRun are the next and the last minute a key is due, and null without a schedule', async t =>
{
  await using dir = new TmpDir();

  const file = await writeConfig(dir, 'n.json', {
    project: 'n',
    counters: {
      'n.hourly': { schedule: '0 * * * *', command: 'run' },
      'n.manual': {}
    }
  });

  load(t, file);

  const now = new Date(2026, 9, 9, 12, 30);

  assert.equal(config.nextRun('n.hourly', now), new Date(2026, 9, 9, 13, 0).getTime());
  assert.equal(config.lastRun('n.hourly', now), new Date(2026, 9, 9, 12, 0).getTime());
  assert.equal(config.nextRun('n.manual', now), null);
  assert.equal(config.lastRun('n.manual', now), null);
  assert.equal(config.nextRun('n.unknown', now), null);
});

test('isKey accepts letters, digits, dot, dash and underscore only', () =>
{
  assert.equal(config.isKey('disk.c_1-x'), true);
  assert.equal(config.isKey('disk c'), false);
  assert.equal(config.isKey('a/b'), false);
  assert.equal(config.isKey(''), false);
  assert.equal(config.isKey(5), false);
});

test('watch reloads the configs when one changes on disk', async t =>
{
  await using dir = new TmpDir();

  const file = await writeConfig(dir, 'w.json', { project: 'w', tabs: [{ tab: 'before' }] });

  load(t, file);

  const reloads = [];
  const watchers = config.watch(current => reloads.push(current));
  t.after(() =>
  {
    for (const watcher of watchers) {
      watcher.close();
    }
  });

  fs.writeFileSync(file, JSON.stringify({ project: 'w', tabs: [{ tab: 'after' }] }));

  await waitFor(() => reloads.length > 0, 5000);

  assert.deepEqual(config.tabs().map(tab => tab.tab), ['after']);
});
