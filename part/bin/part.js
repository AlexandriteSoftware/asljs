#!/usr/bin/env node

import { createEnvironment }
  from './../src/environment.js';
import { runCli }
  from '../src/cli.js';

const environment =
  createEnvironment(
    { stdout: process.stdout,
      stderr: process.stderr });

await runCli(
  process.argv.slice(2),
  environment);

process.exitCode = environment.exitCode;

environment.logger.dispose();
