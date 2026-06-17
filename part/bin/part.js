#!/usr/bin/env node

import { createEnvironment }
  from './../src/environment.js';
import { runCli }
  from '../src/cli.js';

const exitCode =
  await runCli(
    process.argv.slice(2),
    createEnvironment(
      { stdout: process.stdout,
        stderr: process.stderr }));

process.exitCode = exitCode;
