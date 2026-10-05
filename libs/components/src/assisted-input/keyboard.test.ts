import { TmpGlobals }
  from 'asljs-testing';
import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Keyboard }
  from './keyboard.js';

let domGlobals: TmpGlobals | null = null;
let isKeyboardModuleLoaded = false;

test(
  'keyboard: disables keys outside the allowed characters set',
  async () =>
  {
    await ensureDomAndModuleLoaded();
    resetDomBody();

    const element =
      document.createElement(
        'asljs-keyboard') as Keyboard;

    element.characters = 'ab 12';
    document.body.appendChild(element);

    await settle(element);

    assert.equal(
      getButton(
        element,
        'a').disabled,
      false);

    assert.equal(
      getButton(
        element,
        '1').disabled,
      false);

    assert.equal(
      getButton(
        element,
        ' ').disabled,
      false);

    assert.equal(
      getButton(
        element,
        'q').disabled,
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
  'keyboard: emits key and submit events',
  async () =>
  {
    await ensureDomAndModuleLoaded();
    resetDomBody();

    const element =
      document.createElement(
        'asljs-keyboard') as Keyboard;

    document.body.appendChild(element);

    await settle(element);

    let receivedKey: string | null = null;
    let submitted = false;

    element.addEventListener(
      'key',
      (
          event
        ) =>
      {
        receivedKey =
          (event as CustomEvent<{ key: string; }>).detail.key;
      });

    element.addEventListener(
      'submit',
      () =>
      {
        submitted = true;
      });

    getButton(
      element,
      ' ').click();

    getButton(
      element,
      'Enter').click();

    assert.equal(
      receivedKey,
      ' ');

    assert.equal(
      submitted,
      true);
  });

async function ensureDomAndModuleLoaded(
  ): Promise<void>
{
  if (domGlobals === null) {
    const dom =
      new JSDOM(
        '<!doctype html><html><body></body></html>');

    domGlobals =
      new TmpGlobals(
        { window: dom.window,
          document: dom.window.document,
          Document: dom.window.Document,
          Event: dom.window.Event,
          CustomEvent:
            dom.window.CustomEvent,
          customElements:
            dom.window.customElements,
          HTMLElement:
            dom.window.HTMLElement,
          HTMLButtonElement:
            dom.window.HTMLButtonElement,
          ShadowRoot:
            dom.window.ShadowRoot,
          CSSStyleSheet:
            dom.window.CSSStyleSheet });
  }

  if (!isKeyboardModuleLoaded) {
    await import('./keyboard.js');
    isKeyboardModuleLoaded = true;
  }
}

function resetDomBody(
  ): void
{
  document.body.replaceChildren();
}

function getButton(
    element: Keyboard,
    key: string
  ): HTMLButtonElement
{
  return element.shadowRoot?.querySelector(
    `button[data-key="${key}"]`) as HTMLButtonElement;
}

async function settle(
    element: Keyboard
  ): Promise<void>
{
  await element.updateComplete;
  await Promise.resolve();
  await element.updateComplete;
}
