/**
 * Simple static server + hot-reload (SSE) + JSON read/write API.
 *
 * Usage (direct): node server.js
 */

import http from 'node:http';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { URL, pathToFileURL } from 'node:url';
import * as send from './send.js';
import { watchStaticTree } from './watch.js';

const isPathInside =
  (child, parent) => {
    const resolved = path.resolve(child);
    return resolved === parent
      || resolved.startsWith(parent + path.sep);
  };

// inject minimal client into served HTML
const RELOAD_SNIPPET =
  `<script>
try {
  const es = new EventSource('/__events');
  es.addEventListener('reload', () => location.reload());
} catch (_) {}
</script>`;

// ---------- JSON API

const safeJsonName =
  (name) =>
    typeof name === 'string'
      && /^[a-zA-Z0-9._/-]+$/.test(name)
      ? name
      : null;

const jsonFilePath =
  (name) => {
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
  request,
  response,
  url)
{
  // FILES_DIR is injected via closure inside startServer
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
      if (e.code === 'ENOENT')
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

      let parsed;
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

function readBody(
  request,
  limit)
{
  return new Promise(
    (resolve, reject) => {
      let size = 0;

      const chunks = [];

      request.on(
        'data',
        chunk => {
          size += chunk.length;

          if (size > limit) {
            reject(
              new Error('Payload too large'));

            request.destroy();

            return;
          }

          chunks.push(chunk);
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

async function serveStatic(
  request,
  response,
  url)
{
  let pathname =
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

  if (!isPathInside(
    filePath,
    FILES_DIR))
  {
    return send.forbidden(response);
  }

  // If path is dir, try index.html
  let stat;
  try {
    stat =
      await fsp.stat(filePath);

    if (stat.isDirectory()) {
      filePath =
        path.join(
          filePath,
          'index.html');

      stat =
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
  } = {})
{
  const FILES_DIR =
    path.resolve(root);

  // ---------- hot reload (SSE)

  const sseClients =
    new Set();

  const sseHeaders =
    { 'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'connection': 'keep-alive',
      'x-accel-buffering': 'no' };

  const serveSSE =
    (req, res) => {
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
    () => {
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
    (name) => {
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
    request,
    response,
    url)
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
        if (e.code === 'ENOENT')
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

        let parsed;
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
    request,
    response,
    url)
  {
    let pathname =
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

    if (!isPathInside(
      filePath,
      FILES_DIR))
    {
      return send.forbidden(response);
    }

    // If path is dir, try index.html
    let stat;
    try {
      stat =
        await fsp.stat(filePath);

      if (stat.isDirectory()) {
        filePath =
          path.join(
            filePath,
            'index.html');

        stat =
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
      (request, response) => {
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
            request.url,
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

  return server;
}

const entryFile =
  process.argv[1];

if (entryFile
  && import.meta.url === pathToFileURL(entryFile).href)
{
  startServer();
}
