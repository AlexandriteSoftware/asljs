#!/usr/bin/env node

import { main }
  from '../dist/mcp.js';

main(
  process.argv.slice(2),
  { cwd: process.cwd(),
    env: process.env,
    stdout: process.stderr,
    stderr: process.stderr },
  process.stdin,
  line => process.stdout.write(line))
  .catch(
    error => {
      console.error(
        error instanceof Error
          ? error.message
          : String(error));

      process.exitCode = 1;
    });
