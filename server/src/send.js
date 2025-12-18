import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const CONTENT_TYPES =
  new Map(
    [ ['.html', 'text/html; charset=utf-8'],
      ['.htm', 'text/html; charset=utf-8'],
      ['.js', 'text/javascript; charset=utf-8'],
      ['.mjs', 'text/javascript; charset=utf-8'],
      ['.css', 'text/css; charset=utf-8'],
      ['.json', 'application/json; charset=utf-8'],
      ['.txt', 'text/plain; charset=utf-8'],
      ['.svg', 'image/svg+xml'],
      ['.png', 'image/png'],
      ['.jpg', 'image/jpeg'],
      ['.jpeg', 'image/jpeg'],
      ['.gif', 'image/gif'],
      ['.webp', 'image/webp'],
      ['.ico', 'image/x-icon'],
      ['.woff', 'font/woff'],
      ['.woff2', 'font/woff2'] ]);

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES.get(ext) || 'application/octet-stream';
}

export function options(
  response,
  headers)
{
  response.writeHead(204, headers);
  response.end();
}

export function api(
  response,
  payload)
{
  response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

export function apiError(
  response,
  error)
{
  response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ error: error?.message || String(error) }));
}

export function json(
  response,
  status,
  jsonString)
{
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(typeof jsonString === 'string'
    ? jsonString
    : JSON.stringify(jsonString));
}

export function html(
  response,
  htmlString)
{
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(htmlString);
}

export function badRequest(
  response,
  message = 'Bad request')
{
  response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(message);
}

export function forbidden(
  response,
  message = 'Forbidden')
{
  response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(message);
}

export function notFound(
  response,
  message = 'Not found')
{
  response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(message);
}

export function methodNotAllowed(
  response,
  allowed = 'GET')
{
  response.writeHead(405, { 'content-type': 'text/plain; charset=utf-8', 'allow': allowed });
  response.end('Method not allowed');
}

export function error(
  response,
  err)
{
  response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(err?.stack || err?.message || String(err));
}

export async function file(
  response,
  filePath)
{
  try {
    const stat = await fsp.stat(filePath);

    response.writeHead(
      200,
      { 'content-type': contentTypeFor(filePath),
        'content-length': stat.size });

    fs.createReadStream(filePath)
      .on('error', err => error(response, err))
      .pipe(response);
  } catch (err) {
    if (err?.code === 'ENOENT')
      return notFound(response);

    return error(response, err);
  }
}
