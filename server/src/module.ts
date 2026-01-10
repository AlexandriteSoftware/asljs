import {
    URL
  } from 'node:url';
import type {
    IncomingMessage,
    ServerResponse
  } from 'node:http';

export interface IRequestHandler {
    tryHandleRequest(
        request: IncomingMessage,
        response: ServerResponse,
        url: URL
      ): Promise<boolean>;
}