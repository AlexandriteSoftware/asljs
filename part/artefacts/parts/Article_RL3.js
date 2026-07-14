/*
### RL3

Article must be formatted with dprint with the following configuration:

```json
{
  "markdown": {
    "lineWidth": 80,
    "newLineKind": "auto",
    "textWrap": "always",
    "emphasisKind": "underscores",
    "strongKind": "asterisks",
    "unorderedListKind": "dashes",
    "headingKind": "atx",
    "listIndentKind": "commonMark"
  },
  "plugins": [
    "https://plugins.dprint.dev/markdown-0.22.1.wasm"
  ]
}
```
*/

/*
Uses the `dprint` npm package, which is a dependency of this package
(see `package.json`). No additional installation should be necessary
once `npm install` has been run for the workspace; the first run may
take a moment because dprint downloads and caches the markdown plugin
from `https://plugins.dprint.dev/markdown-0.22.1.wasm`.
*/

import { mkdtemp,
         readFile,
         rm,
         writeFile }
  from 'node:fs/promises';
import os
  from 'node:os';
import path
  from 'node:path';
import { fileURLToPath }
  from 'node:url';
import { spawn }
  from 'node:child_process';

const DPRINT_CONFIG =
  {
    markdown:
      {
        lineWidth: 80,
        newLineKind: 'auto',
        textWrap: 'always',
        emphasisKind: 'underscores',
        strongKind: 'asterisks',
        unorderedListKind: 'dashes',
        headingKind: 'atx',
        listIndentKind: 'commonMark'
      },
    plugins:
      [
        'https://plugins.dprint.dev/markdown-0.22.1.wasm'
      ]
  };

/**
 * @type { import('asljs-part').RuleValidationFunction }
 */
export async function validate(
  artefact)
{
  const content =
    await readFile(
      artefact.path,
      'utf8');

  const dprintCommand =
    resolveDprintCommand();

  const tempDir =
    await mkdtemp(
      path.join(
        os.tmpdir(),
        'asljs-part-rl3-'));

  try {
    const configPath =
      path.join(
        tempDir,
        'dprint.json');

    await writeFile(
      configPath,
      JSON.stringify(
        DPRINT_CONFIG),
      'utf8');

    const formatted =
      await dprintFormatStdin(
        dprintCommand,
        configPath,
        artefact.path,
        content);

    if (content !== formatted) {
      throw new Error(
        'Article is not formatted with dprint. See `Article.md` for details.');
    }
  }
  finally {
    await rm(
      tempDir,
      { recursive: true,
        force: true });
  }
}

/**
 * Resolves the dprint command. Prefer the package-local CLI entry point, but
 * fall back to an OS-discovered executable when dprint is not installed as a
 * dependency of asljs-part.
 *
 * @returns {{ command: string, args: string[] }}
 */
function resolveDprintCommand()
{
  try {
    const packageJsonUrl =
      import.meta.resolve(
        'dprint/package.json');

    const packageJsonPath =
      fileURLToPath(
        packageJsonUrl);

    return {
      command:
        process.execPath,
      args:
        [
          path.join(
            path.dirname(
              packageJsonPath),
            'bin.js')
        ]
    };
  }
  catch {
    return {
      command:
        process.platform === 'win32'
          ? 'dprint.cmd'
          : 'dprint',
      args:
        []
    };
  }
}

/**
 * Runs dprint and returns the formatted output. Uses stdin/stdout so the file
 * does not need to reside inside the config directory.
 *
 * @param {{ command: string, args: string[] }} dprintCommand
 * @param {string} configPath
 * @param {string} filePath
 * @param {string} content
 * @returns {Promise<string>}
 */
function dprintFormatStdin(
  dprintCommand,
  configPath,
  filePath,
  content)
{
  return new Promise(
    (resolve, reject) =>
    {
      const proc =
        spawn(
          dprintCommand.command,
          [
            ...dprintCommand.args,
            'fmt',
            '--config', configPath,
            '--stdin', filePath
          ],
          { stdio: [ 'pipe', 'pipe', 'pipe' ],
            windowsHide: true });

      let stdout = '';
      let stderr = '';

      proc.stdout.on(
        'data',
        (chunk) =>
        {
          stdout += chunk;
        });

      proc.stderr.on(
        'data',
        (chunk) =>
        {
          stderr += chunk;
        });

      proc.on(
        'close',
        (code) =>
        {
          if (code !== 0) {
            reject(
              new Error(
                `dprint exited with code ${code}: ${stderr.trim()}`));
          }
          else {
            resolve(stdout);
          }
        });

      proc.on(
        'error',
        reject);

      proc.stdin.write(
        content,
        'utf8');

      proc.stdin.end();
    });
}