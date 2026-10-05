import { observable }
  from 'asljs-observable';
import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { bindEventModel }
  from './bind-event-model.js';
import { EventBindingSpec }
  from './types.js';

const TEST_SUITE = 'bind-event-model';

test(
  `${TEST_SUITE}: invokes resolved handler and updates reactively`,
  () =>
  {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const calls: string[] = [ ];

    const model =
      createReactiveModel(
        { activate:
            (
                _event: Event,
                _model: Record<string, unknown>,
                _element: Element
              ) =>
            {
          calls.push('first');
        } });

    const spec: EventBindingSpec =
      { kind: 'event',
        eventName: 'click',
        actionPath: 'activate' };

    bindEventModel(
      button,
      spec,
      model,
      'event[0]',
      () => { });

    button.dispatchEvent(
      new dom.window.Event('click'));

    model.activate =
      () =>
      {
      calls.push('second');
    };

    model.emit(
      'change',
      [ { kind: 'set',
          property: 'activate',
          value: model.activate,
          previous: undefined } ]);

    button.dispatchEvent(
      new dom.window.Event('click'));

    assert.deepEqual(
      calls,
      [ 'first',
        'second' ]);
  });

test(
  `${TEST_SUITE}: disposer removes listener and subscription`,
  () =>
  {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const calls: string[] = [ ];

    const model =
      createReactiveModel(
        { activate:
            () =>
            {
          calls.push('active');
        } });

    const spec: EventBindingSpec =
      { kind: 'event',
        eventName: 'click',
        actionPath: 'activate' };

    const dispose =
      bindEventModel(
        button,
        spec,
        model,
        'event[2]',
        () => { });

    assert.equal(
      dispose(),
      true);

    model.activate =
      () =>
      {
      calls.push('updated');
    };

    model.emit(
      'change',
      [ { kind: 'set',
          property: 'activate',
          value: model.activate,
          previous: undefined } ]);

    button.dispatchEvent(
      new dom.window.Event('click'));

    assert.deepEqual(
      calls,
      [ ]);

    assert.equal(
      dispose(),
      false);
  });

test(
  `${TEST_SUITE}: refreshes nested action path when leaf and ancestor change`,
  () =>
  {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const calls: string[] = [ ];

    const model =
      observable(
        { user:
            { activate:
                () =>
                {
            calls.push('first');
          } } },
        { deep: true });

    const spec: EventBindingSpec =
      { kind: 'event',
        eventName: 'click',
        actionPath: 'user.activate' };

    bindEventModel(
      button,
      spec,
      model,
      'event[3]',
      () => { });

    button.dispatchEvent(
      new dom.window.Event('click'));

    model.user.activate =
      () =>
      {
      calls.push('second');
    };

    button.dispatchEvent(
      new dom.window.Event('click'));

    model.user =
      observable(
        { activate:
            () =>
            {
          calls.push('third');
        } });

    button.dispatchEvent(
      new dom.window.Event('click'));

    assert.deepEqual(
      calls,
      [ 'first',
        'second',
        'third' ]);
  });

test(
  `${TEST_SUITE}: calls an action with the model as this`,
  () =>
  {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const model =
      observable(
        { count: 0,
          increment()
        {
          this.count++;
        } });

    bindEventModel(
      button,
      { kind: 'event',
        eventName: 'click',
        actionPath: 'increment' },
      model,
      'event[4]',
      () => { });

    button.dispatchEvent(
      new dom.window.Event('click'));

    assert.equal(
      model.count,
      1);
  });

test(
  `${TEST_SUITE}: calls a nested action with the object that holds it as this`,
  () =>
  {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const calls: string[] = [ ];

    class User
    {
      constructor(
        readonly name: string
      )
      {
      }

      activate(): void
      {
        calls.push(this.name);
      }
    }

    const model: Record<string, unknown> =
      { user:
          new User('first') };

    bindEventModel(
      button,
      { kind: 'event',
        eventName: 'click',
        actionPath: 'user.activate' },
      model,
      'event[5]',
      () => { });

    button.dispatchEvent(
      new dom.window.Event('click'));

    // The same method on another object: the action is unchanged, the
    // object that holds it is not.
    model.user =
      new User('second');

    button.dispatchEvent(
      new dom.window.Event('click'));

    assert.deepEqual(
      calls,
      [ 'first',
        'second' ]);
  });

test(
  `${TEST_SUITE}: a bound action keeps its own this`,
  () =>
  {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const target =
      { name: 'bound' };

    const calls: unknown[] = [ ];

    const model: Record<string, unknown> =
      { save:
          function (
        this: unknown
      ): void
      {
        calls.push(this);
      }.bind(target) };

    bindEventModel(
      button,
      { kind: 'event',
        eventName: 'click',
        actionPath: 'save' },
      model,
      'event[6]',
      () => { });

    button.dispatchEvent(
      new dom.window.Event('click'));

    assert.deepEqual(
      calls,
      [ target ]);
  });

test(
  `${TEST_SUITE}: warns when the action is not a function`,
  () =>
  {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const warnings: string[] = [ ];

    bindEventModel(
      button,
      { kind: 'event',
        eventName: 'click',
        actionPath: 'save' },
      { save: 'not a function' },
      'event[7]',
      (
          key: string
        ) =>
      {
        warnings.push(key);
      });

    button.dispatchEvent(
      new dom.window.Event('click'));

    assert.deepEqual(
      warnings,
      [ 'event[7]:missing-action:save' ]);
  });

test(
  `${TEST_SUITE}: warns with the error when the action throws`,
  () =>
  {
    const dom =
      new JSDOM('<button></button>');

    const button =
      dom.window.document.querySelector('button') as HTMLElement;

    const failure =
      new Error('failed');

    const warnings: Array<[string, unknown]> = [ ];

    bindEventModel(
      button,
      { kind: 'event',
        eventName: 'click',
        actionPath: 'save' },
      { save:
          () =>
          {
          throw failure;
        } },
      'event[8]',
      (
          key: string,
          _message: string,
          error?: unknown
        ) =>
      {
        warnings.push(
          [ key,
            error ]);
      });

    assert.doesNotThrow(
      () =>
        button.dispatchEvent(
          new dom.window.Event('click')));

    assert.deepEqual(
      warnings,
      [ [ 'event[8]:action-error:save',
          failure ] ]);
  });

type ReactiveModel =
  & Record<string, unknown>
  & {
    on: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => () => boolean;
    off: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => void;
    emit: (
      event: string,
      ...args: unknown[]
    ) => void;
  };

function createReactiveModel(
    initial: Record<string, unknown>
  ): ReactiveModel
{
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  const model: ReactiveModel =
    { ...initial,
      on:
        (
            event,
            listener
          ) =>
        {
      if (!listeners.has(event)) {
        listeners.set(
          event,
          new Set());
      }

      listeners.get(event)?.add(listener);

      return () => listeners.get(event)?.delete(listener) ?? false;
    },
      off:
        (
            event,
            listener
          ) =>
        {
      listeners.get(event)?.delete(listener);
    },
      emit:
        (
            event,
            ...args
          ) =>
        {
      const registered =
        listeners.get(event);

      if (!registered) {
        return;
      }

      for (const listener of [ ...registered ]) {
        listener(
          ...args);
      }
    } };

  return model;
}
