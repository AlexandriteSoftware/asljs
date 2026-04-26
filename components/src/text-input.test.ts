import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM,
  } from 'jsdom';
import type {
    TextInput,
    TextInputChangeDetail,
  } from './text-input.js';

let domRestore: (() => void) | null = null;
let isTextInputModuleLoaded = false;

test(
  'text-input: renders plain default label description and control',
  async () => {
    const element =
      await createElement();

    element.label = 'Title';
    element.description = 'Shown below';
    element.value = 'Hello';

    document.body.appendChild(element);

    await settle(element);

    const label =
      element.querySelector('label') as HTMLLabelElement;
    const textarea =
      element.querySelector('textarea') as HTMLTextAreaElement | null;
    const input =
      element.querySelector('input') as HTMLInputElement;
    const description =
      element.querySelector('[data-bind-prop-id="descriptionId"]') as HTMLElement;

    assert.equal(label.textContent, 'Title');
    assert.equal(textarea, null);
    assert.equal(input.value, 'Hello');
    assert.equal(description.textContent, 'Shown below');
    assert.equal(label.className, '');
    assert.equal(input.className, '');
  });

test(
  'text-input: validator sets aria-invalid and shows error message',
  async () => {
    const element =
      await createElement();

    element.value = 'bad';
    element.validator =
      value => value === 'ok'
        ? null
        : 'Value is invalid';

    document.body.appendChild(element);

    await settle(element);

    const input =
      element.querySelector('input') as HTMLInputElement;
    const error =
      element.querySelector('[data-bind-prop-id="errorId"]') as HTMLElement;

    assert.equal(input.hasAttribute('aria-invalid'), true);
    assert.equal(error.hidden, false);
    assert.equal(error.textContent, 'Value is invalid');
    assert.equal(element.isValid, false);
  });

test(
  'text-input: bootstrap theme supplies bootstrap template and classes',
  async () => {
    const element =
      await createElement();

    const bootstrapThemeModule =
      await import('./themes/bootstrap-theme.js');

    element.theme = bootstrapThemeModule.createBootstrapTheme();
    element.label = 'Title';
    element.description = 'Shown below';
    element.value = 'Hello';
    element.validator =
      value => value === 'ok'
        ? null
        : 'Value is invalid';

    document.body.appendChild(element);

    await settle(element);

    const label =
      element.querySelector('label.form-label') as HTMLLabelElement;
    const input =
      element.querySelector('input.form-control') as HTMLInputElement;
    const description =
      element.querySelector('.form-text') as HTMLElement;
    const error =
      element.querySelector('.invalid-feedback') as HTMLElement;

    assert.equal(label.textContent, 'Title');
    assert.equal(input.value, 'Hello');
    assert.equal(input.classList.contains('form-control'), true);
    assert.equal(input.nextElementSibling, error);
    assert.equal(description.textContent, 'Shown below');
    assert.equal(input.classList.contains('is-invalid'), true);
    assert.equal(error.textContent, 'Value is invalid');
  });

test(
  'text-input: bootstrap theme supplies bootstrap textarea control in multiline mode',
  async () => {
    const element =
      await createElement();

    const bootstrapThemeModule =
      await import('./themes/bootstrap-theme.js');

    element.theme = bootstrapThemeModule.createBootstrapTheme();
    element.multiline = true;
    element.value = 'Hello';

    document.body.appendChild(element);

    await settle(element);

    const textarea =
      element.querySelector('textarea.form-control') as HTMLTextAreaElement;
    const error =
      element.querySelector('.invalid-feedback') as HTMLElement;

    assert.equal(textarea.value, 'Hello');
    assert.equal(textarea.classList.contains('form-control'), true);
    assert.equal(textarea.nextElementSibling, error);
  });

test(
  'text-input: package default theme applies bootstrap control classes',
  async () => {
    const element =
      await createElement();

    const themeModule =
      await import('./themes/theme.js');
    const bootstrapThemeModule =
      await import('./themes/bootstrap-theme.js');

    themeModule.setDefaultTheme(
      bootstrapThemeModule.createBootstrapTheme());

    try {
      element.label = 'Project name';
      element.value = 'ASLJS';

      document.body.appendChild(element);

      await settle(element);

      const input =
        element.querySelector('input') as HTMLInputElement;

      assert.equal(input.classList.contains('form-control'), true);
    } finally {
      themeModule.setDefaultTheme(null);
    }
  });

test(
  'text-input: emits input details and keeps value property as reset value',
  async () => {
    const element =
      await createElement();

    element.value = 'Initial';

    document.body.appendChild(element);

    await settle(element);

    const received: TextInputChangeDetail[] = [];

    element.addEventListener(
      'input',
      event => {
        received.push(
          ((event as unknown) as CustomEvent<TextInputChangeDetail>).detail);
      });

    const input =
      element.querySelector('input') as HTMLInputElement;

    input.value = 'Changed';
    input.dispatchEvent(
      new window.Event(
        'input',
        { bubbles: true }));

    const receivedDetail =
      received[0];

    if (receivedDetail === undefined) {
      assert.fail('Expected text input to emit an input event with detail.');
    }

    assert.equal(element.value, 'Initial');
    assert.equal(element.draftValue, 'Changed');
    assert.equal(receivedDetail.value, 'Changed');
    assert.equal(receivedDetail.dirty, true);
  });

test(
  'text-input: multiline Enter keeps newline but Ctrl+Enter finishes editing',
  async () => {
    const element =
      await createElement();

    element.multiline = true;
    element.enterKeyBehavior = 'newline';

    document.body.appendChild(element);

    await settle(element);

    let changes = 0;

    element.addEventListener(
      'change',
      () => {
        changes += 1;
      });

    const textarea =
      element.querySelector('textarea') as HTMLTextAreaElement;

    textarea.dispatchEvent(
      new window.KeyboardEvent(
        'keydown',
        { key: 'Enter',
          bubbles: true }));

    assert.equal(changes, 0);

    textarea.dispatchEvent(
      new window.KeyboardEvent(
        'keydown',
        { key: 'Enter',
          ctrlKey: true,
          bubbles: true }));

    assert.equal(changes, 1);
  });

test(
  'text-input: autoextend applies textarea height with max rows limit',
  async () => {
    const element =
      await createElement();

    element.multiline = true;
    element.autoExtend = true;
    element.autoExtendMaxRows = 2;
    element.value = 'Line 1\nLine 2\nLine 3';

    document.body.appendChild(element);

    await settle(element);

    const textarea =
      element.querySelector('textarea') as HTMLTextAreaElement;

    assert.notEqual(textarea.style.height, '');
  });

test(
  'text-input: local template can move label and description around control host',
  async () => {
    const element =
      await createElement();

    element.innerHTML =
      `
        <template data-slot="template">
          <div>
            <div data-role="control-host"></div>
            <span class="after"
                  data-bind-text="label"
                  data-bind-prop-hidden="hideLabel"></span>
          </div>
        </template>
      `;
    element.label = 'Moved';

    document.body.appendChild(element);

    await settle(element);

    const after =
      element.querySelector('.after') as HTMLElement;

    assert.equal(after.textContent, 'Moved');
  });

test(
  'text-input: local input control template can provide themed control markup',
  async () => {
    const element =
      await createElement();

    element.innerHTML =
      `
        <template data-slot="input">
          <div class="control-shell">
            <input class="custom-control"
                   data-control-invalid-class="custom-invalid">
          </div>
        </template>
      `;
    element.value = 'Hello';
    element.validator =
      () => 'Broken';

    document.body.appendChild(element);

    await settle(element);

    const shell =
      element.querySelector('.control-shell') as HTMLElement;
    const input =
      element.querySelector('input.custom-control') as HTMLInputElement;

    assert.equal(shell.contains(input), true);
    assert.equal(input.value, 'Hello');
    assert.equal(input.classList.contains('custom-invalid'), true);
  });

async function createElement(): Promise<TextInput> {
  await ensureDomAndModuleLoaded();

  return document.createElement('asljs-text-input') as TextInput;
}

async function ensureDomAndModuleLoaded(): Promise<void> {
  if (domRestore === null) {
    const dom =
      new JSDOM('<!doctype html><html><body></body></html>');

    const previous =
      { window: globalThis.window,
        document: globalThis.document,
        customElements: globalThis.customElements,
        HTMLElement: globalThis.HTMLElement,
        HTMLInputElement: globalThis.HTMLInputElement,
        HTMLTextAreaElement: globalThis.HTMLTextAreaElement,
        Event: globalThis.Event,
        CustomEvent: globalThis.CustomEvent,
        KeyboardEvent: globalThis.KeyboardEvent,
        getComputedStyle: globalThis.getComputedStyle };

    globalThis.window = dom.window as unknown as typeof globalThis.window;
    globalThis.document = dom.window.document;
    globalThis.customElements = dom.window.customElements;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.HTMLInputElement = dom.window.HTMLInputElement;
    globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
    globalThis.Event = dom.window.Event;
    globalThis.CustomEvent = dom.window.CustomEvent;
    globalThis.KeyboardEvent = dom.window.KeyboardEvent;
    globalThis.getComputedStyle =
      ((element: Element): CSSStyleDeclaration => {
        const style =
          dom.window.getComputedStyle(element);

        Object.defineProperty(style, 'lineHeight', { value: '20px' });
        Object.defineProperty(style, 'paddingTop', { value: '4px' });
        Object.defineProperty(style, 'paddingBottom', { value: '4px' });
        Object.defineProperty(style, 'borderTopWidth', { value: '1px' });
        Object.defineProperty(style, 'borderBottomWidth', { value: '1px' });

        return style;
      }) as typeof globalThis.getComputedStyle;

    domRestore = () => {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.customElements = previous.customElements;
      globalThis.HTMLElement = previous.HTMLElement;
      globalThis.HTMLInputElement = previous.HTMLInputElement;
      globalThis.HTMLTextAreaElement = previous.HTMLTextAreaElement;
      globalThis.Event = previous.Event;
      globalThis.CustomEvent = previous.CustomEvent;
      globalThis.KeyboardEvent = previous.KeyboardEvent;
      globalThis.getComputedStyle = previous.getComputedStyle;
    };
  }

  if (!isTextInputModuleLoaded) {
    await import('./text-input.js');
    isTextInputModuleLoaded = true;
  }

  document.body.replaceChildren();
}

async function settle(
    element: TextInput
  ): Promise<void>
{
  await element.updateComplete;
  await Promise.resolve();
  await element.updateComplete;
}
