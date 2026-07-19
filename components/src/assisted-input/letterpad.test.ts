import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Letterpad }
  from './letterpad.js';

let restoreDom: (() => void) | null = null;
let isLetterpadModuleLoaded = false;

test(
  'letterpad: disables keys outside the allowed characters set',
  async () =>
  {
    await ensureDomAndModuleLoaded();
    resetDomBody();

    const element =
      document.createElement(
        'asljs-letterpad') as Letterpad;

    element.characters = 'ab';
    document.body.appendChild(element);

    await settle(element);

    assert.equal(
      getButton(
        element,
        'a'
      ).disabled,
      false
    );

    assert.equal(
      getButton(
        element,
        'c'
      ).disabled,
      true
    );

    assert.equal(
      getButton(
        element,
        'Backspace'
      ).disabled,
      false
    );

    assert.equal(
      getButton(
        element,
        'Enter'
      ).disabled,
      false
    );
  }
);

test(
  'letterpad: toggles collapsed state with the keyboard button',
  async () =>
  {
    await ensureDomAndModuleLoaded();
    resetDomBody();

    const element =
      document.createElement(
        'asljs-letterpad') as Letterpad;

    document.body.appendChild(element);

    await settle(element);

    const toggle =
      element.shadowRoot?.querySelector(
        'button[data-action="toggle"]') as HTMLButtonElement;

    toggle.click();
    await settle(element);

    assert.equal(
      element.collapsed,
      true
    );

    assert.equal(
      toggle.getAttribute('aria-label'),
      'Show letterpad'
    );
  }
);

test(
  'letterpad: emits key and submit events',
  async () =>
  {
    await ensureDomAndModuleLoaded();
    resetDomBody();

    const element =
      document.createElement(
        'asljs-letterpad') as Letterpad;

    document.body.appendChild(element);

    await settle(element);

    let receivedKey: string | null = null;
    let submitted = false;

    element.addEventListener(
      'key',
      event =>
      {
        receivedKey = (event as CustomEvent<{ key: string; }>).detail.key;
      }
    );

    element.addEventListener(
      'submit',
      () =>
      {
        submitted = true;
      }
    );

    getButton(
      element,
      'q'
    ).click();

    getButton(
      element,
      'Enter'
    ).click();

    assert.equal(
      receivedKey,
      'q'
    );

    assert.equal(
      submitted,
      true
    );
  }
);

async function ensureDomAndModuleLoaded(
  ): Promise<void>
{
  if (restoreDom === null) {
    const dom =
      new JSDOM('<!doctype html><html><body></body></html>');

    const previous =
      {
      window: globalThis.window,
      document: globalThis.document,
      Document: globalThis.Document,
      Event: globalThis.Event,
      CustomEvent: globalThis.CustomEvent,
      customElements: globalThis.customElements,
      HTMLElement: globalThis.HTMLElement,
      HTMLButtonElement: globalThis.HTMLButtonElement,
      ShadowRoot: globalThis.ShadowRoot,
      CSSStyleSheet: globalThis.CSSStyleSheet
    };

    globalThis.window = dom.window as unknown as typeof globalThis.window;
    globalThis.document = dom.window.document;
    globalThis.Document = dom.window.Document;
    globalThis.Event = dom.window.Event;
    globalThis.CustomEvent = dom.window.CustomEvent;
    globalThis.customElements = dom.window.customElements;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
    globalThis.ShadowRoot = dom.window.ShadowRoot;
    globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;

    restoreDom = () =>
    {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.Document = previous.Document;
      globalThis.Event = previous.Event;
      globalThis.CustomEvent = previous.CustomEvent;
      globalThis.customElements = previous.customElements;
      globalThis.HTMLElement = previous.HTMLElement;
      globalThis.HTMLButtonElement = previous.HTMLButtonElement;
      globalThis.ShadowRoot = previous.ShadowRoot;
      globalThis.CSSStyleSheet = previous.CSSStyleSheet;
    };
  }

  if (!isLetterpadModuleLoaded) {
    await import('./letterpad.js');
    isLetterpadModuleLoaded = true;
  }
}

function resetDomBody(
  ): void
{
  document.body.replaceChildren();
}

function getButton(
    element: Letterpad,
    key: string
  ): HTMLButtonElement
{
  return element.shadowRoot?.querySelector(
    `button[data-key="${key}"]`
  ) as HTMLButtonElement;
}

async function settle(
    element: Letterpad
  ): Promise<void>
{
  await element.updateComplete;
  await Promise.resolve();
  await element.updateComplete;
}
