// Reads cronfile, runs agents on schedule, puts their stdout to the named key.
// One line per agent:  <min> <hour> <dom> <month> <dow>  <key>  <command...>

import {
  spawn
} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const cronPath = process.env.DASH_CRONFILE
  || path.join(import.meta.dirname, 'cronfile');
const baseUrl = process.env.DASH_URL
  || `http://localhost:${Number(process.env.PORT) || 3000}`;
const timeoutMs = Number(process.env.DASH_TIMEOUT) || 60000;

// --- cron ------------------------------------------------------------------

const RANGES = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];

/** Expand one cron field into a Set of matching numbers. Supports * , - and /n. */
const expand = (spec, [lo, hi]) =>
{
  const values = new Set();

  for (const part of spec.split(',')) {
    const [range, stepText] = part.split('/');
    const step = stepText
      ? Number(stepText)
      : 1;
    if (!Number.isInteger(step) || step < 1) {
      throw new Error(`bad step in "${part}"`);
    }

    let start = lo;
    let end = hi;
    if (range !== '*') {
      const [from, to] = range.split('-');
      start = Number(from);
      end = to === undefined
        ? (stepText
          ? hi
          : start)
        : Number(to);
    }
    if (
      !Number.isInteger(start)
      || !Number.isInteger(end)
      || start < lo
      || end > hi
    ) {
      throw new Error(`bad range in "${part}"`);
    }

    for (let value = start; value <= end; value += step) {
      values.add(value);
    }
  }

  return values;
};

const parseCron = expression =>
{
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`expected 5 cron fields, got ${fields.length}`);
  }
  return fields.map((field, index) => expand(field, RANGES[index]));
};

const matches = (cron, date) =>
{
  const dow = date.getDay();
  return cron[0].has(date.getMinutes())
    && cron[1].has(date.getHours())
    && cron[2].has(date.getDate())
    && cron[3].has(date.getMonth() + 1)
    && (cron[4].has(dow) || (dow === 0 && cron[4].has(7)));
};

// --- cronfile --------------------------------------------------------------

const readJobs = () =>
{
  const jobs = [];
  const lines = fs.readFileSync(cronPath, 'utf8').split(/\r?\n/);

  lines.forEach((line, index) =>
  {
    const text = line.trim();
    if (text === '' || text.startsWith('#')) {
      return;
    }

    const parts = text.split(/\s+/);
    if (parts.length < 7) {
      console.error(`cronfile:${index + 1}: need <cron x5> <key> <command>`);
      return;
    }

    try {
      jobs.push({
        line: index + 1,
        cron: parseCron(parts.slice(0, 5).join(' ')),
        key: parts[5],
        command: parts.slice(6)
      });
    } catch (error) {
      console.error(`cronfile:${index + 1}: ${error.message}`);
    }
  });

  return jobs;
};

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
    // A cronfile line is a command line, so hand it to the shell as one string.
    // Quoting is the line author's business, as in any crontab.
    const child = spawn(job.command.join(' '), {
      cwd: import.meta.dirname,
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
  const due = jobs.filter(job => matches(job.cron, date));

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

const main = async () =>
{
  const jobs = readJobs();
  console.log(
    `dash runner: ${jobs.length} jobs from ${cronPath} -> ${baseUrl}`
  );
  for (const job of jobs) {
    console.log(`  ${job.key} <- ${job.command.join(' ')}`);
  }

  if (process.argv.includes('--once')) {
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

main();
