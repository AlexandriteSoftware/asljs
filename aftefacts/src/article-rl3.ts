/*
### RL3

Article must be formatted with dprint with the following configuration:

```json
{
  "markdown": {
    "lineWidth": 80,
    "newLineKind": "auto",
    "textWrap": "maintainAndWrap",
    "emphasisKind": "underscores",
    "strongKind": "asterisks",
    "unorderedListKind": "dashes",
    "headingKind": "atx",
    "listIndentKind": "commonMark"
  },
  "plugins": [
    "https://plugins.dprint.dev/markdown-0.25.0.wasm"
  ]
}
```
*/

/*
Uses the `dprint` npm package, which is a dependency of this package
(see `package.json`). No additional installation should be necessary
once `npm install` has been run for the workspace; the first run may
take a moment because dprint downloads and caches the markdown plugin
from `https://plugins.dprint.dev/markdown-0.25.0.wasm`.
*/

import { type RuleValidationFunction }
  from 'asljs-part';
import { spawn }
  from 'node:child_process';
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

const DPRINT_CONFIG =
  { markdown:
      { lineWidth: 80,
        newLineKind: 'auto',
        textWrap: 'maintainAndWrap',
        emphasisKind: 'underscores',
        strongKind: 'asterisks',
        unorderedListKind: 'dashes',
        headingKind: 'atx',
        listIndentKind: 'commonMark' },
    plugins:
      [ 'https://plugins.dprint.dev/markdown-0.25.0.wasm' ] };

interface DprintCommand
{
  command: string;
  args: string[];
}

export const validate: RuleValidationFunction =
  async (
      artefact,
      context
    ) =>
  {
  const content =
    await readFile(
      context.files.path(artefact),
      'utf8');

  const dprintCommand =
    await resolveDprintCommand();

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
        context.files.path(artefact),
        content);

    if (content !== formatted) {
      throw new Error(
        'Article is not formatted with dprint. See `Article.md` for details.');
    }
  } finally {
    await rm(
      tempDir,
      { recursive: true,
        force: true });
  }
};

/**
 * Resolves the dprint command. Prefer the package-local CLI entry point, but
 * fall back to an OS-discovered executable when dprint is not installed as a
 * dependency of asljs-part.
 */
async function resolveDprintCommand(
  ): Promise<DprintCommand>
{
  try {
    const packageJsonUrl =
      import.meta.resolve(
        'dprint/package.json');

    const packageJsonPath =
      fileURLToPath(
        packageJsonUrl);

    const packageJson =
      JSON.parse(
        await readFile(
          packageJsonPath,
          'utf8'));

    const binPath =
      path.join(
        path.dirname(
          packageJsonPath),
        packageJson.bin);

    const result =
      { command: process.execPath,
        args:
          [ binPath ] };

    return result;
  } catch {
    return { command:
               process.platform === 'win32'
        ? 'dprint.cmd'
        : 'dprint',
             args: [ ] };
  }
}

/**
 * Runs dprint and returns the formatted output. dprint returns stdin unchanged
 * for a `--stdin` path outside the config folder, so it runs in that folder
 * and gets only the file name, which selects the plugin by extension.
 */
function dprintFormatStdin(
    dprintCommand: DprintCommand,
    configPath: string,
    filePath: string,
    content: string
  ): Promise<string>
{
  return new Promise<string>(
    (
        resolve,
        reject
      ) =>
    {
      const proc =
        spawn(
          dprintCommand.command,
          [ ...dprintCommand.args,
            'fmt',
            '--config',
            configPath,
            '--stdin',
            path.basename(filePath) ],
          { cwd:
              path.dirname(configPath),
            stdio:
              [ 'pipe',
                'pipe',
                'pipe' ],
            windowsHide: true });

      let stdout = '';
      let stderr = '';

      proc.stdout.on(
        'data',
        (
            chunk
          ) =>
        {
          stdout += chunk;
        });

      proc.stderr.on(
        'data',
        (
            chunk
          ) =>
        {
          stderr += chunk;
        });

      proc.on(
        'close',
        (
            code
          ) =>
        {
          if (code !== 0) {
            reject(
              new Error(
                `dprint exited with code ${code}: ${stderr.trim()}`));
          } else {
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
    }
  );
}
