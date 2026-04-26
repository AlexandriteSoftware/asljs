import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM,
  } from 'jsdom';
import type {
    Button,
  } from './button.js';
import type {
    ButtonAdd,
  } from './button-add.js';
import type {
    ButtonDelete,
  } from './button-delete.js';
import type {
    ButtonSettings,
  } from './button-settings.js';
import type {
    ThemeProvider,
  } from '../themes/theme-provider.js';

let restoreDom: (() => void) | null = null;

test(
  'button: renders provided icon and text',
  async () => {
    await ensureDom();
    await import('./button.js');

    const element =
      document.createElement('asljs-button') as Button;

    element.icon = '<i class="bi bi-star"></i>';
    element.text = 'Save';
    document.body.appendChild(element);

    await settle(element);

    const button =
      element.querySelector('button');
    const icon =
      element.querySelector('.icon i');
    const text =
      element.querySelector('.text');

    assert.equal(button?.getAttribute('type'), 'button');
    assert.equal(button?.className, '');
    assert.equal(icon?.className, 'bi bi-star');
    assert.equal(text?.textContent, 'Save');
  });

test(
  'button-add: provides default add icon and text',
  async () => {
    await ensureDom();
    await import('./button.js');
    await import('./button-add.js');

    const element =
      document.createElement('asljs-button-add') as ButtonAdd;

    document.body.appendChild(element);

    await settle(element);

    const icon =
      element.querySelector('.icon');
    const text =
      element.querySelector('.text');

    assert.equal(icon?.textContent, '\uF26E');
    assert.equal(text?.textContent, 'Add');
  });

test(
  'button-delete: provides default delete icon and text',
  async () => {
    await ensureDom();
    await import('./button.js');
    await import('./button-delete.js');

    const element =
      document.createElement('asljs-button-delete') as ButtonDelete;

    document.body.appendChild(element);

    await settle(element);

    const icon =
      element.querySelector('.icon');
    const text =
      element.querySelector('.text');

    assert.equal(icon?.textContent, '\uF5DE');
    assert.equal(text?.textContent, 'Delete');
  });

test(
  'button-settings: provides default settings icon and text',
  async () => {
    await ensureDom();
    await import('./button.js');
    await import('./button-settings.js');

    const element =
      document.createElement('asljs-button-settings') as ButtonSettings;

    document.body.appendChild(element);

    await settle(element);

    const icon =
      element.querySelector('.icon');
    const text =
      element.querySelector('.text');

    assert.equal(icon?.textContent, '\uF3E5');
    assert.equal(text?.textContent, 'Settings');
  });

test(
  'button-add: resolves bootstrap icon from theme provider',
  async () => {
    await ensureDom();
    await import('../themes/theme-provider.js');
    await import('./button.js');
    await import('./button-add.js');

    const provider =
      document.createElement('asljs-theme-provider') as ThemeProvider;
    const element =
      document.createElement('asljs-button-add') as ButtonAdd;

    provider.theme =
      { button:
          { addIcon: '<i class="bi bi-plus"></i>' } };
    provider.appendChild(element);
    document.body.appendChild(provider);

    await settle(element);

    const icon =
      element.querySelector('.icon i');

    assert.equal(icon?.className, 'bi bi-plus');
  });

test(
  'button-add: resolves bootstrap button class from theme provider',
  async () => {
    await ensureDom();
    await import('../themes/theme-provider.js');
    await import('./button.js');
    await import('./button-add.js');

    const provider =
      document.createElement('asljs-theme-provider') as ThemeProvider;
    const element =
      document.createElement('asljs-button-add') as ButtonAdd;

    provider.theme =
      { button:
          { className: 'btn btn-primary' } };
    provider.appendChild(element);
    document.body.appendChild(provider);

    await settle(element);

    const button =
      element.querySelector('button');

    assert.equal(button?.className, 'btn btn-primary');
  });

test(
  'button: prefers explicit button class name over theme class',
  async () => {
    await ensureDom();
    await import('./button.js');

    const element =
      document.createElement('asljs-button') as Button;

    element.buttonClassName = 'btn btn-ghost';
    element.theme =
      { button:
          { className: 'btn btn-primary' } };
    document.body.appendChild(element);

    await settle(element);

    const button =
      element.querySelector('button');

    assert.equal(button?.className, 'btn btn-ghost');
  });

async function ensureDom(): Promise<void> {
  if (restoreDom === null) {
    const dom =
      new JSDOM('<!doctype html><html><body></body></html>');

    const previous =
      { window: globalThis.window,
        document: globalThis.document,
        Document: globalThis.Document,
        Event: globalThis.Event,
        customElements: globalThis.customElements,
        HTMLElement: globalThis.HTMLElement,
        ShadowRoot: globalThis.ShadowRoot,
        HTMLButtonElement: globalThis.HTMLButtonElement,
        CSSStyleSheet: globalThis.CSSStyleSheet };

    globalThis.window = dom.window as unknown as typeof globalThis.window;
    globalThis.document = dom.window.document;
    globalThis.Document = dom.window.Document;
    globalThis.Event = dom.window.Event;
    globalThis.customElements = dom.window.customElements;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.ShadowRoot = dom.window.ShadowRoot;
    globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
    globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;

    restoreDom = () => {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.Document = previous.Document;
      globalThis.Event = previous.Event;
      globalThis.customElements = previous.customElements;
      globalThis.HTMLElement = previous.HTMLElement;
      globalThis.ShadowRoot = previous.ShadowRoot;
      globalThis.HTMLButtonElement = previous.HTMLButtonElement;
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
