import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import type { OutgoingHttpHeaders } from 'node:http';
import type { ServerResponse } from 'node:http';

const CONTENT_TYPES =
  new Map<string, string>(
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

function contentTypeFor(
    filePath: string
  ): string
{
  const ext =
    path.extname(filePath)
      .toLowerCase();
        
  return CONTENT_TYPES.get(ext)
    || 'application/octet-stream';
}

export function options(
    response: ServerResponse,
    headers: OutgoingHttpHeaders
  ) : void
{
  response.writeHead(204, headers);
  response.end();
}

export function api(
    response: ServerResponse,
    payload: unknown
  ) : void
{
  response.writeHead(
    200,
    { 'content-type': 'application/json; charset=utf-8' });

  response.end(
    JSON.stringify(
      payload));
}

export function apiError(
    response: ServerResponse,
    error: unknown
  ) : void
{
  response.writeHead(
    500,
    { 'content-type': 'application/json; charset=utf-8' });

  const message =
    (error && typeof error === 'object' && 'message' in error)
      ? String((error as { message: unknown }).message)
      : String(error);

  response.end(
    JSON.stringify(
      { error: message }));
}

export function json(
    response: ServerResponse,
    status: number,
    jsonString: unknown
  ) : void
{
  response.writeHead(
    status,
    { 'content-type': 'application/json; charset=utf-8' });

  response.end(
    typeof jsonString === 'string'
    ? jsonString
    : JSON.stringify(jsonString));
}

export function html(
    response: ServerResponse,
    htmlString: string
  ) : void
{
  response.writeHead(
    200,
    { 'content-type': 'text/html; charset=utf-8' });

  response.end(htmlString);
}

export function badRequest(
    response: ServerResponse,
    message = 'Bad request'
  ) : void
{
  response.writeHead(
    400,
    { 'content-type': 'text/plain; charset=utf-8' });

  response.end(message);
}

export function forbidden(
    response: ServerResponse,
    message = 'Forbidden'
  ) : void
{
  response.writeHead(
    403,
    { 'content-type': 'text/plain; charset=utf-8' });

  response.end(message);
}

export function notFound(
    response: ServerResponse,
    message = 'Not found'
  ) : void
{
  response.writeHead(
    404,
    { 'content-type': 'text/plain; charset=utf-8' });

  response.end(message);
}

export function methodNotAllowed(
    response: ServerResponse,
    allowed = 'GET'
  ) : void
{
  response.writeHead(
    405,
    { 'content-type': 'text/plain; charset=utf-8',
      'allow': allowed });

  response.end(
    'Method not allowed');
}

export function error(
    response: ServerResponse,
    err: unknown
  ) : void
{
  response.writeHead(
    500,
    { 'content-type': 'text/plain; charset=utf-8' });

  const message =
    (err && typeof err === 'object' && 'stack' in err)
      ? String((err as { stack: unknown }).stack)
      : (err && typeof err === 'object' && 'message' in err)
        ? String((err as { message: unknown }).message)
        : String(err);

  response.end(message);
}

export async function file(
    response: ServerResponse,
    filePath: string
  ) : Promise<void>
{
  try {
    const stat =
      await fsp.stat(filePath);

    response.writeHead(
      200,
      { 'content-type': contentTypeFor(filePath),
        'content-length': stat.size });

    fs.createReadStream(filePath)
      .on('error', err => error(response, err))
      .pipe(response);
  } catch (err) {
    if (err
        && typeof err === 'object'
        && 'code' in err
        && (err as { code: unknown }).code === 'ENOENT')
      {
        return notFound(
          response);
      }

    return error(response, err);
  }
}
