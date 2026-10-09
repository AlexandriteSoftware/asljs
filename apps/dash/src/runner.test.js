import {
  TmpEnv
} from 'asljs-testing';
import {
  TmpDir
} from 'asljs-tmpdir';
import assert from 'node:assert/strict';
import {
  spawn
} from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import * as config from './config.js';
import {
  start
} from './runner.js';
import {
  createApp
} from './server.js';
import * as store from './store.js';

/** A counter command running a line of JavaScript with this Node. */
const node = script =>
  `"${process.execPath}" -e ${JSON.stringify(script)}`;

/**
 * Loads a project with these counters from a temporary folder and serves the app,
 * which the runner puts to. Returns the server's URL and what the runner logged.
 */
const setUp = async (t, counters) =>
{
  const dir = new TmpDir();
  const file = await dir.writeText(
    'project/dash.config.json',
    JSON.stringify({ project: 'run', db: 'run.sqlite', counters })
  );

  const logged = [];
  t.mock.method(console, 'log', line => logged.push(line));
  t.mock.method(console, 'error', line => logged.push(line));
  config.load(['--config', file]);

  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));

  t.after(async () =>
  {
    await new Promise(resolve => server.close(resolve));
    store.close();
    await dir[Symbol.asyncDispose]();
  });

  return {
    dir,
    logged,
    url: `http://127.0.0.1:${server.address().port}`
  };
};

const valueOf = key => store.get(key)?.value ?? null;

test('once runs every counter and puts its stdout, trimmed at the end, to its key', async t =>
{
  const { dir, logged, url } = await setUp(t, {
    'run.ok': {
      schedule: '0 0 1 1 *',
      command: node("console.log('  41.3'); console.log()")
    },
    'run.cwd': {
      schedule: '0 0 1 1 *',
      command: node('console.log(process.cwd())')
    },
    'run.stderr': {
      schedule: '0 0 1 1 *',
      command: node("console.log('value'); console.error('noise')")
    },
    'run.manual': {}
  });

  await start({ url, once: true });

  assert.equal(valueOf('run.ok'), '  41.3');
  assert.equal(valueOf('run.cwd'), dir.resolve('project'));
  assert.equal(valueOf('run.stderr'), 'value');
  assert.equal(valueOf('run.manual'), null);

  assert.ok(logged.includes('run.ok ok changed'));
  assert.match(logged[0], /^dash runner: 3 counters from 1 configs -> http:/);
});

test('a counter that exits non-zero records no sample, and the runner logs its exit code', async t =>
{
  const { logged, url } = await setUp(t, {
    'run.fails': {
      schedule: '0 0 1 1 *',
      command: node("console.log('partial'); console.error('broken'); process.exit(3)")
    }
  });

  await start({ url, once: true });

  assert.equal(valueOf('run.fails'), null);
  assert.ok(logged.includes('run.fails exit=3 broken'), logged.join('\n'));
});

test('an unchanged output is logged as sticky', async t =>
{
  const { logged, url } = await setUp(t, {
    'run.same': { schedule: '0 0 1 1 *', command: node("console.log('same')") }
  });

  await start({ url, once: true });
  await start({ url, once: true });

  assert.ok(logged.includes('run.same ok changed'));
  assert.ok(logged.includes('run.same ok sticky'));
});

/** Lets the runner's commands and puts finish, until `done` holds. */
const until = async done =>
{
  const deadline = performance.now() + 10000;
  while (!done() && performance.now() < deadline) {
    await new Promise(resolve => setImmediate(resolve));
  }
};

test('on start the runner runs the counters due now and those marked startup, then each minute those due', async t =>
{
  const { logged, url } = await setUp(t, {
    'run.due': {
      schedule: '0 12 * * *',
      command: node("console.log('due'); console.error('noise')")
    },
    'run.minute': { schedule: '1 12 * * *', command: node("console.log('minute')") },
    'run.startup': {
      schedule: '0 6 * * *',
      command: node("console.log('startup')"),
      startup: true
    },
    'run.later': { schedule: '0 6 * * *', command: node("console.log('later')") }
  });

  // The minute timer is mocked, so the runner does not keep the test alive.
  t.mock.timers.enable({
    apis: ['Date', 'setTimeout'],
    now: new Date(2026, 9, 9, 12, 0, 0)
  });

  await start({ url });
  await until(() => valueOf('run.due') !== null && valueOf('run.startup') !== null);

  assert.equal(valueOf('run.due'), 'due');
  assert.equal(valueOf('run.startup'), 'startup');
  assert.equal(valueOf('run.later'), null);
  assert.equal(valueOf('run.minute'), null);

  // A successful run's stderr is logged, and is not part of the value.
  assert.ok(
    logged.some(line => / run\.due stderr: noise$/.test(line)),
    logged.join('\n')
  );

  // The next check is at the top of the next minute, 12:01.
  t.mock.timers.tick(60000);
  await until(() => valueOf('run.minute') !== null);

  assert.equal(valueOf('run.minute'), 'minute');
  assert.equal(valueOf('run.later'), null);
});

test('runner.js as a program loads its configs and puts to localhost on PORT, or to DASH_URL', async t =>
{
  const { dir, url } = await setUp(t, {
    'run.program': { schedule: '0 0 1 1 *', command: node('console.log(process.env.ROUND)') }
  });
  const file = dir.resolve('project/dash.config.json');
  const port = new URL(url).port;

  const runOnce = env =>
    new Promise((resolve, reject) =>
    {
      const child = spawn(
        process.execPath,
        [path.join(import.meta.dirname, 'runner.js'), '--once', '--config', file],
        { env: { ...process.env, DASH_URL: '', ...env } }
      );
      child.once('error', reject);
      child.once('exit', resolve);
    });

  assert.equal(await runOnce({ PORT: port, ROUND: 'one' }), 0);
  assert.equal(valueOf('run.program'), 'one');

  assert.equal(await runOnce({ PORT: '1', DASH_URL: url, ROUND: 'two' }), 0);
  assert.equal(valueOf('run.program'), 'two');
});

test('a counter that outruns DASH_TIMEOUT is killed and records no sample', async t =>
{
  const env = new TmpEnv({ DASH_TIMEOUT: '300' });
  t.after(() => env.restore());

  const { logged, url } = await setUp(t, {
    'run.slow': {
      schedule: '0 0 1 1 *',
      command: node("setTimeout(() => console.log('late'), 3000)")
    }
  });

  await start({ url, once: true });

  assert.equal(valueOf('run.slow'), null);
  assert.ok(
    logged.some(line => /^run\.slow exit=/.test(line)),
    logged.join('\n')
  );
});
