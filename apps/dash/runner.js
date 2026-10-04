// Reads the project configs, runs each counter's command on its schedule, and puts
// the command's stdout to the counter's key. See docs/monitors.md.
//
// Run alone as `node runner.js`, or inside the server with `server.js --with-runner`,
// which calls start() after its own config.load(). Either way it puts over HTTP.

import {
  spawn
} from 'node:child_process';
import * as config from './config.js';
import * as cron from './cron.js';

let baseUrl = process.env.DASH_URL
  || `http://localhost:${Number(process.env.PORT) || 3000}`;
const timeoutMs = Number(process.env.DASH_TIMEOUT) || 60000;

// --- counters -------------------------------------------------------------

/** Scheduled counters as runnable jobs. Their schedules are parsed by config.js. */
const readJobs = () =>
  config.scheduled().map(counter => ({
    key: counter.key,
    project: counter.project,
    cron: counter.cron,
    command: counter.command,
    cwd: counter.cwd
  }));

// --- running ---------------------------------------------------------------

const put = async (key, value) =>
{
  const response = await fetch(
    `${baseUrl}/api/put/${encodeURIComponent(key)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: value
    }
  );
  if (!response.ok) {
    throw new Error(`put ${response.status}`);
  }
  return response.headers.get('X-Dash-Changed') === 'true';
};

const run = job =>
  new Promise(resolve =>
  {
    const started = Date.now();
    // A counter's command is a command line, so hand it to the shell as one string.
    // Quoting is the config author's business, as in any crontab. It runs in the
    // directory of the config that declares it, so a relative path is project-local.
    const child = spawn(job.command, {
      cwd: job.cwd,
      shell: true
    });

    let out = '';
    let err = '';
    const timer = setTimeout(() => child.kill(), timeoutMs);

    child.stdout.on('data', chunk =>
    {
      out += chunk;
    });
    child.stderr.on('data', chunk =>
    {
      err += chunk;
    });

    child.on('error', error =>
    {
      clearTimeout(timer);
      resolve({
        code: -1,
        out: '',
        err: error.message,
        ms: Date.now() - started
      });
    });

    child.on('close', code =>
    {
      clearTimeout(timer);
      resolve({ code, out, err, ms: Date.now() - started });
    });
  });

const tick = async (jobs, date) =>
{
  const due = jobs.filter(job => cron.matches(job.cron, date));

  await Promise.all(due.map(async job =>
  {
    const result = await run(job);
    const stamp = new Date().toISOString();

    if (result.code !== 0) {
      console.error(
        `${stamp} ${job.key} exit=${result.code} ${result.ms}ms ${result.err.trim()}`
      );
      return; // non-zero means "no sample"
    }
    if (result.err.trim()) {
      console.error(`${stamp} ${job.key} stderr: ${result.err.trim()}`);
    }

    try {
      const changed = await put(job.key, result.out.replace(/\s+$/, ''));
      console.log(
        `${stamp} ${job.key} ok ${result.ms}ms ${
          changed
            ? 'changed'
            : 'sticky'
        }`
      );
    } catch (error) {
      console.error(`${stamp} ${job.key} put failed: ${error.message}`);
    }
  }));
};

/**
 * Runs the counters of the configs already loaded: every one once and return when
 * `once` is set, otherwise on their schedules. `url` overrides DASH_URL.
 */
const start = async ({ url, once = false } = {}) =>
{
  baseUrl = url ?? baseUrl;
  const jobs = readJobs();
  console.log(
    `dash runner: ${jobs.length} counters from ${config.files().length} configs -> ${baseUrl}`
  );
  for (const job of jobs) {
    console.log(`  ${job.project}/${job.key} <- ${job.command}`);
  }

  if (once) {
    await Promise.all(jobs.map(async job =>
    {
      const result = await run(job);
      if (result.code === 0) {
        const changed = await put(job.key, result.out.replace(/\s+$/, ''));
        console.log(`${job.key} ok ${
          changed
            ? 'changed'
            : 'sticky'
        }`);
      } else {
        console.error(`${job.key} exit=${result.code} ${result.err.trim()}`);
      }
    }));
    return;
  }

  // Align to the top of the minute, then tick once a minute.
  const schedule = () =>
  {
    const now = new Date();
    const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
    setTimeout(() =>
    {
      tick(jobs, new Date());
      schedule();
    }, delay);
  };

  tick(jobs, new Date()); // run what is due right now, so a restart fills the page
  schedule();
};

if (import.meta.main) {
  config.load();
  start({ once: process.argv.includes('--once') });
}

export {
  start
};
