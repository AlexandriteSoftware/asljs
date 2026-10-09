#!/usr/bin/env node

import { runMcpServer }
  from '../dist/mcp.js';

await runMcpServer(
  { cwd: process.cwd(),
    env: process.env,
    stdout: process.stderr,
    stderr: process.stderr },
  process.stdin,
  line => process.stdout.write(line));
