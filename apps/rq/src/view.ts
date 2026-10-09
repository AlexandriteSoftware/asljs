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
import { display,
         loadGraph,
         RqGraph }
  from './graph.js';
import { Io }
  from './io.js';
import { getAppearance,
         toMermaid }
  from './mermaid.js';
import { resolveTarget }
  from './scope.js';
import { getStatuses,
         NodeStatus }
  from './status.js';

export interface ViewOptions
{
  /**
   * The requirement file or folder to view, relative to the working
   * directory.
   */
  target: string;

  /**
   * The port to listen on, exactly; 0 picks a free one. When absent, the
   * first free port from `DEFAULT_PORT` on.
   */
  port?: number;

  host?: string;
}

/**
 * The first port `rq view` tries without `--port`.
 */
export const DEFAULT_PORT = 3000;

/**
 * How many ports from `DEFAULT_PORT` on `rq view` tries.
 */
const PORT_ATTEMPTS = 100;

const MERMAID_MODULE =
  'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

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
code { font-family: ui-monospace, monospace; }
.neutral { color: #757575; }
.green { color: #2e7d32; }
.red { color: #c62828; }
.amber { color: #b26a00; }`;

/**
 * Starts a web server for a requirement file or folder. `/` shows the graph,
 * whose nodes open the documents; a `.md` file of the folder is shown
 * rendered and any other file as it is. The graph is reloaded on every
 * request for `/`.
 */
export async function execView(
    io: Io,
    options: ViewOptions
  ): Promise<Server>
{
  const target =
    await resolveTarget(
      io.cwd,
      options.target);

  const folder =
    (await loadGraph(target)).folder;

  const server =
    createServer(
      (
          request,
          response
        ) =>
      {
      handle(
        target,
        folder,
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

  const address =
    server.address() as AddressInfo;

  io.stdout.write(
    `Serving ${folder} at http://${address.address}:${address.port}/\n`);

  return server;
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
    target: string,
    folder: string,
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
    const graph =
      await loadGraph(target);

    send(
      response,
      200,
      'text/html; charset=utf-8',
      renderIndex(
        graph,
        getStatuses(graph)));

    return;
  }

  const file =
    path.resolve(
      folder,
      `.${pathname}`);

  const relative =
    path.relative(
      folder,
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
      renderDocument(
        await readFile(
          file,
          'utf8'),
        path.basename(file)));

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

function renderIndex(
    graph: RqGraph,
    statuses: ReadonlyMap<string, NodeStatus>
  ): string
{
  const href =
    (
        file: string
      ): string | null =>
    {
    const relative =
      display(
        graph,
        file);

    return relative.startsWith('../')
      ? null
      : `/${encodeURI(relative)}`;
  };

  const title =
    (graph.roots.length === 1
    ? graph.nodes.get(graph.roots[0])?.title
    : null)
    ?? 'Requirements';

  const items =
    [ ...graph.nodes.entries() ]
    .map(
      (
          [file, node]
        ) =>
      {
        const link =
          href(file);

        const label =
          escapeHtml(
            node.title
            ?? display(
              graph,
              file));

        const { status } = statuses.get(file)!;

        const { colour } =
          getAppearance(
            node,
            statuses.get(file));

        const coverage =
          node.kind === 'requirement'
          ? `, ${node.status.coverage?.status ?? 'NOT CHECKED'}`
          : '';

        return `<li>${
          link === null
            ? label
            : `<a href="${escapeHtml(link)}">${label}</a>`
        } <span class="${colour}">(${node.kind}, ${status}${coverage})</span></li>`;
      });

  const problems =
    graph.errors.length === 0
    ? ''
    : `<h2>Problems</h2>
<ul>
${
      graph.errors
        .map(
          error => `<li>${escapeHtml(error)}</li>`)
        .join('\n')
    }
</ul>
`;

  return page(
    title,
    `<h1>${escapeHtml(title)}</h1>
<pre class="mermaid">
${
      escapeHtml(
        toMermaid(
          graph,
          href,
          statuses))
    }
</pre>
${problems}<h2>Documents</h2>
<ul>
${items.join('\n')}
</ul>
<script type="module">
import mermaid from '${MERMAID_MODULE}';
mermaid.initialize({ startOnLoad: true, securityLevel: 'loose' });
</script>`);
}

function renderDocument(
    text: string,
    name: string
  ): string
{
  return page(
    name,
    `<p><a href="/">Requirements</a></p>
${
      marked.parse(
        text,
        { async: false })
    }`);
}

function page(
    title: string,
    body: string
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
</style>
</head>
<body>
${body}
</body>
</html>
`;
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

function escapeHtml(
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
