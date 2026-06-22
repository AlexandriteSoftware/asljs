#!/usr/bin/env node

import { runCli }
  from '../dist/cli.js';

await runCli(
  process.argv.slice(2));

process.exitCode = environment.exitCode;

environment.logger.dispose();
