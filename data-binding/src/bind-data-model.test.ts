import { observable }
  from 'asljs-observable';
import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { bindDataModel }
  from './bind-data-model.js';

const TEST_SUITE =
  'bind-data-model';

test(
  `${TEST_SUITE}: applies pipes and writes to text target`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <span data-bind-text="name | upper"></span>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      { name: 'alex' }
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      'ALEX'
    );
  }
);

test(
  `${TEST_SUITE}: subscribes only to main path`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <span data-bind-text="name | default:unknown"></span>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const model =
      createReactiveModel(
        { name: '' });

    bindDataModel(
      root,
      model as unknown as Record<string, unknown>
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      'unknown'
    );

    model.name = 'Bob';
    model.emit('set:name');

    assert.equal(
      root.querySelector('span')?.textContent,
      'Bob'
    );
  }
);

test(
  `${TEST_SUITE}: updates nested value path via watch when ancestor and leaf change`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <span data-bind-text="user.name"></span>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const model =
      observable(
        { user: { name: 'Alice' } });

    bindDataModel(
      root,
      model as unknown as Record<string, unknown>
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      'Alice'
    );

    model.user.name = 'Bob';

    assert.equal(
      root.querySelector('span')?.textContent,
      'Bob'
    );

    model.user = { name: 'Carol' };

    assert.equal(
      root.querySelector('span')?.textContent,
      'Carol'
    );
  }
);

test(
  `${TEST_SUITE}: supports custom pipe injection`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <span data-bind-text="isActive | yesno"></span>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      { isActive: true },
      {
        pipes: {
          yesno: value =>
            value
              ? 'Yes'
              : 'No'
        }
      }
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      'Yes'
    );
  }
);

test(
  `${TEST_SUITE}: throws on unknown value pipe during setup`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <span data-bind-text="name | missing"></span>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    assert.throws(
      () =>
        bindDataModel(
          root,
          { name: 'Alex' }
        ),
      /Unknown pipe: missing/
    );
  }
);

test(
  `${TEST_SUITE}: supports multiple quoted pipe args`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-html="content | wrap:'<span>':'</span>'"></div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      { content: 'Hello' },
      {
        pipes: {
          wrap: (
            value,
            before,
            after
          ) => `${before}${value}${after}`
        }
      }
    );

    assert.equal(
      root.querySelector('div')?.innerHTML,
      '<span>Hello</span>'
    );
  }
);

test(
  `${TEST_SUITE}: formats date using literal with pipes and mixed quotes`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const span =
      dom.window.document.createElement('span');

    span.setAttribute(
      'data-bind-text',
      'createdAt | date:"<\'yyyy|MM|dd\' \\"hh:mm:ss\\">"'
    );

    root.appendChild(span);

    bindDataModel(
      root,
      {
        createdAt: new Date(2026, 3, 10, 13, 14, 15)
      }
    );

    assert.equal(
      span.textContent,
      `<\'2026|04|10\' "13:14:15">`
    );
  }
);

test(
  `${TEST_SUITE}: formats date using single-quoted literal with pipes`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <span data-bind-text="createdAt | date:'<yyyy|MM|dd &quot;hh:mm:ss&quot;>'"></span>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      {
        createdAt: new Date(2026, 3, 10, 13, 14, 15)
      }
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      '<2026|04|10 "13:14:15">'
    );
  }
);

test(
  `${TEST_SUITE}: removes attribute when path or pipe resolves to nullish`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <a data-bind-href="url"></a>
            <a data-bind-title="name | blankAsNull"></a>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      {
        url: undefined,
        name: ''
      },
      {
        pipes: {
          blankAsNull: value =>
          {
            if (value === '') {
              return null;
            }

            return value;
          }
        }
      }
    );

    const links =
      root.querySelectorAll('a');

    assert.equal(
      links[0].hasAttribute('href'),
      false
    );

    assert.equal(
      links[1].hasAttribute('title'),
      false
    );
  }
);

test(
  `${TEST_SUITE}: supports event binding and reactive action updates`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <button data-bind-onclick="activate"></button>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const calls: string[] = [];

    const model =
      createReactiveModel(
        {
        activate: () =>
        {
          calls.push('first');
        }
      });

    bindDataModel(
      root,
      model as unknown as Record<string, unknown>
    );

    const button =
      root.querySelector('button') as HTMLElement;

    button.dispatchEvent(
      new dom.window.Event('click')
    );

    model.activate = () =>
    {
      calls.push('second');
    };

    model.emit('set:activate');

    button.dispatchEvent(
      new dom.window.Event('click')
    );

    assert.deepEqual(
      calls,
      ['first', 'second']
    );
  }
);

test(
  `${TEST_SUITE}: updates nested event action path via watch when ancestor and leaf change`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <button data-bind-onclick="user.activate"></button>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const calls: string[] = [];

    const model =
      observable(
        {
        user: {
          activate: () =>
          {
            calls.push('first');
          }
        }
      });

    bindDataModel(
      root,
      model as unknown as Record<string, unknown>
    );

    const button =
      root.querySelector('button') as HTMLElement;

    button.dispatchEvent(
      new dom.window.Event('click')
    );

    model.user.activate = () =>
    {
      calls.push('second');
    };

    button.dispatchEvent(
      new dom.window.Event('click')
    );

    model.user = {
      activate: () =>
      {
        calls.push('third');
      }
    };

    button.dispatchEvent(
      new dom.window.Event('click')
    );

    assert.deepEqual(
      calls,
      ['first', 'second', 'third']
    );
  }
);

test(
  `${TEST_SUITE}: disposer removes event listeners`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <button data-bind-onclick="activate"></button>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const calls: number[] = [];

    const model =
      createReactiveModel(
        {
        activate: () =>
        {
          calls.push(1);
        }
      });

    const dispose =
      bindDataModel(
        root,
        model as unknown as Record<string, unknown>);

    dispose();

    const button =
      root.querySelector('button') as HTMLElement;

    button.dispatchEvent(
      new dom.window.Event('click')
    );

    assert.deepEqual(
      calls,
      []
    );
  }
);

test(
  `${TEST_SUITE}: supports multiple bindings on same element`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <a data-bind-href="url"
               data-bind-text="label | upper"
               data-bind-class-active="isActive"
               data-bind-onclick="openDetails"></a>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    let clicks = 0;

    const model =
      createReactiveModel(
        {
        url: 'https://example.com',
        label: 'details',
        isActive: true,
        openDetails: (event: Event) =>
        {
          event.preventDefault();
          clicks += 1;
        }
      });

    bindDataModel(
      root,
      model as unknown as Record<string, unknown>
    );

    const anchor =
      root.querySelector('a') as HTMLAnchorElement;

    assert.equal(
      anchor.getAttribute('href'),
      'https://example.com'
    );

    assert.equal(
      anchor.textContent,
      'DETAILS'
    );

    assert.equal(
      anchor.classList.contains('active'),
      true
    );

    const clickEvent =
      new dom.window.MouseEvent('click', { cancelable: true });

    anchor.dispatchEvent(clickEvent);

    assert.equal(
      clicks,
      1
    );

    assert.equal(
      clickEvent.defaultPrevented,
      true
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context switches model context for text binding`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="user">
              <span data-bind-text="name"></span>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      { user: { name: 'Alice' } }
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      'Alice'
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context switches model context for attribute binding`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="link">
              <a data-bind-href="url" data-bind-text="label"></a>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      { link: { url: 'https://example.com', label: 'Example' } }
    );

    const anchor =
      root.querySelector('a') as HTMLAnchorElement;

    assert.equal(
      anchor.getAttribute('href'),
      'https://example.com'
    );

    assert.equal(
      anchor.textContent,
      'Example'
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context switches model context for prop and class bindings`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="item">
              <button data-bind-class-active="selected" data-bind-prop-disabled="locked"></button>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      { item: { selected: true, locked: false } }
    );

    const button =
      root.querySelector('button') as HTMLButtonElement;

    assert.equal(
      button.classList.contains('active'),
      true
    );

    assert.equal(
      (button as HTMLButtonElement & Record<string, unknown>)['disabled'],
      false
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context switches model context for event binding`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="item">
              <button data-bind-onclick="save"></button>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const calls: string[] = [];

    bindDataModel(
      root,
      { item: { save: () => calls.push('saved') } }
    );

    const button =
      root.querySelector('button') as HTMLButtonElement;

    button.dispatchEvent(
      new dom.window.Event('click')
    );

    assert.deepEqual(
      calls,
      ['saved']
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context supports nested contexts`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="item">
              <div data-bind-context="author">
                <span data-bind-text="name"></span>
              </div>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      { item: { author: { name: 'Bob' } } }
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      'Bob'
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context rebinds descendants when context object changes`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="user">
              <span data-bind-text="name"></span>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const model =
      observable(
        { user: { name: 'Alice' } });

    bindDataModel(
      root,
      model as unknown as Record<string, unknown>
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      'Alice'
    );

    model.user = { name: 'Carol' };

    assert.equal(
      root.querySelector('span')?.textContent,
      'Carol'
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context rebinds correctly when nested context value changes`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="user">
              <span data-bind-text="name"></span>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const model =
      observable(
        { user: { name: 'Alice' } });

    bindDataModel(
      root,
      model as unknown as Record<string, unknown>
    );

    model.user.name = 'Bob';

    assert.equal(
      root.querySelector('span')?.textContent,
      'Bob'
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context handles null context without throwing`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="item">
              <span data-bind-text="name"></span>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    assert.doesNotThrow(
      () =>
        bindDataModel(
          root,
          { item: null as unknown as Record<string, unknown> }
        )
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      ''
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context handles undefined context without throwing`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="item">
              <span data-bind-text="name"></span>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    assert.doesNotThrow(
      () =>
        bindDataModel(
          root,
          { item: undefined as unknown as Record<string, unknown> }
        )
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      ''
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context cleans up old watchers on context replacement`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="user">
              <span data-bind-text="name"></span>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const model =
      observable(
        { user: { name: 'Alice' } });

    bindDataModel(
      root,
      model as unknown as Record<string, unknown>
    );

    const oldUser =
      model.user;

    model.user = { name: 'Carol' };

    // mutating the old user object should no longer update the span
    oldUser.name = 'Stale';

    assert.equal(
      root.querySelector('span')?.textContent,
      'Carol'
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context disposer cleans up subtree bindings`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="user">
              <span data-bind-text="name"></span>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const model =
      observable(
        { user: { name: 'Alice' } });

    const dispose =
      bindDataModel(
        root,
        model as unknown as Record<string, unknown>);

    dispose();

    model.user = { name: 'Carol' };

    assert.equal(
      root.querySelector('span')?.textContent,
      'Alice'
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context null context becomes active when path becomes object`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <div data-bind-context="user">
              <span data-bind-text="name"></span>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    const model =
      observable(
        { user: null as unknown });

    bindDataModel(
      root,
      model as unknown as Record<string, unknown>
    );

    assert.equal(
      root.querySelector('span')?.textContent,
      ''
    );

    model.user = { name: 'Dave' };

    assert.equal(
      root.querySelector('span')?.textContent,
      'Dave'
    );
  }
);

test(
  `${TEST_SUITE}: data-bind-context does not affect bindings outside the subtree`,
  () =>
  {
    const dom =
      new JSDOM(`
          <div id="root">
            <span data-bind-text="title"></span>
            <div data-bind-context="user">
              <span data-bind-text="name"></span>
            </div>
          </div>
        `);

    const root =
      dom.window.document.getElementById('root') as HTMLElement;

    bindDataModel(
      root,
      { title: 'Hello', user: { name: 'Alice' } }
    );

    const spans =
      root.querySelectorAll('span');

    assert.equal(
      spans[0].textContent,
      'Hello'
    );

    assert.equal(
      spans[1].textContent,
      'Alice'
    );
  }
);

type ReactiveModel =
  & Record<string, unknown>
  & {
    on: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => () => boolean;
    emit: (
      event: string,
      ...args: unknown[]
    ) => void;
  };

function createReactiveModel(
  initial: Record<string, unknown>
): ReactiveModel
{
  const listeners =
    new Map<string, Set<(...args: unknown[]) => void>>();

  const model: ReactiveModel =
    {
    ...initial,
    on: (event, listener) =>
    {
      if (!listeners.has(event)) {
        listeners.set(
          event,
          new Set()
        );
      }

      listeners.get(event)?.add(listener);

      return () => listeners.get(event)?.delete(listener) ?? false;
    },
    emit: (event, ...args) =>
    {
      const registered =
        listeners.get(event);

      if (!registered) {
        return;
      }

      for (const listener of registered) {
        listener(
          ...args
        );
      }
    }
  };

  return model;
}
