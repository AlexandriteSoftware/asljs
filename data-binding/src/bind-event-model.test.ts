import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM
  } from 'jsdom';
import {
    observable
  } from 'asljs-observable';
import {
    bindEventModel
  } from './bind-event-model.js';
import {
    type EventBindingSpec
  } from './types.js';

const CONTEXT_NAME =
  'bind-event-model-test';

test(
  `${CONTEXT_NAME}: invokes resolved handler and updates reactively`,
  () => {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const calls: string[] = [];

    const model =
      createReactiveModel(
        {
          activate: (
              _event: Event,
              _model: Record<string, unknown>,
              _element: Element
            ) => {
              calls.push('first');
            }
        });

    const spec: EventBindingSpec =
      {
        kind: 'event',
        eventName: 'click',
        actionPath: 'activate',
        middleware: []
      };

    bindEventModel(
      button,
      spec,
      model,
      {},
      'event[0]',
      () => {});

    button.dispatchEvent(new dom.window.Event('click'));

    model.activate = (
      () => {
        calls.push('second');
      });

    model.emit('set:activate');

    button.dispatchEvent(new dom.window.Event('click'));

    assert.deepEqual(calls, [ 'first', 'second' ]);
  });

test(
  `${CONTEXT_NAME}: executes middleware right to left before action`,
  () => {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const order: string[] = [];

    const model =
      createReactiveModel(
        {
          activate: () => {
            order.push('action');
          }
        });

    const spec: EventBindingSpec =
      {
        kind: 'event',
        eventName: 'click',
        actionPath: 'activate',
        middleware: [
          { name: 'preventDefault', args: [] },
          { name: 'stopPropagation', args: [] }
        ]
      };

    const customMiddleware =
      {
        preventDefault: () => {
          order.push('preventDefault');
        },
        stopPropagation: () => {
          order.push('stopPropagation');
        }
      };

    bindEventModel(
      button,
      spec,
      model,
      { eventMiddleware: customMiddleware },
      'event[1]',
      () => {});

    button.dispatchEvent(new dom.window.Event('click'));

    assert.deepEqual(
      order,
      [ 'stopPropagation', 'preventDefault', 'action' ]);
  });

test(
  `${CONTEXT_NAME}: disposer removes listener and subscription`,
  () => {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const calls: string[] = [];

    const model =
      createReactiveModel(
        {
          activate: () => {
            calls.push('active');
          }
        });

    const spec: EventBindingSpec =
      {
        kind: 'event',
        eventName: 'click',
        actionPath: 'activate',
        middleware: []
      };

    const dispose =
      bindEventModel(
        button,
        spec,
        model,
        {},
        'event[2]',
        () => {});

    dispose();

    model.activate = () => {
      calls.push('updated');
    };

    model.emit('set:activate');
    button.dispatchEvent(new dom.window.Event('click'));

    assert.deepEqual(calls, []);
  });

test(
  `${CONTEXT_NAME}: refreshes nested action path when leaf and ancestor change`,
  () => {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const calls: string[] = [];

    const model =
      observable(
        {
          user:
            {
              activate: () => {
                calls.push('first');
              }
            }
        });

    const spec: EventBindingSpec =
      {
        kind: 'event',
        eventName: 'click',
        actionPath: 'user.activate',
        middleware: []
      };

    bindEventModel(
      button,
      spec,
      model as unknown as Record<string, unknown>,
      {},
      'event[3]',
      () => {});

    button.dispatchEvent(new dom.window.Event('click'));

    model.user.activate =
      () => {
        calls.push('second');
      };

    button.dispatchEvent(new dom.window.Event('click'));

    model.user =
      {
        activate: () => {
          calls.push('third');
        }
      };

    button.dispatchEvent(new dom.window.Event('click'));

    assert.deepEqual(
      calls,
      [ 'first', 'second', 'third' ]);
  });

type ReactiveModel =
  Record<string, unknown> &
  { on: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => () => boolean;
    emit: (
      event: string,
      ...args: unknown[]
    ) => void; };

function createReactiveModel(
    initial: Record<string, unknown>
  ): ReactiveModel
{
  const listeners =
    new Map<string, Set<(...args: unknown[]) => void>>();

  const model: ReactiveModel =
    {
      ...initial,
      on: (event, listener) => {
        if (!listeners.has(event)) {
          listeners.set(event, new Set());
        }

        listeners.get(event)?.add(listener);

        return () => listeners.get(event)?.delete(listener) ?? false;
      },
      emit: (event, ...args) => {
        const registered =
          listeners.get(event);

        if (!registered) {
          return;
        }

        for (const listener of registered) {
          listener(...args);
        }
      }
    };

  return model;
}
