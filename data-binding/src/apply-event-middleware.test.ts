import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM
  } from 'jsdom';
import {
    applyEventMiddleware
  } from './apply-event-middleware.js';
import {
    type EventMiddlewareFn,
    type EventMiddlewareSpec
  } from './types.js';

const CONTEXT_NAME =
  'apply-event-middleware-test';

test(
  `${CONTEXT_NAME}: executes middleware from right to left`,
  () => {
    const order: string[] = [];

    const middleware: EventMiddlewareSpec[] =
      [
        { name: 'first', args: [] },
        { name: 'second', args: [] },
        { name: 'third', args: [] }
      ];

    const registry: Record<string, EventMiddlewareFn> =
      {
        first: () => {
          order.push('first');
        },
        second: () => {
          order.push('second');
        },
        third: () => {
          order.push('third');
        }
      };

    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    applyEventMiddleware(
      new dom.window.Event('click'),
      middleware,
      registry,
      { model: {}, element: button });

    assert.deepEqual(order, [ 'third', 'second', 'first' ]);
  });

test(
  `${CONTEXT_NAME}: warns for unknown middleware and continues`,
  () => {
    const warnings: string[] = [];
    const order: string[] = [];

    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    applyEventMiddleware(
      new dom.window.Event('click'),
      [
        { name: 'missing', args: [] },
        { name: 'ok', args: [] }
      ],
      {
        ok: () => {
          order.push('ok');
        }
      },
      { model: {}, element: button },
      warning => {
        warnings.push(`${warning.type}:${warning.middlewareName}`);
      });

    assert.deepEqual(warnings, [ 'unknown:missing' ]);
    assert.deepEqual(order, [ 'ok' ]);
  });

test(
  `${CONTEXT_NAME}: catches middleware errors and continues`,
  () => {
    const warnings: string[] = [];
    const order: string[] = [];

    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    applyEventMiddleware(
      new dom.window.Event('click'),
      [
        { name: 'boom', args: [] },
        { name: 'ok', args: [] }
      ],
      {
        boom: () => {
          throw new Error('boom');
        },
        ok: () => {
          order.push('ok');
        }
      },
      { model: {}, element: button },
      warning => {
        warnings.push(`${warning.type}:${warning.middlewareName}`);
      });

    assert.deepEqual(warnings, [ 'error:boom' ]);
    assert.deepEqual(order, [ 'ok' ]);
  });
