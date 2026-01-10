import { startServer } from './server.js';
import type { StartServerOptions } from './server.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';
import type {
    Argv,
    ArgumentsCamelCase
  } from 'yargs';

type CliArgs =
  { dir?: string;
    root: string;
    port: number;
    host: string;
    mount?: string[]; };

/**
 * Reads the asljs-server version from package.json.
 */
function readVersion(
  ): string | undefined
{
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

/**
 * Converts array of strings `[ "<virtual>=<dir>", ... ]` into a map.
 */
function parseMounts(
    mounts: string[] | undefined
  ): Record<string, string>
{
  const map: Record<string, string> = { };

  if (!mounts)
    return map;

  for (const spec of mounts) {
    const separatorIndex =
      spec.indexOf('=');

    if (separatorIndex === -1) {
      throw new Error(
        'Incorrect format, expect "<virtual>=<dir>".');
    }

    const virtual =
      spec.slice(0, separatorIndex);

    const dir =
      spec.slice(separatorIndex + 1);

    map[virtual] = dir;
  }

  return map;
}

const version =
  readVersion() ?? '';

yargs(
    process.argv.slice(2))
  .scriptName('asljs-server')
  .usage(
    '$0 [root] [options]')
  .command(
    '$0 [dir]',
    'Start the server',
    (y: Argv) =>
      y
        .positional(
          'dir',
          { type: 'string',
            describe: 'Root directory to serve (default: .)' })
        .option(
          'root',
          { type: 'string',
            describe: 'Root directory to serve (default: .)',
            default: '.' })
        .option(
          'port',
          { type: 'number',
            describe: 'Port to listen on (default: 3000)',
            default: 3000 })
        .option(
          'host',
          { type: 'string',
            describe: 'Host/interface to bind (default: localhost)',
            default: 'localhost' })
        .option(
          'mount',
          { type: 'string',
            alias: 'm',
            array: true,
            describe:
              'Mount a folder under a virtual path (repeatable). Spec: <virtual>=<dir> (example: assets=../Assets)' }),
    (argv: ArgumentsCamelCase<CliArgs>) => {
      if (!Number.isFinite(argv.port)
        || argv.port <= 0)
      {
        throw new Error(
          'Invalid --port');
      }

      if (typeof argv.host !== 'string'
        || !argv.host)
      {
        throw new Error(
          'Missing value for --host');
      }

      if (typeof argv.root !== 'string'
        || !argv.root)
      {
        throw new Error(
          'Missing value for --root');
      }

      let mounts : Record<string, string>;

      try {
        mounts =
          parseMounts(
            argv.mount);
      }
      catch (err) {
        throw new Error(
          `Invalid --mount. ${(err as Error).message}`);
      }

      const options: StartServerOptions =
        { root: argv.dir ?? argv.root,
          port: argv.port,
          host: argv.host,
          mounts };

      startServer(options);
    })
  .strict()
  .help('help')
  .alias('help', 'h')
  .version('version', 'Print version', version)
  .alias('version', 'v')
  .exitProcess(false)
  .fail(
    (msg: string, err: Error | undefined, y: Argv) => {
      const message =
        err?.message
          ? String(err.message)
          : msg;

      if (message) {
        process.stderr.write(
          `${message}\n\n`);
      }

      y.showHelp();

      process.exitCode = 1;
    })
  .parse();
