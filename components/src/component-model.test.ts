import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM,
  } from 'jsdom';
import {
    AiChatModelDefinition,
    AllComponentModelDefinitions,
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
let loadedModules = false;

test(
  'component-model: exports runtime definitions for every public component surface',
  () => {
    assert.deepEqual(
      AllComponentModelDefinitions.map(definition => definition.name),
      [ 'AiChatModelDefinition',
        'AssistedInputModelDefinition',
        'ButtonModelDefinition',
        'FileViewModelDefinition',
        'KeyboardModelDefinition',
        'LetterpadModelDefinition',
        'ListModelDefinition',
        'NumpadModelDefinition',
        'PropertiesModelDefinition',
        'SelectModelDefinition',
        'TextInputModelDefinition',
        'ThemeProviderModelDefinition',
      ]);
  });

test(
  'component-model: ai-chat definition exposes direct custom-element state properties',
  () => {
    const propertyByName =
      new Map(
        AiChatModelDefinition.properties.map(
          property => [ property.name,
                        property ]));

    assert.deepEqual(
      propertyByName.get('messages'),
      { name: 'messages',
        type: 'array',
        title: 'Messages',
        description: 'Rendered chat messages.' });
    assert.deepEqual(
      propertyByName.get('messageHistory'),
      { name: 'messageHistory',
        type: 'array',
        title: 'Message history',
        description: 'Recent request/response history used to build prompts.' });
    assert.deepEqual(
      propertyByName.get('sending'),
      { name: 'sending',
        type: 'boolean',
        title: 'Sending',
        description: 'Whether a request is currently in-flight.',
        editable: false });
  });

test(
  'component-model: text-input definition exposes critical runtime properties with types and captions',
  () => {
    const propertyByName =
      new Map(
        TextInputModelDefinition.properties.map(
          property => [ property.name,
                        property ]));

    assert.deepEqual(
      propertyByName.get('errorMessage'),
      { name: 'errorMessage',
        type: 'string',
        title: 'Error message',
        description: 'Current validation message or null.',
        editable: false });
    assert.deepEqual(
      propertyByName.get('rows'),
      { name: 'rows',
        type: 'number',
        title: 'Rows' });
    assert.deepEqual(
      propertyByName.get('multiline'),
      { name: 'multiline',
        type: 'boolean',
        title: 'Multiline' });
  });

test(
  'component-model: button definition includes the variant property metadata',
  () => {
    assert.deepEqual(
      ButtonModelDefinition.properties[0],
      { name: 'variant',
        type: 'string',
        title: 'Variant',
        description: 'Variant key used to resolve theme defaults such as add or delete.' });
  });

test(
  'properties: updates string and boolean target properties from generated controls',
  async () => {
    await ensureDom();
    await loadModules();

    const element =
      document.createElement('asljs-properties') as Properties;
    const target =
      document.createElement('asljs-button') as Button;

    element.definition = ButtonModelDefinition;
    element.target = target as unknown as Record<string, unknown>;
    document.body.appendChild(element);

    await settleDeep(element);

    const textInput =
      element.querySelector('[data-property-name="text"]') as TextInput;
    const disabledSelect =
      element.querySelector('[data-property-name="disabled"]') as HTMLElement;

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

    await settleDeep(element);

    assert.equal(target.text, 'Save');
    assert.equal(target.disabled, true);
  });

test(
  'properties: updates number target properties and keeps read-only properties disabled',
  async () => {
    await ensureDom();
    await loadModules();

    const element =
      document.createElement('asljs-properties') as Properties;
    const target =
      document.createElement('asljs-text-input') as TextInput;

    target.value = 'bad';
    target.validator =
      value => value === 'ok'
        ? null
        : 'Value is invalid';
    document.body.appendChild(target);
    await settleDeep(target);

    element.definition = TextInputModelDefinition;
    element.target = target as unknown as Record<string, unknown>;
    document.body.appendChild(element);

    await settleDeep(element);

    const rowsInput =
      element.querySelector('[data-property-name="rows"]') as TextInput;
    const errorMessageInput =
      element.querySelector('[data-property-name="errorMessage"]') as TextInput;

    const rowsControl =
      rowsInput.querySelector('input') as HTMLInputElement;
    const errorControl =
      errorMessageInput.querySelector('input') as HTMLInputElement;

    assert.equal(errorControl.disabled, true);
    assert.equal(errorControl.value, 'Value is invalid');

    rowsControl.value = '6';
    rowsControl.dispatchEvent(
      new window.Event(
        'input',
        { bubbles: true }));

    await settleDeep(element);

    assert.equal(target.rows, 6);
  });

async function loadModules(): Promise<void> {
  if (loadedModules) {
    return;
  }

  await import('./button.js');
  await import('./text-input.js');
  await import('./select.js');
  await import('./properties.js');
  loadedModules = true;
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
    element: LitElementLike
  ): Promise<void>
{
  await element.updateComplete;
  await Promise.resolve();

  const nestedElements =
    [ ...element.querySelectorAll('*') ] as LitElementLike[];

  for (const nestedElement of nestedElements) {
    if ('updateComplete' in nestedElement) {
      await nestedElement.updateComplete;
    }
  }

  await Promise.resolve();
}

type LitElementLike =
  HTMLElement & {
    updateComplete: Promise<unknown>;
  };
