import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM,
  } from 'jsdom';
import type {
    Select,
    SelectChangeDetail,
  } from './select.js';

let domRestore: (() => void) | null = null;
let isSelectModuleLoaded = false;

test(
  'select: renders plain default label description and options',
  async () => {
    const element =
      await createElement();

    element.label = 'Theme';
    element.description = 'Choose one';
    element.items = [
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' },
    ];
    element.value = 'light';

    document.body.appendChild(element);

    await settle(element);

    const label =
      element.querySelector('label') as HTMLLabelElement;
    const select =
      element.querySelector('select') as HTMLSelectElement;
    const description =
      element.querySelector('[data-bind-prop-id="descriptionId"]') as HTMLElement;

    assert.equal(label.textContent, 'Theme');
    assert.equal(select.value, 'light');
    assert.equal(select.options.length, 2);
    assert.equal(description.textContent, 'Choose one');
  });

test(
  'select: bootstrap theme supplies bootstrap template and classes',
  async () => {
    const element =
      await createElement();

    const bootstrapThemeModule =
      await import('./themes/bootstrap-theme.js');

    element.theme = bootstrapThemeModule.createBootstrapTheme();
    element.items = [
      { value: 'gpt-4.1', label: 'GPT-4.1' },
    ];
    element.value = 'gpt-4.1';

    document.body.appendChild(element);

    await settle(element);

    const select =
      element.querySelector('select.form-select') as HTMLSelectElement;

    assert.equal(select.classList.contains('form-select'), true);
    assert.equal(select.value, 'gpt-4.1');
  });

test(
  'select: emits input and change details',
  async () => {
    const element =
      await createElement();

    element.items = [
      { value: 'chat', label: 'Chat' },
      { value: 'code', label: 'Code' },
    ];
    element.value = 'chat';

    document.body.appendChild(element);

    await settle(element);

    const received: SelectChangeDetail[] = [];

    element.addEventListener(
      'change',
      event => {
        received.push(
          ((event as unknown) as CustomEvent<SelectChangeDetail>).detail);
      });

    const select =
      element.querySelector('select') as HTMLSelectElement;

    select.value = 'code';
    select.dispatchEvent(
      new window.Event(
        'change',
        { bubbles: true }));

    assert.equal(element.value, 'chat');
    assert.equal(element.draftValue, 'code');
    assert.equal(received[0]?.value, 'code');
    assert.equal(received[0]?.dirty, true);
  });

async function createElement(): Promise<Select> {
  await ensureDom();

  if (!isSelectModuleLoaded) {
    await import('./select.js');
    isSelectModuleLoaded = true;
  }

  return document.createElement('asljs-select') as Select;
}

async function ensureDom(): Promise<void> {
  if (domRestore === null) {
    const dom =
      new JSDOM('<!doctype html><html><body></body></html>');

    const previous =
      { window: globalThis.window,
        document: globalThis.document,
        Document: globalThis.Document,
        Event: globalThis.Event,
        CustomEvent: globalThis.CustomEvent,
        customElements: globalThis.customElements,
        HTMLElement: globalThis.HTMLElement,
        HTMLSelectElement: globalThis.HTMLSelectElement,
        ShadowRoot: globalThis.ShadowRoot,
        CSSStyleSheet: globalThis.CSSStyleSheet };

    globalThis.window = dom.window as unknown as typeof globalThis.window;
    globalThis.document = dom.window.document;
    globalThis.Document = dom.window.Document;
    globalThis.Event = dom.window.Event;
    globalThis.CustomEvent = dom.window.CustomEvent;
    globalThis.customElements = dom.window.customElements;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
    globalThis.ShadowRoot = dom.window.ShadowRoot;
    globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;

    domRestore = () => {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.Document = previous.Document;
      globalThis.Event = previous.Event;
      globalThis.CustomEvent = previous.CustomEvent;
      globalThis.customElements = previous.customElements;
      globalThis.HTMLElement = previous.HTMLElement;
      globalThis.HTMLSelectElement = previous.HTMLSelectElement;
      globalThis.ShadowRoot = previous.ShadowRoot;
      globalThis.CSSStyleSheet = previous.CSSStyleSheet;
    };
  }

  document.body.replaceChildren();
}

async function settle(
    element: LitElementLike
  ): Promise<void>
{
  await element.updateComplete;
  await Promise.resolve();
  await element.updateComplete;
}

type LitElementLike =
  HTMLElement & {
    updateComplete: Promise<unknown>;
  };