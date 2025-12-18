#!/usr/bin/env node

import { startServer } from './server/server.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function printHelp() {
  process.stdout.write(
    `asljs-server

Usage:
  asljs-server [--root <dir>] [--port <number>] [--host <name>]

Options:
  --root <dir>     Root directory to serve (default: .)
  --port <number>  Port to listen on (default: 3000)
  --host <name>    Host/interface to bind (default: localhost)
  --help           Show this help
  --version        Print version
`
  );
}

function readVersion() {
  const here =
    path.dirname(
      fileURLToPath(import.meta.url));

  const packageJsonPath =
    path.join(here, 'package.json');

  const raw =
    readFileSync(packageJsonPath, 'utf8');

  return JSON.parse(raw).version;
}

function parseArgs(argv) {
  const options = { root: '.', port: 3000, host: 'localhost' };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      return { kind: 'help' };
    }

    if (arg === '--version' || arg === '-v') {
      return { kind: 'version' };
    }

    if (arg === '--root') {
      const value = argv[++i];
      if (!value) 
        throw new TypeError('Missing value for --root');
      options.root = value;
      continue;
    }

    if (arg === '--port') {
      const value = argv[++i];
      if (!value) 
        throw new TypeError('Missing value for --port');
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed <= 0) 
        throw new TypeError('Invalid --port');
      options.port = parsed;
      continue;
    }

    if (arg === '--host') {
      const value = argv[++i];
      if (!value) 
        throw new TypeError('Missing value for --host');
      options.host = value;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new TypeError(`Unknown option: ${arg}`);
    }

    // Positional = root directory
    options.root = arg;
  }

  return { kind: 'run', options };
}

try {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.kind === 'help') {
    printHelp();
    process.exitCode = 0;
  } else if (parsed.kind === 'version') {
    process.stdout.write(`${readVersion()}\n`);
    process.exitCode = 0;
  } else {
    startServer(parsed.options);
  }
} catch (error) {
  process.stderr.write(`${error?.message || String(error)}\n\n`);
  printHelp();
  process.exitCode = 1;
}
