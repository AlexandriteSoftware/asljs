#!/usr/bin/env node

import { runCli }
  from '../dist/cli.js';

process.exitCode =
  await runCli(
    process.argv.slice(2),
    { cwd: process.cwd(),
      env: process.env,
      stdout: process.stdout,
      stderr: process.stderr });
