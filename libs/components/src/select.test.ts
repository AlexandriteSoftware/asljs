import { TmpGlobals }
  from 'asljs-testing';
import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Select,
         SelectChangeDetail }
  from './select.js';

let domGlobals: TmpGlobals | null = null;
let isSelectModuleLoaded = false;

test(
  'select: renders plain default label description and options',
  async () =>
  {
    const element =
      await createElement();

    element.label = 'Theme';
    element.description = 'Choose one';

    element.items =
      [ { value: 'dark',
          label: 'Dark' },
        { value: 'light',
          label: 'Light' } ];

    element.value = 'light';

    document.body.appendChild(element);

    await settle(element);

    const label =
      element.querySelector('label') as HTMLLabelElement;

    const select =
      element.querySelector('select') as HTMLSelectElement;

    const description =
      element.querySelector(
        '[data-bind-prop-id="descriptionId"]') as HTMLElement;

    assert.equal(
      label.textContent,
      'Theme');

    assert.notEqual(
      select.id,
      '');

    // The label names the control through the for attribute.
    assert.equal(
      label.htmlFor,
      select.id);

    assert.equal(
      select.value,
      'light');

    assert.equal(
      select.options.length,
      2);

    assert.equal(
      description.textContent,
      'Choose one');
  });

test(
  'select: bootstrap theme supplies bootstrap template and classes',
  async () =>
  {
    const element =
      await createElement();

    const bootstrapThemeModule =
      await import('./themes/bootstrap-theme.js');

    element.theme =
      bootstrapThemeModule.createBootstrapTheme();

    element.items =
      [ { value: 'gpt-4.1',
          label: 'GPT-4.1' } ];

    element.value = 'gpt-4.1';

    document.body.appendChild(element);

    await settle(element);

    const select =
      element.querySelector(
        'select.form-select') as HTMLSelectElement;

    assert.equal(
      select.classList.contains('form-select'),
      true);

    assert.equal(
      select.value,
      'gpt-4.1');

    const label =
      element.querySelector(
        'label.form-label') as HTMLLabelElement;

    assert.notEqual(
      select.id,
      '');

    // The label names the control through the for attribute.
    assert.equal(
      label.htmlFor,
      select.id);
  });

test(
  'select: bootstrap theme renders shared invalid feedback from the outer template',
  async () =>
  {
    const element =
      await createElement();

    const bootstrapThemeModule =
      await import('./themes/bootstrap-theme.js');

    element.theme =
      bootstrapThemeModule.createBootstrapTheme();

    element.items =
      [ { value: 'gpt-4.1',
          label: 'GPT-4.1' } ];

    element.value = 'gpt-4.1';

    element.validator =
      () => 'Pick a supported model';

    document.body.appendChild(element);

    await settle(element);

    const select =
      element.querySelector(
        'select.form-select') as HTMLSelectElement;

    const error =
      element.querySelector(
        '.invalid-feedback') as HTMLElement;

    assert.equal(
      select.nextElementSibling,
      null);

    assert.equal(
      error.textContent,
      'Pick a supported model');

    assert.equal(
      error.hidden,
      false);
  });

test(
  'select: emits input and change details',
  async () =>
  {
    const element =
      await createElement();

    element.items =
      [ { value: 'chat',
          label: 'Chat' },
        { value: 'code',
          label: 'Code' } ];

    element.value = 'chat';

    document.body.appendChild(element);

    await settle(element);

    const received: SelectChangeDetail[] = [ ];

    element.addEventListener(
      'change',
      (
          event
        ) =>
      {
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

    assert.equal(
      element.value,
      'chat');

    assert.equal(
      element.draftValue,
      'code');

    assert.equal(
      received[0]?.value,
      'code');

    assert.equal(
      received[0]?.dirty,
      true);
  });

async function createElement(
  ): Promise<Select>
{
  await ensureDom();

  if (!isSelectModuleLoaded) {
    await import('./select.js');
    isSelectModuleLoaded = true;
  }

  return document.createElement('asljs-select') as Select;
}

async function ensureDom(
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
          HTMLSelectElement:
            dom.window.HTMLSelectElement,
          ShadowRoot:
            dom.window.ShadowRoot,
          CSSStyleSheet:
            dom.window.CSSStyleSheet });
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

type LitElementLike = HTMLElement & {
  updateComplete: Promise<unknown>;
};
