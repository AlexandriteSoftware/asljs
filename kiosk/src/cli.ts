import {
  readFileSync,
  watch,
  writeFileSync
} from 'node:fs';
import path from 'node:path';
import {
  fileURLToPath
} from 'node:url';

import {
  renderKioskHtml
} from './kiosk.js';

function printHelp(): void {
  process.stdout.write(
    `asljs-kiosk

Usage:
  asljs-kiosk <input.js> [--out <output.html|->] [--title <text>] [--watch]

Options:
  --out <file>    Output HTML file. Use - for stdout (default: <input>.html)
  --title <text>  Document title (default: Kiosk)
  --watch         Rebuild output when input file changes
  --help          Show this help
  --version       Print version
`
  );
}

function readVersion(): string | undefined {
  const here =
    path.dirname(
      fileURLToPath(
        import.meta.url));

  const packageJsonPath =
    path.join(
      here,
      '..',
      'package.json');

  const raw =
    readFileSync(
      packageJsonPath,
      'utf8');

  return (JSON.parse(raw) as { version?: unknown })
    .version as string | undefined;
}

type RunOptions =
  { inputPath: string;
    outPath: string;
    title: string;
    watch: boolean };

type ParsedArgs =
  | { kind: 'help' }
  | { kind: 'version' }
  | { kind: 'run'; options: RunOptions };

function deriveOutPath(
    inputPath: string
  ): string
{
  const parsed =
    path.parse(inputPath);

  const base =
    parsed.ext
      ? path.join(parsed.dir, parsed.name)
      : inputPath;

  return `${base}.html`;
}

function parseArgs(
    argv: string[]
  ): ParsedArgs
{
  const options: RunOptions =
    { inputPath: '',
      outPath: '',
      title: 'Kiosk',
      watch: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help'
      || arg === '-h')
    {
      return { kind: 'help' };
    }

    if (arg === '--version'
      || arg === '-v')
    {
      return { kind: 'version' };
    }

    if (arg === '--out') {
      const value = argv[++i];

      if (!value) {
        throw new TypeError(
          'Missing value for --out');
      }

      options.outPath = value;
      continue;
    }

    if (arg === '--title') {
      const value = argv[++i];

      if (!value) {
        throw new TypeError(
          'Missing value for --title');
      }

      options.title = value;
      continue;
    }

    if (arg === '--watch'
      || arg === '-w')
    {
      options.watch = true;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new TypeError(
        `Unknown option: ${arg}`);
    }

    if (!options.inputPath) {
      options.inputPath = arg;
      continue;
    }

    throw new TypeError(
      `Unexpected argument: ${arg}`);
  }

  if (!options.inputPath) {
    return { kind: 'help' };
  }

  if (!options.outPath) {
    options.outPath =
      deriveOutPath(
        options.inputPath);
  }

  return { kind: 'run', options };
}

function buildOnce(
    options: RunOptions
  ): void
{
  const rawScript =
    readFileSync(
      options.inputPath,
      'utf8');

  const html =
    renderKioskHtml(
      { scriptSource: rawScript,
        title: options.title });

  if (options.outPath === '-') {
    process.stdout.write(html);
  } else {
    writeFileSync(
      options.outPath,
      html,
      'utf8');
  }
}

try {
  const parsed =
    parseArgs(
      process.argv.slice(2));

  switch (parsed.kind) {
    case 'help':
      printHelp();
      process.exitCode = 0;
      break;
    case 'version':
      process.stdout.write(`${readVersion() ?? ''}\n`);
      process.exitCode = 0;
      break;
    default: {
      if (parsed.options.watch
        && parsed.options.outPath === '-')
      {
        throw new TypeError(
          '--watch cannot be used with --out -');
      }

      buildOnce(
        parsed.options);

      if (parsed.options.watch) {
        const inputPath =
          path.resolve(
            parsed.options.inputPath);

        const directory =
          path.dirname(inputPath);

        const fileName =
          path.basename(inputPath);

        let rebuildTimer: NodeJS.Timeout | null = null;

        const queueRebuild =
          (): void => {
            if (rebuildTimer)
              clearTimeout(rebuildTimer);

            rebuildTimer =
              setTimeout(
                () => {
                  rebuildTimer = null;

                  try {
                    buildOnce(
                      parsed.options);
                  } catch (error) {
                    const message =
                      (error
                          && typeof error === 'object'
                          && 'message' in error)
                        ? String((error as { message: unknown }).message)
                        : String(error);

                    process.stderr.write(
                      `${message}\n`);
                  }
                },
                50);
          };

        const watcher =
          watch(
            directory,
            { persistent: true },
            (
              _event,
              changedName
            ) => {
              if (!changedName)
                return;

              if (String(changedName) !== fileName)
                return;

              queueRebuild();
            });

        process.on(
          'exit',
          () => {
            try {
              watcher.close();
            } catch {}
          });
      }

      break;
    }
  }
} catch (error) {
  const message =
    (error
        && typeof error === 'object'
        && 'message' in error)
      ? String((error as { message: unknown }).message)
      : String(error);

  process.stderr.write(
    `${message}\n\n`);

  printHelp();

  process.exitCode = 1;
}
