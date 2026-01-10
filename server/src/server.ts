import http from 'node:http';
import path from 'node:path';
import {
    URL,
    pathToFileURL
  } from 'node:url';
import type {
    IncomingMessage,
    Server as HttpServer,
    ServerResponse
  } from 'node:http';
import * as send from './send.js';
import {
    VirtualFolders
  } from './virtual-folders.js';
import {
    LiveReloadSupport
  } from './modules/live-reload.js';
import {
    FilesystemApi
  } from './modules/filesystem-api.js';
import {
    StaticFilesRequestHandler
  } from './modules/static-files.js';
import {
    IRequestHandler
  } from './module.js';

export type ServerLogger =
  { log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void; };

export type StartServerOptions =
  { root?: string;
    port?: number;
    host?: string;
    fsapi?: boolean;
    logger?: ServerLogger;
    mounts?: Record<string, string>; };

export class Server {
  private readonly root: string;
  private readonly port: number;
  private readonly host: string;
  private readonly logger: ServerLogger;
  private readonly filesDir: string;
  private readonly virtualFolders: VirtualFolders;
  private readonly requestHandlers: Array<IRequestHandler>;
  private readonly server: HttpServer;

  public constructor(
      { root = '.',
        port = 3000,
        host = 'localhost',
        logger = console,
        mounts = { }
      }: StartServerOptions = {}
    )
  {
    this.root = root;
    this.port = port;
    this.host = host;
    this.logger = logger;

    this.filesDir =
      path.resolve(this.root);

    this.virtualFolders =
      new VirtualFolders(
        this.filesDir,
        mounts);

    const liveReloadSupport =
      new LiveReloadSupport(
        this.virtualFolders);

    const filesystemApi =
      new FilesystemApi(
        this.filesDir,
        this.virtualFolders);

    const staticFilesHandler =
      new StaticFilesRequestHandler(
        this.virtualFolders,
        liveReloadSupport);

    this.requestHandlers =
      [ liveReloadSupport,
        filesystemApi,
        staticFilesHandler ];

    liveReloadSupport.start();

    this.server =
      http.createServer(
        (
          request: IncomingMessage,
          response: ServerResponse
        ) => {
          if (request.method === 'OPTIONS') {
            return send.options(
              response,
              { 'access-control-allow-origin': '*',
                'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
                'access-control-allow-headers': 'content-type' });
          }

          this.logger.log(`${request.method} ${request.url}`);

          this.serve(
            request,
            response,
            new URL(
              request.url || '/',
              `http://${request.headers.host || `${this.host}:${this.port}`}`))
            .catch(
              error => {
                this.logger.error(error);

                send.error(
                  response,
                  error);
              });
        });

    this.server.on(
      'close',
      () => {
        liveReloadSupport.stop();
      });
  }

  public listen(
    ): HttpServer
  {
    this.server.listen(
      this.port,
      this.host,
      () => {
        this.logger.log(`FILES: ${this.filesDir}`);

        for (const mount of this.virtualFolders.mounts) {
          this.logger.log(
            `VIRTUAL FOLDER:   /${mount.virtual} -> ${mount.rootDir}`);
        }

        this.logger.log(`URL:   http://${this.host}:${this.port}`);
      });

    return this.server as HttpServer;
  }

  private async serve(
      request: IncomingMessage,
      response: ServerResponse,
      url: URL
    ): Promise<void>
  {
    for (const handler of this.requestHandlers) {
      try {
        if (await handler.tryHandleRequest(
              request,
              response,
              url))
        {
          return;
        }
      } catch (error) {
        this.logger.error(error);

        send.error(
          response,
          error as Error);

        return;
      }
    }

    send.notFound(
      response);
  }
}

export function startServer(
    options: StartServerOptions = {}
  ): HttpServer
{
  return new Server(options)
    .listen();
}

const entryFile =
  process.argv[1];

if (entryFile
  && import.meta.url === pathToFileURL(entryFile).href)
{
  startServer();
}
