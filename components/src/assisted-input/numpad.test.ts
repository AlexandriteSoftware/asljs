import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Numpad }
  from './numpad.js';

let restoreDom: (() => void) | null = null;
let isNumpadModuleLoaded = false;

test(
  'numpad: disables keys outside the allowed characters set',
  async () =>
  {
    await ensureDomAndModuleLoaded();
    resetDomBody();

    const element =
      document.createElement('asljs-numpad') as Numpad;

    element.characters = '12.';
    document.body.appendChild(element);

    await settle(element);

    assert.equal(
      getButton(
        element,
        '1').disabled,
      false);

    assert.equal(
      getButton(
        element,
        '3').disabled,
      true);

    assert.equal(
      getButton(
        element,
        'Backspace').disabled,
      false);

    assert.equal(
      getButton(
        element,
        'Enter').disabled,
      false);
  });

test(
  'numpad: dispatches key events for allowed buttons',
  async () =>
  {
    await ensureDomAndModuleLoaded();
    resetDomBody();

    const element =
      document.createElement('asljs-numpad') as Numpad;

    document.body.appendChild(element);

    await settle(element);

    let receivedKey: string | null = null;

    element.addEventListener(
      'key',
      event =>
      {
        receivedKey = (event as CustomEvent<{ key: string; }>).detail.key;
      });

    getButton(
      element,
      '7').click();

    assert.equal(
      receivedKey,
      '7');
  });

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

  if (!isNumpadModuleLoaded) {
    await import('./numpad.js');
    isNumpadModuleLoaded = true;
  }
}

function resetDomBody(
  ): void
{
  document.body.replaceChildren();
}

function getButton(
    element: Numpad,
    key: string
  ): HTMLButtonElement
{
  return element.shadowRoot?.querySelector(
    `button[data-key="${key}"]`) as HTMLButtonElement;
}

async function settle(
    element: Numpad
  ): Promise<void>
{
  await element.updateComplete;
  await Promise.resolve();
  await element.updateComplete;
}
