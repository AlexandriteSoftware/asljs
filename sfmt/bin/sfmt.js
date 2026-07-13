#!/usr/bin/env node

import { createEnvironment }
  from '../dist/environment.js';
import { runCli }
  from '../dist/cli.js';

const environment =
  createEnvironment(
    { stdout:
        process.stdout,
      stderr:
        process.stderr });

await runCli(
  process.argv.slice(2),
  environment);

process.exitCode =
  environment.exitCode;

await environment.dispose();
