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
import { toMermaid }
  from './mermaid.js';

export interface ViewOptions
{
  /**
   * The requirement file or folder to view, relative to the working
   * directory.
   */
  target: string;

  port: number;

  host?: string;
}

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
.passed { color: #2e7d32; }
.failed { color: #c62828; }`;

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
    path.resolve(
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

  await new Promise<void>(
    (
        resolve,
        reject
      ) =>
    {
      server.once(
        'error',
        reject);

      server.listen(
        options.port,
        options.host ?? '127.0.0.1',
        () => resolve());
    }
  );

  const address =
    server.address() as AddressInfo;

  io.stdout.write(
    `Serving ${folder} at http://${address.address}:${address.port}/\n`);

  return server;
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
    send(
      response,
      200,
      'text/html; charset=utf-8',
      renderIndex(
        await loadGraph(target)));

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
    graph: RqGraph
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

        const status =
          node.kind === 'evidence'
          ? node.log.at(-1)?.status ?? 'Not run'
          : null;

        return `<li>${
          link === null
            ? label
            : `<a href="${escapeHtml(link)}">${label}</a>`
        }${
          status === null
            ? ''
            : ` <span class="${
              status.toLowerCase().replace(
                ' ',
                '-')
            }">(evidence, ${status})</span>`
        }</li>`;
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
          href))
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
