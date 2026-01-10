/**
 * Functions for sending HTTP responses.
 *
 * Exported helpers:
 * 
 * - `options(ServerResponse, OutgoingHttpHeaders): void`
 * - `api(ServerResponse, unknown): void`
 * - `apiError(ServerResponse, unknown): void`
 * - `json(ServerResponse, number, unknown): void`
 * - `html(ServerResponse, string): void`
 * - `badRequest(ServerResponse, string?): void`
 * - `forbidden(ServerResponse, string?): void`
 * - `notFound(ServerResponse, string?): void`
 * - `methodNotAllowed(ServerResponse, string?): void`
 * - `error(ServerResponse, unknown): void`
 * - `file(ServerResponse, string): Promise<void>`
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import type { OutgoingHttpHeaders } from 'node:http';
import type { ServerResponse } from 'node:http';

// Map of file extensions to content types.
// Used by `file()` to set the Content-Type header.
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

/**
 * Returns the content type for the specified file path, based on its extension.
 */
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

/**
 * Sends an empty response to the client for an OPTIONS request.
 * Typically used for CORS preflight requests.
 */
export function options(
    response: ServerResponse,
    headers: OutgoingHttpHeaders
  ) : void
{
  response.writeHead(204, headers);
  response.end();
}

/**
 * Sends a JSON API response with status 200.
 */
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

/**
 * Sends an API error message to the response with status 500.
 */
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

/**
 * Sends a JSON string to the response with the specified status.
 */
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

/**
 * Sends an HTML string to the response with status 200.
 */
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

/**
 * Sends a "Bad request" error message to the response with status 400.
 */
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

/**
 * Sends a "Forbidden" error message to the response with status 403.
 */
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

/**
 * Sends a "Not found" error message to the response with status 404.
 */
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

/**
 * Sends a "Method not allowed" error message to the response with status 405.
 */
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

/**
 * Sends an error message to the response with status 500.
 */
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

/**
 * Sends a static file, specified by `filePath`, to the response,
 * asynchronously.
 */
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
