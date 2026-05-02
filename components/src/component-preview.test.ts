import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM,
  } from 'jsdom';
import {
    bindComponentPreviewModel,
    createComponentPreviewModel,
  } from './component-preview.js';
import {
    ButtonModelDefinition,
    TextInputModelDefinition,
  } from './component-model.js';
import type {
    Button,
  } from './button.js';
import type {
    Properties,
  } from './properties.js';
import type {
    TextInput,
  } from './text-input.js';

let domRestore: (() => void) | null = null;
let modulesLoaded = false;

test(
  'component-preview: property editor updates the rendered button through the preview model',
  async () => {
    await ensureDom();
    await loadModules();

    const button =
      document.createElement('asljs-button') as Button;
    const model =
      createComponentPreviewModel(
        ButtonModelDefinition,
        button as unknown as Record<string, unknown>);
    const binding =
      bindComponentPreviewModel(
        ButtonModelDefinition,
        model,
        button as unknown as EventTarget & Record<string, unknown>);
    const properties =
      document.createElement('asljs-properties') as Properties;

    properties.definition = ButtonModelDefinition;
    properties.target = model;

    document.body.append(button, properties);

    await settleDeep(button, properties);

    const textInput =
      properties.querySelector('[data-property-name="text"]') as TextInput;
    const disabledSelect =
      properties.querySelector('[data-property-name="disabled"]') as HTMLElement;

    const textControl =
      textInput.querySelector('input') as HTMLInputElement;
    const disabledControl =
      disabledSelect.querySelector('select') as HTMLSelectElement;

    textControl.value = 'Save';
    textControl.dispatchEvent(
      new window.Event(
        'input',
        { bubbles: true }));

    disabledControl.value = 'yes';
    disabledControl.dispatchEvent(
      new window.Event(
        'change',
        { bubbles: true }));

    await settleDeep(button, properties);

    assert.equal(button.text, 'Save');
    assert.equal(button.disabled, true);
    assert.equal(button.querySelector('.text')?.textContent, 'Save');

    binding.dispose();
  });

test(
  'component-preview: component input refreshes derived values back into the preview model',
  async () => {
    await ensureDom();
    await loadModules();

    const textInput =
      document.createElement('asljs-text-input') as TextInput;

    textInput.value = 'bad';
    textInput.validator =
      value => value === 'ok'
        ? null
        : 'Value is invalid';
    document.body.appendChild(textInput);

    await settleDeep(textInput);

    const model =
      createComponentPreviewModel(
        TextInputModelDefinition,
        textInput as unknown as Record<string, unknown>);
    const binding =
      bindComponentPreviewModel(
        TextInputModelDefinition,
        model,
        textInput as unknown as EventTarget & Record<string, unknown>);

    const input =
      textInput.querySelector('input') as HTMLInputElement;

    input.value = 'ok';
    input.dispatchEvent(
      new window.Event(
        'input',
        { bubbles: true }));

    await settleDeep(textInput);

    assert.equal(model.draftValue, 'ok');
    assert.equal(model.errorMessage, null);
    assert.equal(model.isValid, true);

    binding.dispose();
  });

async function loadModules(): Promise<void> {
  if (modulesLoaded) {
    return;
  }

  await import('./button.js');
  await import('./text-input.js');
  await import('./select.js');
  await import('./properties.js');
  modulesLoaded = true;
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
        KeyboardEvent: globalThis.KeyboardEvent,
        customElements: globalThis.customElements,
        HTMLElement: globalThis.HTMLElement,
        HTMLButtonElement: globalThis.HTMLButtonElement,
        HTMLInputElement: globalThis.HTMLInputElement,
        HTMLSelectElement: globalThis.HTMLSelectElement,
        HTMLTextAreaElement: globalThis.HTMLTextAreaElement,
        ShadowRoot: globalThis.ShadowRoot,
        CSSStyleSheet: globalThis.CSSStyleSheet,
        Node: globalThis.Node,
        getComputedStyle: globalThis.getComputedStyle };

    globalThis.window = dom.window as unknown as typeof globalThis.window;
    globalThis.document = dom.window.document;
    globalThis.Document = dom.window.Document;
    globalThis.Event = dom.window.Event;
    globalThis.CustomEvent = dom.window.CustomEvent;
    globalThis.KeyboardEvent = dom.window.KeyboardEvent;
    globalThis.customElements = dom.window.customElements;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
    globalThis.HTMLInputElement = dom.window.HTMLInputElement;
    globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
    globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
    globalThis.ShadowRoot = dom.window.ShadowRoot;
    globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;
    globalThis.Node = dom.window.Node;
    globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);

    domRestore = () => {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.Document = previous.Document;
      globalThis.Event = previous.Event;
      globalThis.CustomEvent = previous.CustomEvent;
      globalThis.KeyboardEvent = previous.KeyboardEvent;
      globalThis.customElements = previous.customElements;
      globalThis.HTMLElement = previous.HTMLElement;
      globalThis.HTMLButtonElement = previous.HTMLButtonElement;
      globalThis.HTMLInputElement = previous.HTMLInputElement;
      globalThis.HTMLSelectElement = previous.HTMLSelectElement;
      globalThis.HTMLTextAreaElement = previous.HTMLTextAreaElement;
      globalThis.ShadowRoot = previous.ShadowRoot;
      globalThis.CSSStyleSheet = previous.CSSStyleSheet;
      globalThis.Node = previous.Node;
      globalThis.getComputedStyle = previous.getComputedStyle;
    };
  }

  document.body.replaceChildren();
}

async function settleDeep(
    ...elements: LitElementLike[]
  ): Promise<void>
{
  for (const element of elements) {
    await element.updateComplete;
  }

  await Promise.resolve();

  const nested =
    elements.flatMap(
      element => [ ...element.querySelectorAll('*') ] as LitElementLike[]);

  for (const element of nested) {
    if ('updateComplete' in element) {
      await element.updateComplete;
    }
  }

  await Promise.resolve();
}

type LitElementLike =
  HTMLElement & {
    updateComplete: Promise<unknown>;
  };