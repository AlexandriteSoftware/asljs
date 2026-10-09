import { marked }
  from 'marked';
import { readFile,
         stat }
  from 'node:fs/promises';
import { createServer,
         IncomingMessage,
         Server,
         ServerResponse }
  from 'node:http';
import { AddressInfo }
  from 'node:net';
import path
  from 'node:path';

/**
 * The first port `startServer` tries without a port.
 */
export const DEFAULT_PORT = 3000;

/**
 * How many ports from `DEFAULT_PORT` on `startServer` tries.
 */
const PORT_ATTEMPTS = 100;

const CONTENT_TYPES: ReadonlyMap<string, string> =
  new Map(
    [ [ '.css',
        'text/css; charset=utf-8' ],
      [ '.gif',
        'image/gif' ],
      [ '.jpeg',
        'image/jpeg' ],
      [ '.jpg',
        'image/jpeg' ],
      [ '.js',
        'text/javascript; charset=utf-8' ],
      [ '.json',
        'application/json; charset=utf-8' ],
      [ '.png',
        'image/png' ],
      [ '.svg',
        'image/svg+xml' ],
      [ '.txt',
        'text/plain; charset=utf-8' ] ]);

const STYLE =
  `body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
pre { overflow-x: auto; }
pre:not(.mermaid) { background: #f4f4f4; padding: 0.75rem; }
code { font-family: ui-monospace, monospace; }`;

export interface ServerOptions
{
  /**
   * The folder whose files the server serves.
   */
  folder: string;

  /**
   * The HTML of `/`, made again on every request.
   */
  index: () => Promise<string>;

  /**
   * The text of the link back to `/` on a rendered document.
   */
  home: string;

  /**
   * CSS added to every page.
   */
  style?: string;

  /**
   * The port to listen on, exactly; 0 picks a free one. When absent, the
   * first free port from `DEFAULT_PORT` on.
   */
  port?: number;

  host?: string;
}

/**
 * Starts a web server for a folder: `/` is `index`, a `.md` file of the
 * folder is shown rendered, and any other file of the folder as it is;
 * nothing outside the folder is served. Returns once it listens.
 */
export async function startServer(
    options: ServerOptions
  ): Promise<Server>
{
  const server =
    createServer(
      (
          request,
          response
        ) =>
      {
      handle(
        options,
        request,
        response)
        .catch(
          (
              error: unknown
            ) =>
          {
            send(
              response,
              500,
              'text/plain; charset=utf-8',
              error instanceof Error
                ? error.message
                : String(error));
          });
    });

  const host = options.host ?? '127.0.0.1';

  if (options.port === undefined) {
    await listenOnFreePort(
      server,
      host);
  } else {
    await listen(
      server,
      options.port,
      host);
  }

  return server;
}

/**
 * The address a server listens on, e.g. `http://127.0.0.1:3000/`.
 */
export function serverUrl(
    server: Server
  ): string
{
  const address =
    server.address() as AddressInfo;

  return `http://${address.address}:${address.port}/`;
}

/**
 * An HTML page with the shared style and `style`.
 */
export function page(
    title: string,
    body: string,
    style = ''
  ): string
{
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
${STYLE}
${style}
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

export function escapeHtml(
    text: string
  ): string
{
  return text
    .replace(
      /&/g,
      '&amp;')
    .replace(
      /</g,
      '&lt;')
    .replace(
      />/g,
      '&gt;')
    .replace(
      /"/g,
      '&quot;');
}

function listen(
    server: Server,
    port: number,
    host: string
  ): Promise<void>
{
  return new Promise<void>(
    (
        resolve,
        reject
      ) =>
    {
      const fail =
        (
        error: Error
      ): void => reject(error);

      server.once(
        'error',
        fail);

      server.listen(
        port,
        host,
        () =>
        {
          server.off(
            'error',
            fail);

          resolve();
        });
    }
  );
}

/**
 * Listens on the first port from `DEFAULT_PORT` on that is not in use.
 */
async function listenOnFreePort(
    server: Server,
    host: string
  ): Promise<void>
{
  for (
    let offset = 0;
    offset < PORT_ATTEMPTS;
    offset += 1
  ) {
    try {
      await listen(
        server,
        DEFAULT_PORT + offset,
        host);

      return;
    } catch (error) {
      if (
        (error as NodeJS.ErrnoException).code
        !== 'EADDRINUSE'
      ) {
        throw error;
      }
    }
  }

  throw new Error(
    `No free port from ${DEFAULT_PORT} to ${
      DEFAULT_PORT + PORT_ATTEMPTS - 1
    }; give one with --port.`);
}

async function handle(
    options: ServerOptions,
    request: IncomingMessage,
    response: ServerResponse
  ): Promise<void>
{
  const pathname =
    decodeURIComponent(
      new URL(
        request.url ?? '/',
        'http://localhost')
      .pathname);

  if (pathname === '/') {
    send(
      response,
      200,
      'text/html; charset=utf-8',
      await options.index());

    return;
  }

  const file =
    path.resolve(
      options.folder,
      `.${pathname}`);

  const relative =
    path.relative(
      options.folder,
      file);

  if (
    relative.startsWith('..')
    || path.isAbsolute(relative)
    || !(await stat(file).catch(() => null))?.isFile()
  ) {
    send(
      response,
      404,
      'text/plain; charset=utf-8',
      `Not found: ${pathname}`);

    return;
  }

  if (file.toLowerCase().endsWith('.md')) {
    send(
      response,
      200,
      'text/html; charset=utf-8',
      page(
        path.basename(file),
        `<p><a href="/">${escapeHtml(options.home)}</a></p>
${
          marked.parse(
            await readFile(
              file,
              'utf8'),
            { async: false })
        }`,
        options.style));

    return;
  }

  send(
    response,
    200,
    CONTENT_TYPES.get(
      path.extname(file).toLowerCase())
      ?? 'application/octet-stream',
    await readFile(file));
}

function send(
    response: ServerResponse,
    status: number,
    contentType: string,
    body: string | Buffer
  ): void
{
  response.writeHead(
    status,
    { 'content-type': contentType });

  response.end(body);
}
