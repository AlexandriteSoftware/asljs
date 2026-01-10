import fs from 'node:fs';
import type {
    IncomingMessage,
    ServerResponse
  } from 'node:http';
import type {
    IRequestHandler
  } from '../module.js';
import {
    VirtualFolders
  } from '../virtual-folders.js';

export class LiveReloadSupport
  implements
    IRequestHandler
{
    private readonly clients =
      new Set<ServerResponse>();

  private readonly headers =
    { 'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'connection': 'keep-alive',
      'x-accel-buffering': 'no' };

    private readonly RELOAD_SNIPPET = `
      <script>
      try {
        const es = new EventSource('/__events');
        es.addEventListener('reload', () => location.reload());
      } catch (_) {}
      </script>
    `;

  private readonly stopWatchers: Array<() => void> = [ ];
  private readonly virtualFolders: VirtualFolders;

  private reloadPending = false;

  constructor(
      virtualFolders: VirtualFolders
    )
  {
    this.virtualFolders = virtualFolders;
  }

  public start(
    ): void
  {
    for (const mount of this.virtualFolders.mounts) {
      try {
        this.stopWatchers.push(
          watchStaticTree(
            mount.rootDir,
            () => this.broadcastReload()));
      } catch {
        // ignore
      }
    }
  }

  public stop(
    ): void
  {
    for (const stop of this.stopWatchers) {
      try {
        stop();
      } catch {}
    }
  }

  public async tryHandleRequest(
      request: IncomingMessage,
      response: ServerResponse,
      url: URL
    ): Promise<boolean>
  {
    const pathname =
      decodeURIComponent(url.pathname);

    if (pathname === '/__events') {
      this.connectClient(
        request,
        response);
    
      return true;
    }

    return false;
  }

  public connectClient(
      request: IncomingMessage,
      response: ServerResponse
    ): void
  {
    response.writeHead(200, this.headers);
    response.write(': connected\n\n');

    this.clients.add(response);

    const ping =
      setInterval(
        () => response.write(': ping\n\n'),
        30000);

    request.on(
      'close',
      () => {
        clearInterval(ping);
        this.clients.delete(response);
      });
  }

  public broadcastReload(
    ): void
  {
    if (this.reloadPending)
      return;

    this.reloadPending = true;

    setTimeout(
      () => {
        this.reloadPending = false;

        for (const res of this.clients) {
          res.write('event: reload\n');
          res.write('data: now\n\n');
        }
      },
      50);
  }

  public injectReloadScript(
      html: string
    ): string
  {
    const htmlWithReload =
      html.includes('/__events')
        ? html
        : html.replace(
            /<\/body\s*>/i,
            m => `${this.RELOAD_SNIPPET}\n${m}`)
          + (!html.match(/<\/body\s*>/i)
              ? `\n${this.RELOAD_SNIPPET}`
              : '');

    return htmlWithReload;
  }
}

function watchStaticTree(
    rootDir: string,
    onChange: () => void
  ): () => void
{
  // Best-effort cross-platform watcher.
  // On Windows/macOS, recursive fs.watch works.
  // On Linux, recursive is not supported, but this package is intended for dev-time usage.

  let watcher: fs.FSWatcher;

  try {
    watcher =
      fs.watch(
        rootDir,
        { recursive: true },
        () => onChange());
  } catch {
    watcher =
      fs.watch(
        rootDir,
        () => onChange());
  }

  return () => {
    try {
      watcher.close();
    } catch {}
  };
}
