import fsp from 'node:fs/promises';
import path from 'node:path';
import type {
    IncomingMessage,
    ServerResponse
  } from 'node:http';
import * as send from '../send.js';
import {
    LiveReloadSupport
  } from './live-reload.js';
import {
    VirtualFolders
  } from '../virtual-folders.js';
import type {
    IRequestHandler
  } from '../module.js';
import {
    safePath
  } from '../receive.js';

export class StaticFilesRequestHandler
  implements
    IRequestHandler
{
  private readonly virtualFolders: VirtualFolders;
  private readonly liveReloadSupport: LiveReloadSupport;

  constructor(
      virtualFolders: VirtualFolders,
      liveReloadSupport: LiveReloadSupport
    )
  {
    this.virtualFolders = virtualFolders;
    this.liveReloadSupport = liveReloadSupport;
  }

  public async tryHandleRequest(
      request: IncomingMessage,
      response: ServerResponse,
      url: URL
    ): Promise<boolean>
  {
    const pathname =
      decodeURIComponent(url.pathname);

    const safeUrlPath =
      safePath(
        pathname.startsWith('/')
        ? pathname.slice(1)
        : pathname);

    if (safeUrlPath === null) {
      send.forbidden(
        response);
      return true;
    }

    // Resolve file path
    let filePath =
      this.virtualFolders
        .resolve(safeUrlPath)
        .path;

    if (!filePath) {
      send.forbidden(
        response);
      return true;
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
      send.notFound(response);
      return true;
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
          this.liveReloadSupport.injectReloadScript(html);

        send.html(
          response,
          htmlWithReload);
      } catch (error) {
        send.error(
          response,
          error);
      }
      return true;
    }

    send.file(
      response,
      filePath);

    return true;
  }
}
