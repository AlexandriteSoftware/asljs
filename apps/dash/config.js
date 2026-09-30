// Project configuration. One JSON file per project: where its database is, which
// counters feed it, and which tabs its dashboard shows. See docs/concept.md section 11.
//
//     {
//       "project": "asljs",
//       "label": "ASLJS",
//       "db": "dash.sqlite",
//       "samples": "database, 90*24h, 100k, 100Mb",
//       "counters": {
//         "asljs.git": { "schedule": "*/2 * * * *", "command": "pwsh -File a.ps1" }
//       },
//       "tabs": [{ "tab": "asljs", "label": "ASLJS", "cards": [] }]
//     }
//
// Keys are one global namespace across every loaded config: a key names at most one
// counter, and that counter's project owns the database the key is stored in. Keys no
// counter declares belong to the first project loaded.

import fs from 'node:fs';
import path from 'node:path';
import * as cron from './cron.js';
import {
  DEFAULT_POLICY,
  parsePolicy
} from './samples.js';

const KEY_PATTERN = /^[a-zA-Z0-9_.-]+$/;

const isKey = key => typeof key === 'string' && KEY_PATTERN.test(key);

// --- command line ----------------------------------------------------------

/**
 * `--config <path>` (or `-c`), repeatable. Without it, DASH_CONFIG is read as a
 * path list, and failing that the package's own dash.config.json is used.
 */
const parseArgs = (argv = process.argv.slice(2)) =>
{
  const configs = [];
  const errors = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--config' || arg === '-c') {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('-')) {
        errors.push(`${arg} needs a path`);
        continue;
      }
      configs.push(value);
      index += 1;
      continue;
    }

    if (arg.startsWith('--config=')) {
      configs.push(arg.slice('--config='.length));
      continue;
    }
  }

  if (configs.length === 0 && process.env.DASH_CONFIG) {
    configs.push(
      ...process.env.DASH_CONFIG.split(path.delimiter).filter(Boolean)
    );
  }
  if (configs.length === 0) {
    configs.push(path.join(import.meta.dirname, 'dash.config.json'));
  }

  return { configs: configs.map(file => path.resolve(file)), errors };
};

// --- one file --------------------------------------------------------------

const readCounters = (raw, project, dir, file, errors) =>
{
  const counters = new Map();

  for (const [key, entry] of Object.entries(raw ?? {})) {
    if (!isKey(key)) {
      errors.push(`${file}: "${key}" is not a key`);
      continue;
    }
    if (entry === null || typeof entry !== 'object') {
      errors.push(`${file}: counter ${key} must be an object`);
      continue;
    }

    const hasSchedule = typeof entry.schedule === 'string'
      && entry.schedule.trim() !== '';
    const hasCommand = typeof entry.command === 'string'
      && entry.command.trim() !== '';
    if (hasSchedule !== hasCommand) {
      errors.push(`${file}: counter ${key} needs both schedule and command`);
      continue;
    }

    let policy = null;
    if (entry.samples !== undefined) {
      try {
        policy = parsePolicy(entry.samples);
      } catch (error) {
        errors.push(`${file}: counter ${key}: ${error.message}`);
      }
    }

    // The schedule is parsed here, once, for the runner's tick and the page's
    // countdown alike. A counter whose schedule does not parse never runs.
    let schedule = null;
    if (hasSchedule) {
      try {
        schedule = {
          text: entry.schedule.trim(),
          cron: cron.parse(entry.schedule)
        };
      } catch (error) {
        errors.push(`${file}: counter ${key}: ${error.message}`);
        continue;
      }
    }

    counters.set(key, {
      key,
      project,
      schedule: schedule?.text ?? null,
      cron: schedule?.cron ?? null,
      command: hasCommand
        ? entry.command.trim()
        : null,
      cwd: dir,
      file,
      policy
    });
  }

  return counters;
};

const readTabs = (raw, project, file, errors) =>
{
  const tabs = [];

  for (
    const tab of Array.isArray(raw)
      ? raw
      : []
  ) {
    if (tab === null || typeof tab !== 'object' || !isKey(tab.tab)) {
      errors.push(`${file}: a tab needs a "tab" name matching ${KEY_PATTERN}`);
      continue;
    }
    tabs.push({
      ...tab,
      project,
      cards: Array.isArray(tab.cards)
        ? tab.cards
        : []
    });
  }

  return tabs;
};

/** One config file -> { project, counters, tabs }, or null when it cannot be used. */
const readFile = (file, errors) =>
{
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    return null;
  }

  if (!isKey(raw.project)) {
    errors.push(`${file}: "project" must match ${KEY_PATTERN}`);
    return null;
  }

  const dir = path.dirname(file);
  const name = raw.project;

  let fallback;
  try {
    fallback = parsePolicy(raw.samples ?? DEFAULT_POLICY);
  } catch (error) {
    errors.push(`${file}: samples: ${error.message}`);
    fallback = parsePolicy(DEFAULT_POLICY);
  }

  return {
    project: {
      project: name,
      label: raw.label || name,
      // Relative to the config file, so a project config travels with its project.
      db: path.resolve(dir, raw.db ?? process.env.DASH_DB ?? 'dash.sqlite'),
      dir,
      file,
      fallback
    },
    counters: readCounters(raw.counters, name, dir, file, errors),
    tabs: readTabs(raw.tabs, name, file, errors)
  };
};

// --- merge -----------------------------------------------------------------

const compile = files =>
{
  const errors = [];
  const projects = [];
  const byName = new Map();
  const counters = new Map();
  const tabs = [];

  for (const file of files) {
    const read = readFile(file, errors);
    if (!read) {
      continue;
    }

    if (byName.has(read.project.project)) {
      errors.push(
        `${file}: project "${read.project.project}" is already defined by ${
          byName.get(read.project.project).file
        }`
      );
      continue;
    }

    projects.push(read.project);
    byName.set(read.project.project, read.project);

    for (const counter of read.counters.values()) {
      const current = counters.get(counter.key);
      if (current) {
        errors.push(
          `${file}: key ${counter.key} is already a counter of ${current.project}`
        );
        continue;
      }
      counters.set(counter.key, counter);
    }

    for (const tab of read.tabs) {
      const current = tabs.find(other => other.tab === tab.tab);
      if (current) {
        errors.push(
          `${file}: tab "${tab.tab}" is already defined by ${current.project}`
        );
        continue;
      }
      tabs.push(tab);
    }
  }

  return { files, projects, byName, counters, tabs, errors };
};

let current = {
  files: [],
  projects: [],
  byName: new Map(),
  counters: new Map(),
  tabs: [],
  errors: []
};

const load = argv =>
{
  const args = parseArgs(argv);
  current = compile(args.configs);
  current.errors.unshift(...args.errors);
  for (const message of current.errors) {
    console.error(message);
  }
  return current;
};

// --- reading ---------------------------------------------------------------

const projects = () =>
  current.projects.map(({ project, label, db }) => ({ project, label, db }));

/** The project a key is stored in: its counter's, or the first project loaded. */
const projectOf = key =>
  current.byName.get(current.counters.get(key)?.project)
    ?? current.projects[0]
    ?? null;

/** The policy in force for a key: its counter's, or its project's default. */
const policyFor = key =>
  current.counters.get(key)?.policy
    ?? projectOf(key)?.fallback
    ?? parsePolicy(DEFAULT_POLICY);

/** Counters with a schedule and a command — the runner's jobs. */
const scheduled = () =>
  [...current.counters.values()].filter(counter =>
    counter.cron && counter.command
  );

/**
 * When the key's counter is next due, as epoch milliseconds, or null when nothing
 * is scheduled to write it. The runner ticks on the minute, so this is a minute.
 */
const nextRun = (key, from = new Date()) =>
{
  const counter = current.counters.get(key);
  if (!counter?.cron || !counter.command) {
    return null;
  }
  return cron.next(counter.cron, from)?.getTime() ?? null;
};

/**
 * When the key's counter was last due, as epoch milliseconds, or null when nothing
 * is scheduled to write it. A sample older than this means the run did not report.
 */
const lastRun = (key, from = new Date()) =>
{
  const counter = current.counters.get(key);
  if (!counter?.cron || !counter.command) {
    return null;
  }
  return cron.previous(counter.cron, from)?.getTime() ?? null;
};

const tabs = () => current.tabs;

const errors = () => [...current.errors];

const files = () => [...current.files];

// --- watching --------------------------------------------------------------

// Editors replace a file rather than write into it, so watch the directories and
// filter by name; a rename still fires here where a file watch would go deaf.
const watchers = [];
let pending = null;

const watch = onReload =>
{
  if (watchers.length > 0) {
    return watchers;
  }

  const names = new Map();
  for (const file of current.files) {
    const dir = path.dirname(file);
    if (!names.has(dir)) {
      names.set(dir, new Set());
    }
    names.get(dir).add(path.basename(file));
  }

  for (const [dir, basenames] of names) {
    try {
      const watcher = fs.watch(dir, (event, filename) =>
      {
        if (filename && !basenames.has(filename)) {
          return;
        }
        // Saves arrive as a burst of events; settle before re-reading.
        clearTimeout(pending);
        pending = setTimeout(() =>
        {
          current = compile(current.files);
          for (const message of current.errors) {
            console.error(message);
          }
          onReload?.(current);
        }, 100);
        pending.unref?.();
      });
      watcher.unref?.();
      watchers.push(watcher);
    } catch (error) {
      console.error(`watch ${dir} failed: ${error.message}`);
    }
  }

  return watchers;
};

export {
  errors,
  files,
  isKey,
  lastRun,
  load,
  nextRun,
  parseArgs,
  policyFor,
  projectOf,
  projects,
  scheduled,
  tabs,
  watch
};
