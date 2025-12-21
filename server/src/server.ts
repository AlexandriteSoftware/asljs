import http from 'node:http';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {
    URL,
    pathToFileURL
  } from 'node:url';
import type {
    IncomingMessage,
    Server
  } from 'node:http';
import type {
    ServerResponse
  } from 'node:http';
import * as send from './send.js';
import {
    watchStaticTree
  } from './watch.js';

function isPathInside(
    child: string,
    parent: string
  ) : boolean
{
  const resolved =
    path.resolve(child);

  return resolved === parent
    || resolved.startsWith(parent + path.sep);
}

// inject minimal client into served HTML
const RELOAD_SNIPPET =
  `<script>
try {
  const es = new EventSource('/__events');
  es.addEventListener('reload', () => location.reload());
} catch (_) {}
</script>`;

const safeJsonName =
  (name: unknown): string | null =>
    typeof name === 'string'
      && /^[a-zA-Z0-9._/-]+$/.test(name)
      ? name
      : null;

function readBody(
    request: IncomingMessage,
    limit: number
  ): Promise<string>
{
  return new Promise<string>(
    (resolve, reject) => {
      let size = 0;

      const chunks: Buffer[] = [];

      request.on(
        'data',
        chunk => {
          const buffer = Buffer.isBuffer(chunk)
            ? chunk
            : Buffer.from(chunk);

          size += buffer.length;

          if (size > limit) {
            reject(
              new Error('Payload too large'));

            request.destroy();

            return;
          }

          chunks.push(buffer);
        });

      request.on(
        'end',
        () =>
          resolve(
            Buffer.concat(chunks)
              .toString('utf8')));

      request.on(
        'error',
        reject);
    });
}

export type ServerLogger = {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

export type StartServerOptions = {
  root?: string;
  port?: number;
  host?: string;
  logger?: ServerLogger;
};

const options =
  { 'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
    'access-control-allow-headers': 'content-type' };

export function startServer(
    {
      root = '.',
      port = 3000,
      host = 'localhost',
      logger = console
    }: StartServerOptions = {}
  ): Server
{
  const FILES_DIR =
    path.resolve(root);

  // ---------- hot reload (SSE)

  const sseClients =
    new Set<ServerResponse>();

  const sseHeaders =
    { 'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'connection': 'keep-alive',
      'x-accel-buffering': 'no' };

  const serveSSE =
    (
        req: IncomingMessage,
        res: ServerResponse
      ): void =>
    {
      res.writeHead(200, sseHeaders);
      res.write(': connected\n\n'); // comment = keep-alive

      sseClients.add(res);

      const ping =
        setInterval(
          () => res.write(': ping\n\n'),
          30000);

      req.on(
        'close',
        () => {
          clearInterval(ping);
          sseClients.delete(res);
        });
    };

  let reloadPending = false;

  const broadcastReload =
    (): void => {
      if (reloadPending)
        return;

      reloadPending = true;

      setTimeout(
        () => {
          reloadPending = false;

          for (const res of sseClients) {
            res.write('event: reload\n');
            res.write('data: now\n\n');
          }
        },
        50);
    };

  watchStaticTree(
    FILES_DIR,
    () => broadcastReload());

  // ---------- JSON API helpers

  const jsonFilePath =
    (name: string | null): string | null => {
      const base =
        safeJsonName(name);

      if (!base)
        return null;

      const file =
        base.endsWith('.json')
          ? base
          : (base + '.json');

      const full =
        path.join(FILES_DIR, file);

      return isPathInside(full, FILES_DIR)
        ? full
        : null;
    };

  async function handleJsonApi(
      request: IncomingMessage,
      response: ServerResponse,
      url: URL
    ): Promise<void>
  {
    await fsp.mkdir(
      FILES_DIR,
      { recursive: true });

    const name =
      url.searchParams.get('file');

    const file =
      jsonFilePath(name);

    if (!file) {
      return send.badRequest(
        response,
        'Invalid "file" name. Allowed: [a-zA-Z0-9._-] and optional .json');
    }

    if (request.method === 'GET') {
      try {
        return send.json(
          response,
          200,
          await fsp.readFile(file, 'utf8'));
      } catch (e) {
        if (e && typeof e === 'object' && 'code' in e && (e as { code: unknown }).code === 'ENOENT')
          return send.notFound(response, 'JSON file not found');
        throw e;
      }
    }

    if (request.method === 'PUT'
      || request.method === 'POST')
    {
      try {
        // 1MB limit
        const body =
          await readBody(request, 1_000_000);

        let parsed: unknown;
        try {
          parsed = JSON.parse(body);
        } catch {
          return send.badRequest(
            response,
            'Invalid JSON');
        }

        await fsp.writeFile(
          file,
          JSON.stringify(parsed, null, 2) + '\n',
          'utf8');

        return send.api(
          response,
          { file: path.basename(file) });
      } catch (error) {
        return send.apiError(
          response,
          error);
      }
    }

    return send.methodNotAllowed(
      response,
      'GET, PUT, POST');
  }

  async function serveStatic(
      request: IncomingMessage,
      response: ServerResponse,
      url: URL
    ): Promise<void>
  {
    const pathname =
      decodeURIComponent(url.pathname);

    // SSE endpoint
    if (pathname === '/__events') {
      return serveSSE(
        request,
        response);
    }

    // JSON API: /api/json?file=name[.json]
    if (pathname === '/api/json') {
      return handleJsonApi(
        request,
        response,
        url);
    }

    // Resolve file path
    let filePath =
      path.normalize(
        path.join(
          FILES_DIR,
          pathname));

    if (!isPathInside(filePath, FILES_DIR)) {
      return send.forbidden(
        response);
    }

    // If path is dir, try index.html
    try {
      const stat =
        await fsp.stat(filePath);

      if (stat.isDirectory()) {
        filePath =
          path.join(
            filePath,
            'index.html');

        await fsp.stat(filePath);
      }
    } catch {
      return send.notFound(response);
    }

    const ext =
      path.extname(filePath)
        .toLowerCase();

    // HTML: inject hot-reload snippet
    if (ext === '.html'
        && request.method === 'GET')
    {
      try {
        const html =
          await fsp.readFile(filePath, 'utf8');

        const htmlWithReload =
          html.includes('/__events')
            ? html
            : html.replace(
                /<\/body\s*>/i,
                m => `${RELOAD_SNIPPET}\n${m}`) +
            (!html.match(/<\/body\s*>/i)
              ? `\n${RELOAD_SNIPPET}`
              : '');

        return send.html(
          response,
          htmlWithReload);
      } catch (error) {
        return send.error(
          response,
          error);
      }
    }

    return send.file(
      response,
      filePath);
  }

  const server =
    http.createServer(
      (
        request: IncomingMessage,
        response: ServerResponse
      ) => {
        if (request.method === 'OPTIONS') {
          return send.options(
            response,
            options);
        }

        logger.log(`${request.method} ${request.url}`);

        serveStatic(
          request,
          response,
          new URL(
            request.url || '/',
            `http://${request.headers.host || `${host}:${port}`}`))
          .catch(
            error => {
              logger.error(error);

              send.error(
                response,
                error);
            });
      });

  server.listen(
    port,
    host,
    () => {
      logger.log(`FILES: ${FILES_DIR}`);
      logger.log(`URL:   http://${host}:${port}`);
    });

  return server as Server;
}

const entryFile =
  process.argv[1];

if (entryFile
  && import.meta.url === pathToFileURL(entryFile).href)
{
  startServer();
}
