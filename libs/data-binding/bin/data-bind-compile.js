#!/usr/bin/env node

import { runCompileTemplatesCli }
  from '../dist/compile-templates-cli.js';

process.exitCode =
  await runCompileTemplatesCli(
    process.argv.slice(2),
    { cwd: process.cwd(),
      stdout: text => process.stdout.write(text),
      stderr: text => process.stderr.write(text) });
