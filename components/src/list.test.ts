import { test }
  from 'node:test';
import assert
  from 'node:assert/strict';
import { JSDOM }
  from 'jsdom';
import { observable }
  from 'asljs-observable';

let domRestore: (() => void) | null = null;
let isComponentsLoaded = false;

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
  `${CONTEXT_NAME}: default fallback container is plain HTML`,
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

    list.items = [ { title: 'Plain' } ];

    document.body.appendChild(list);

    await settle(list);

    const container =
      list.querySelector('[data-role="default-container-host"]') as HTMLElement;

    assert.equal(container.className, '');
  });

test(
  `${CONTEXT_NAME}: supports context.select with row-local this.item`,
  async () => {
    await ensureDomAndListLoaded();

    resetDomBody();

    const selectedIds: string[] = [];

    const list =
      document.createElement('asljs-list') as HTMLElement & {
        items: Array<{ id: string; title: string }>;
        context: unknown;
        updateComplete: Promise<boolean>;
      };

    list.innerHTML =
      `
        <template data-slot="item">
          <button data-bind-text="item.title"
                  data-bind-onclick="context.select"></button>
        </template>
      `;

    list.context = {
      select(this: { item: { id: string } }) {
        selectedIds.push(this.item.id);
      }
    };

    list.items = [
      { id: 'a', title: 'First' },
      { id: 'b', title: 'Second' },
    ];

    document.body.appendChild(list);

    await settle(list);

    const buttons =
      list.querySelectorAll('button');

    buttons[0]?.dispatchEvent(new window.Event('click'));
    buttons[1]?.dispatchEvent(new window.Event('click'));

    assert.deepEqual(selectedIds, [ 'a', 'b' ]);
  });

test(
  `${CONTEXT_NAME}: renders item template from package default theme`,
  async () => {
    await ensureDomAndListLoaded();
    resetDomBody();

    const { setDefaultTheme } =
      await import('./themes/theme.js');

    setDefaultTheme(
      { list:
          { item:
              '<div class="theme-row" data-bind-text="item.title"></div>' } });

    try {
      const list =
        document.createElement('asljs-list') as HTMLElement & {
          items: Record<string, unknown>[];
          updateComplete: Promise<boolean>;
        };

      list.items = [ { title: 'From default theme' } ];

      document.body.appendChild(list);

      await settle(list);

      const themedRow =
        list.querySelector('.theme-row') as HTMLDivElement;

      assert.equal(themedRow.textContent, 'From default theme');
    } finally {
      setDefaultTheme(null);
    }
  });

test(
  `${CONTEXT_NAME}: renders templates from nearest theme provider`,
  async () => {
    await ensureDomAndListLoaded();
    resetDomBody();

    const provider =
      document.createElement('asljs-theme-provider') as HTMLElement & {
        theme: unknown;
      };

    provider.theme =
      { list:
          { container:
              '<section class="theme-container" data-role="items"></section>',
            item:
              '<article class="theme-card" data-bind-text="item.title"></article>' } };

    const list =
      document.createElement('asljs-list') as HTMLElement & {
        items: Record<string, unknown>[];
        updateComplete: Promise<boolean>;
      };

    list.items = [ { title: 'From provider theme' } ];

    provider.appendChild(list);
    document.body.appendChild(provider);

    await settle(list);

    const container =
      list.querySelector('.theme-container') as HTMLElement;

    const card =
      list.querySelector('.theme-card') as HTMLElement;

    assert.equal(container !== null, true);
    assert.equal(card.textContent, 'From provider theme');
  });

test(
  `${CONTEXT_NAME}: bootstrap theme provides list-group container`,
  async () => {
    await ensureDomAndListLoaded();
    resetDomBody();

    const bootstrapThemeModule =
      await import('./themes/bootstrap-theme.js');

    const list =
      document.createElement('asljs-list') as HTMLElement & {
        items: Record<string, unknown>[];
        theme: unknown;
        updateComplete: Promise<boolean>;
      };

    list.innerHTML =
      `
        <template data-slot="item">
          <div data-bind-text="item.title"></div>
        </template>
      `;

    list.theme = bootstrapThemeModule.createBootstrapTheme();
    list.items = [ { title: 'Bootstrap' } ];

    document.body.appendChild(list);

    await settle(list);

    const container =
      list.querySelector('.list-group') as HTMLElement;

    assert.equal(container !== null, true);
    assert.equal(container.getAttribute('data-role'), 'items');
  });

test(
  `${CONTEXT_NAME}: local slot template overrides themed item template`,
  async () => {
    await ensureDomAndListLoaded();
    resetDomBody();

    const { setDefaultTheme } =
      await import('./themes/theme.js');

    setDefaultTheme(
      { list:
          { item:
              '<div class="theme-row" data-bind-text="item.title"></div>' } });

    try {
      const list =
        document.createElement('asljs-list') as HTMLElement & {
          items: Record<string, unknown>[];
          updateComplete: Promise<boolean>;
        };

      list.innerHTML =
        `
          <template data-slot="item">
            <div class="local-row" data-bind-text="item.title"></div>
          </template>
        `;

      list.items = [ { title: 'Local wins' } ];

      document.body.appendChild(list);

      await settle(list);

      assert.equal(
        list.querySelector('.theme-row'),
        null);

      const localRow =
        list.querySelector('.local-row') as HTMLElement;

      assert.equal(localRow.textContent, 'Local wins');
    } finally {
      setDefaultTheme(null);
    }
  });

test(
  `${CONTEXT_NAME}: context.select without context warns and does not invoke handler`,
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
          items: Array<{ id: string; title: string }>;
          updateComplete: Promise<boolean>;
        };

      list.innerHTML =
        `
          <template data-slot="item">
            <button data-bind-onclick="context.select"
                    data-bind-text="item.title"></button>
          </template>
        `;

      list.items = [
        { id: 'a', title: 'First' },
      ];

      document.body.appendChild(list);

      await settle(list);

      const button =
        list.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(new window.Event('click'));

      assert.equal(
        warnings.some(message =>
          message.includes("action 'context.select' is not a function")),
        true);
    } finally {
      console.warn = previousWarn;
    }
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

  if (!isComponentsLoaded) {
    await import('./index.js');
    isComponentsLoaded = true;
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
