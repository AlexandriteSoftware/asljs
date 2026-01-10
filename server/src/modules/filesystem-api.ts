import fsp from 'node:fs/promises';
import path from 'node:path';
import type {
    IncomingMessage,
    ServerResponse
  } from 'node:http';
import * as send from '../send.js';
import {
    VirtualFolders
  } from '../virtual-folders.js';
import type {
    IRequestHandler
  } from '../module.js';
import {
    safePath,
    readBody
  } from '../receive.js';

export class FilesystemApi
  implements
    IRequestHandler
{
  public readonly filesDir: string;
  public readonly virtualFolders: VirtualFolders;

  constructor(
      filesDir: string,
      virtualFolders: VirtualFolders
    )
  {
    this.filesDir = filesDir;
    this.virtualFolders = virtualFolders;    
  }

  public async tryHandleRequest(
      request: IncomingMessage,
      response: ServerResponse,
      url: URL
    ): Promise<boolean>
  {
    const pathname =
      decodeURIComponent(url.pathname);

    // File API: /api/file?path=relative/path.ext
    if (pathname === '/api/file') {
      await this.handleFileApi(
        request,
        response,
        url);

      return true;
    }

    // Directory listing API: /api/files?path=relative/dir
    if (pathname === '/api/files') {
      await this.handleFilesApi(
        request,
        response,
        url);

      return true;
    }

    return false;
  }

  private fileApiPath(
      relativePath: string
    ): string | null
  {
    return this.virtualFolders
      .resolve(relativePath)
      .path;
  }

  private async handleFileApi(
      request: IncomingMessage,
      response: ServerResponse,
      url: URL
    ): Promise<void>
  {
    const relativePath =
      safePath(
        url.searchParams.get('path')
        || '');

    if (!relativePath) {
      return send.badRequest(
        response,
        'Invalid "path". Use a relative path with URL-style separators.');
    }

    const filePath =
      this.fileApiPath(relativePath);

    if (!filePath) {
      return send.forbidden(
        response);
    }

    if (request.method === 'GET') {
      return send.file(
        response,
        filePath);
    }

    if (request.method === 'PUT'
      || request.method === 'POST')
    {
      await fsp.mkdir(
        this.filesDir,
        { recursive: true });

      try {
        const body =
          await readBody(request, 1_000_000);

        await fsp.mkdir(
          path.dirname(filePath),
          { recursive: true });

        await fsp.writeFile(
          filePath,
          body,
          'utf8');

        return send.api(
          response,
          { path: relativePath });
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

  private async handleFilesApi(
      request: IncomingMessage,
      response: ServerResponse,
      url: URL
    ): Promise<void>
  {
    if (request.method !== 'GET') {
      return send.methodNotAllowed(
        response,
        'GET');
    }

    const relativePath =
      safePath(
        url.searchParams.get('path')
        || '');

    if (relativePath === null) {
      return send.badRequest(
        response,
        'Invalid "path". Use a relative directory path.');
    }

    const directoryPath =
      this.fileApiPath(relativePath);

    if (!directoryPath) {
      return send.forbidden(
        response);
    }

    try {
      const stat =
        await fsp.stat(directoryPath);

      if (!stat.isDirectory()) {
        return send.badRequest(
          response,
          '"path" must point to a directory');
      }
    } catch (error) {
      if (error
          && typeof error === 'object'
          && 'code' in error
          && (error as { code: unknown }).code === 'ENOENT')
      {
        return send.notFound(
          response,
          'Directory not found');
      }

      return send.error(
        response,
        error);
    }

    try {
      const entries =
        await fsp.readdir(
          directoryPath,
          { withFileTypes: true });

      const files =
        entries
          .filter(e => e.isFile())
          .map(e => e.name)
          .sort((a, b) => a.localeCompare(b));

      return send.api(
        response,
        { path: relativePath,
          files });
    } catch (error) {
      return send.apiError(
        response,
        error);
    }
  }
}
