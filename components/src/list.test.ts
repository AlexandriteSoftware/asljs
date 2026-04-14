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

let domRestore: (() => void) | null = null;
let isListLoaded = false;

const CONTEXT_NAME =
  'list-test';

test(
  `${CONTEXT_NAME}: renders item template with row context and data-bind`,
  async () => {
    await ensureDomAndListLoaded();

    resetDomBody();

    const list =
      document.createElement('asljs-list') as HTMLElement & {
        items: Record<string, unknown>[];
        updateComplete: Promise<boolean>;
      };

      list.innerHTML =
        `
          <template data-slot="container">
            <section class="rows"
                     data-role="items"></section>
          </template>
          <template data-slot="item">
            <article data-bind-class-odd="odd"
                     data-bind-class-even="even">
              <a data-bind-href="item.url"
                 data-bind-text="item.title"></a>
              <span data-bind-text="index"></span>
              <span data-bind-text="count"></span>
              <span data-bind-text="first"></span>
              <span data-bind-text="last"></span>
            </article>
          </template>
        `;

    list.items =
      [ { title: 'First', url: '/first' },
        { title: 'Second', url: '/second' } ];

    document.body.appendChild(list);

    await settle(list);

    const rows =
      list.querySelectorAll('article');

    assert.equal(rows.length, 2);

    const firstLink =
      rows[0]?.querySelector('a') as HTMLAnchorElement;

    const secondLink =
      rows[1]?.querySelector('a') as HTMLAnchorElement;

    assert.equal(firstLink.getAttribute('href'), '/first');
    assert.equal(firstLink.textContent, 'First');
    assert.equal(secondLink.getAttribute('href'), '/second');
    assert.equal(secondLink.textContent, 'Second');

    assert.equal(rows[0]?.classList.contains('even'), true);
    assert.equal(rows[0]?.classList.contains('odd'), false);
    assert.equal(rows[1]?.classList.contains('odd'), true);
    assert.equal(rows[1]?.classList.contains('even'), false);

    const row0Spans =
      rows[0]?.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;

    assert.equal(row0Spans[0]?.textContent, '0');
    assert.equal(row0Spans[1]?.textContent, '2');
    assert.equal(row0Spans[2]?.textContent, 'true');
    assert.equal(row0Spans[3]?.textContent, 'false');
  });

test(
  `${CONTEXT_NAME}: renders empty slot when items are empty`,
  async () => {
    await ensureDomAndListLoaded();

    resetDomBody();

    const list =
      document.createElement('asljs-list') as HTMLElement & {
        items: Record<string, unknown>[];
        updateComplete: Promise<boolean>;
      };

      list.innerHTML =
        `
          <template data-slot="empty">
            <div data-role="empty-value">No rows</div>
          </template>
          <template data-slot="item">
            <div data-bind-text="item.title"></div>
          </template>
        `;

    list.items = [];

    document.body.appendChild(list);

    await settle(list);

    const emptyValue =
      list.querySelector('[data-role="empty-value"]') as HTMLElement;

    assert.equal(emptyValue.textContent, 'No rows');
  });

test(
  `${CONTEXT_NAME}: rerenders on observable collection change`,
  async () => {
    await ensureDomAndListLoaded();

    resetDomBody();

    const list =
      document.createElement('asljs-list') as HTMLElement & {
        items: Record<string, unknown>[];
        updateComplete: Promise<boolean>;
      };

      list.innerHTML =
        `
          <template data-slot="item">
            <div data-bind-text="item.title"></div>
          </template>
        `;

    const items =
      observable<Record<string, unknown>[]>(
        [ { title: 'A' } ]);

    list.items = items;

    document.body.appendChild(list);

    await settle(list);

    assert.equal(
      list.querySelectorAll('[data-bind-text="item.title"]').length,
      1);

    items.push({ title: 'B' });

    await waitFor(
      () => list.querySelectorAll('[data-bind-text="item.title"]').length === 2);

    const renderedTitles =
      [ ...list.querySelectorAll('[data-bind-text="item.title"]') ]
        .map(element => element.textContent);

    assert.deepEqual(renderedTitles, [ 'A', 'B' ]);
  });

test(
  `${CONTEXT_NAME}: warns for missing item slot`,
  async () => {
    await ensureDomAndListLoaded();

    resetDomBody();

    const warnings: string[] = [];
    const previousWarn =
      console.warn;

    console.warn =
      (...args: unknown[]) => {
        warnings.push(String(args[0] ?? ''));
      };

    try {
      const list =
        document.createElement('asljs-list') as HTMLElement & {
          items: Record<string, unknown>[];
          updateComplete: Promise<boolean>;
        };

      list.items = [ { title: 'A' } ];

      document.body.appendChild(list);

      await settle(list);

      assert.equal(
        warnings.some(message =>
          message.includes('missing required template[data-slot="item"]')),
        true);
    } finally {
      console.warn = previousWarn;
    }
  });

test(
  `${CONTEXT_NAME}: warns for invalid container template and does not render items`,
  async () => {
    await ensureDomAndListLoaded();

    resetDomBody();

    const warnings: string[] = [];
    const previousWarn =
      console.warn;

    console.warn =
      (...args: unknown[]) => {
        warnings.push(String(args[0] ?? ''));
      };

    try {
      const list =
        document.createElement('asljs-list') as HTMLElement & {
          items: Record<string, unknown>[];
          updateComplete: Promise<boolean>;
        };

      list.innerHTML =
        `
          <template data-slot="container">
            <div class="rows"></div>
          </template>
          <template data-slot="item">
            <div data-bind-text="item.title"></div>
          </template>
        `;

      list.items = [ { title: 'A' } ];

      document.body.appendChild(list);

      await settle(list);

      assert.equal(
        warnings.some(message =>
          message.includes('container template must include [data-role="items"]')),
        true);

      assert.equal(
        list.querySelector('[data-bind-text="item.title"]'),
        null);
    } finally {
      console.warn = previousWarn;
    }
  });

async function ensureDomAndListLoaded(
  ): Promise<void>
{
  if (domRestore === null) {
    domRestore = installDom();
  }

  if (!isListLoaded) {
    await import('./list.js');
    isListLoaded = true;
  }
}

function resetDomBody(
  ): void
{
  document.body.replaceChildren();
}

async function settle(
    list: { updateComplete: Promise<boolean>; }
  ): Promise<void>
{
  await list.updateComplete;
  await nextTick();
  await list.updateComplete;
}

async function waitFor(
    predicate: () => boolean
  ): Promise<void>
{
  for (let index = 0; index < 50; index++) {
    if (predicate()) {
      return;
    }

    await nextTick();
  }

  throw new Error('waitFor timeout');
}

function nextTick(
  ): Promise<void>
{
  return new Promise(resolve => {
    setTimeout(
      () => {
        resolve();
      },
      0);
  });
}

function installDom(
  ): () => void
{
  const dom =
    new JSDOM(
      '<!doctype html><html><body></body></html>');

  const previous =
    {
      window: (globalThis as any).window,
      document: (globalThis as any).document,
      customElements: (globalThis as any).customElements,
      HTMLElement: (globalThis as any).HTMLElement,
      Event: (globalThis as any).Event,
      CustomEvent: (globalThis as any).CustomEvent,
      Node: (globalThis as any).Node,
      DocumentFragment: (globalThis as any).DocumentFragment,
      requestAnimationFrame: (globalThis as any).requestAnimationFrame,
    };

  (globalThis as any).window = dom.window;
  (globalThis as any).document = dom.window.document;
  (globalThis as any).customElements = dom.window.customElements;
  (globalThis as any).HTMLElement = dom.window.HTMLElement;
  (globalThis as any).Event = dom.window.Event;
  (globalThis as any).CustomEvent = dom.window.CustomEvent;
  (globalThis as any).Node = dom.window.Node;
  (globalThis as any).DocumentFragment = dom.window.DocumentFragment;

  if ((globalThis as any).requestAnimationFrame === undefined) {
    (globalThis as any).requestAnimationFrame =
      (callback: FrameRequestCallback) => {
        return setTimeout(
          () => {
            callback(Date.now());
          },
          0) as unknown as number;
      };
  }

  return () => {
    (globalThis as any).window = previous.window;
    (globalThis as any).document = previous.document;
    (globalThis as any).customElements = previous.customElements;
    (globalThis as any).HTMLElement = previous.HTMLElement;
    (globalThis as any).Event = previous.Event;
    (globalThis as any).CustomEvent = previous.CustomEvent;
    (globalThis as any).Node = previous.Node;
    (globalThis as any).DocumentFragment = previous.DocumentFragment;
    (globalThis as any).requestAnimationFrame = previous.requestAnimationFrame;
    dom.window.close();
  };
}
