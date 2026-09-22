#!/usr/bin/env node

import { createEnvironment }
  from '../dist/environment.js';
import { runCli }
  from '../dist/cli.js';

const environment =
  createEnvironment(
    { stdout: process.stdout,
      stderr: process.stderr,
      readInput: readStdin });

const code =
  await runCli(
    process.argv.slice(2),
    environment);

process.exitCode =
  environment.exitCode
  ?? code;

await environment.dispose();

function readStdin() {
  return new Promise(
    (resolve, reject) => {
      let text = '';

      process.stdin.setEncoding('utf8');
      process.stdin.on('data', chunk => { text += chunk; });
      process.stdin.on('end', () => resolve(text));
      process.stdin.on('error', reject);
    });
}
