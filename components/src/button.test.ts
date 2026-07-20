import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { Button }
  from './button.js';
import { ThemeProvider }
  from './themes/theme-provider.js';

let restoreDom: (() => void) | null = null;

test(
  'button: renders provided icon and text',
  async () =>
  {
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

    assert.equal(
      button?.getAttribute('type'),
      'button');

    assert.equal(
      button?.className,
      '');

    assert.equal(
      icon?.className,
      'bi bi-star');

    assert.equal(
      text?.textContent,
      'Save');
  });

test(
  'button: model definition includes the variant property metadata',
  async () =>
  {
    await ensureDom();

    const {
      ButtonModelDefinition
    } =
      await import('./button.js');

    assert.deepEqual(
      ButtonModelDefinition.properties[0],
      {
        name: 'variant',
        type: 'string',
        title: 'Variant',
        description:
          'Variant key used to resolve theme defaults such as add or delete.'
      });
  });

test(
  'button: resolves variant icon and text from theme provider',
  async () =>
  {
    await ensureDom();
    await import('./themes/theme-provider.js');
    await import('./button.js');

    const provider =
      document.createElement(
        'asljs-theme-provider') as ThemeProvider;

    const element =
      document.createElement('asljs-button') as Button;

    provider.theme = {
      button: {
        variants: { add: { icon: '<i class="bi bi-plus"></i>', text: 'Add' } }
      }
    };

    element.variant = 'add';
    provider.appendChild(element);
    document.body.appendChild(provider);

    await settle(element);

    const icon =
      element.querySelector('.icon i');

    const text =
      element.querySelector('.text');

    assert.equal(
      icon?.className,
      'bi bi-plus');

    assert.equal(
      text?.textContent,
      'Add');
  });

test(
  'button: prefers explicit icon and text over variant theme defaults',
  async () =>
  {
    await ensureDom();
    await import('./button.js');

    const element =
      document.createElement('asljs-button') as Button;

    element.variant = 'add';
    element.icon = '<i class="bi bi-star"></i>';
    element.text = 'Save';

    element.theme = {
      button: {
        variants: { add: { icon: '<i class="bi bi-plus"></i>', text: 'Add' } }
      }
    };

    document.body.appendChild(element);

    await settle(element);

    const icon =
      element.querySelector('.icon i');

    const text =
      element.querySelector('.text');

    assert.equal(
      icon?.className,
      'bi bi-star');

    assert.equal(
      text?.textContent,
      'Save');
  });

test(
  'button: provides default add icon and text for the add variant',
  async () =>
  {
    await ensureDom();
    await import('./button.js');

    const element =
      document.createElement('asljs-button') as Button;

    element.variant = 'add';

    document.body.appendChild(element);

    await settle(element);

    const icon =
      element.querySelector('.icon');

    const text =
      element.querySelector('.text');

    assert.equal(
      icon?.textContent,
      '\uF26E');

    assert.equal(
      text?.textContent,
      'Add');
  });

test(
  'button: provides default delete icon and text for the delete variant',
  async () =>
  {
    await ensureDom();
    await import('./button.js');

    const element =
      document.createElement('asljs-button') as Button;

    element.variant = 'delete';

    document.body.appendChild(element);

    await settle(element);

    const icon =
      element.querySelector('.icon');

    const text =
      element.querySelector('.text');

    assert.equal(
      icon?.textContent,
      '\uF5DE');

    assert.equal(
      text?.textContent,
      'Delete');
  });

test(
  'button: provides default settings icon and text for the settings variant',
  async () =>
  {
    await ensureDom();
    await import('./button.js');

    const element =
      document.createElement('asljs-button') as Button;

    element.variant = 'settings';

    document.body.appendChild(element);

    await settle(element);

    const icon =
      element.querySelector('.icon');

    const text =
      element.querySelector('.text');

    assert.equal(
      icon?.textContent,
      '\uF3E5');

    assert.equal(
      text?.textContent,
      'Settings');
  });

test(
  'button: resolves bootstrap icon from theme provider for the add variant',
  async () =>
  {
    await ensureDom();
    await import('./themes/theme-provider.js');
    await import('./button.js');

    const provider =
      document.createElement(
        'asljs-theme-provider') as ThemeProvider;

    const element =
      document.createElement('asljs-button') as Button;

    provider.theme = {
      button: { variants: { add: { icon: '<i class="bi bi-plus"></i>' } } }
    };

    element.variant = 'add';
    provider.appendChild(element);
    document.body.appendChild(provider);

    await settle(element);

    const icon =
      element.querySelector('.icon i');

    assert.equal(
      icon?.className,
      'bi bi-plus');
  });

test(
  'button: resolves bootstrap button class from theme provider for the add variant',
  async () =>
  {
    await ensureDom();
    await import('./themes/theme-provider.js');
    await import('./button.js');

    const provider =
      document.createElement(
        'asljs-theme-provider') as ThemeProvider;

    const element =
      document.createElement('asljs-button') as Button;

    provider.theme = { button: { className: 'btn btn-primary' } };
    element.variant = 'add';
    provider.appendChild(element);
    document.body.appendChild(provider);

    await settle(element);

    const button =
      element.querySelector('button');

    assert.equal(
      button?.className,
      'btn btn-primary');
  });

test(
  'button: prefers explicit button class name over theme class',
  async () =>
  {
    await ensureDom();
    await import('./button.js');

    const element =
      document.createElement('asljs-button') as Button;

    element.buttonClassName = 'btn btn-ghost';
    element.theme = { button: { className: 'btn btn-primary' } };
    document.body.appendChild(element);

    await settle(element);

    const button =
      element.querySelector('button');

    assert.equal(
      button?.className,
      'btn btn-ghost');
  });

async function ensureDom(
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
      customElements: globalThis.customElements,
      HTMLElement: globalThis.HTMLElement,
      ShadowRoot: globalThis.ShadowRoot,
      HTMLButtonElement: globalThis.HTMLButtonElement,
      CSSStyleSheet: globalThis.CSSStyleSheet
    };

    globalThis.window = dom.window as unknown as typeof globalThis.window;
    globalThis.document = dom.window.document;
    globalThis.Document = dom.window.Document;
    globalThis.Event = dom.window.Event;
    globalThis.customElements = dom.window.customElements;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.ShadowRoot = dom.window.ShadowRoot;
    globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
    globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;

    restoreDom = () =>
    {
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

type LitElementLike = HTMLElement & {
  updateComplete: Promise<unknown>;
};
