import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { ComponentModelDefinition }
  from './abstractions/model.js';
import { Button }
  from './button.js';
import { Properties }
  from './properties.js';
import { TextInput }
  from './text-input.js';

let domRestore: (() => void) | null = null;
let isPropertiesModuleLoaded = false;

test(
  'properties: renders primitive editors, forwards theme, and formats read-only values',
  async () =>
  {
    const element =
      await createElement();

    const bootstrapThemeModule =
      await import('./themes/bootstrap-theme.js');

    const theme =
      bootstrapThemeModule.createBootstrapTheme();

    element.definition = {
      name: 'DemoModelDefinition',
      properties: [
        { name: 'title', type: 'string' },
        { name: 'enabled', type: 'boolean' },
        { name: 'count', type: 'number' },
        { name: 'items', type: 'array' },
        { name: 'handler', type: 'function' },
        { name: 'options', type: 'object' }
      ]
    };

    element.target = {
      title: 'Preview',
      enabled: true,
      count: 3,
      items: ['a', 'b'],
      handler: () =>
      {},
      options: { mode: 'demo' }
    };

    element.theme = theme;

    document.body.appendChild(element);

    await settleTree(element);

    const titleInput =
      queryPropertyTextInput(
        element,
        'title');

    const enabledSelect =
      queryPropertySelect(
        element,
        'enabled');

    const countInput =
      queryPropertyTextInput(
        element,
        'count');

    const itemsInput =
      queryPropertyTextInput(
        element,
        'items');

    const handlerInput =
      queryPropertyTextInput(
        element,
        'handler');

    const optionsInput =
      queryPropertyTextInput(
        element,
        'options');

    assert.equal(
      titleInput.theme,
      theme
    );

    assert.equal(
      enabledSelect.theme,
      theme
    );

    assert.equal(
      countInput.theme,
      theme
    );

    assert.equal(
      titleInput.querySelector('input')?.classList.contains('form-control'),
      true
    );

    assert.equal(
      enabledSelect.querySelector('select')?.classList.contains('form-select'),
      true
    );

    assert.equal(
      titleInput.value,
      'Preview'
    );

    assert.equal(
      enabledSelect.value,
      'yes'
    );

    assert.equal(
      countInput.value,
      '3'
    );

    assert.equal(
      itemsInput.value,
      '[2 items]'
    );

    assert.equal(
      handlerInput.value,
      '[Function]'
    );

    assert.equal(
      optionsInput.value,
      '[Object]'
    );

    assert.equal(
      itemsInput.disabled,
      true
    );

    assert.equal(
      handlerInput.disabled,
      true
    );

    assert.equal(
      optionsInput.disabled,
      true
    );
  }
);

test(
  'properties: updates target from nested text and boolean input events',
  async () =>
  {
    const element =
      await createElement();

    const target =
      { title: 'Before', enabled: false, count: 2 };

    element.definition = {
      name: 'EditableDemoModelDefinition',
      properties: [{ name: 'title', type: 'string' }, {
        name: 'enabled',
        type: 'boolean'
      }, { name: 'count', type: 'number' }]
    };

    element.target = target;

    document.body.appendChild(element);

    await settleTree(element);

    const titleInput =
      queryPropertyTextInput(
        element,
        'title');

    const enabledSelect =
      queryPropertySelect(
        element,
        'enabled');

    const countInput =
      queryPropertyTextInput(
        element,
        'count');

    titleInput.dispatchEvent(
      new window.CustomEvent(
        'input',
        { detail: { value: 'After' }, bubbles: true }
      )
    );

    enabledSelect.dispatchEvent(
      new window.CustomEvent(
        'input',
        { detail: { value: 'yes' }, bubbles: true }
      )
    );

    countInput.dispatchEvent(
      new window.CustomEvent(
        'input',
        { detail: { value: '42' }, bubbles: true }
      )
    );

    await settleTree(element);

    assert.equal(
      target.title,
      'After'
    );

    assert.equal(
      target.enabled,
      true
    );

    assert.equal(
      target.count,
      42
    );
  }
);

test(
  'properties: explicit editable false blocks updates for primitive properties',
  async () =>
  {
    const element =
      await createElement();

    const target =
      { title: 'Locked', enabled: false };

    element.definition = {
      name: 'LockedDemoModelDefinition',
      properties: [{ name: 'title', type: 'string', editable: false }, {
        name: 'enabled',
        type: 'boolean',
        editable: false
      }]
    };

    element.target = target;

    document.body.appendChild(element);

    await settleTree(element);

    const titleInput =
      queryPropertyTextInput(
        element,
        'title');

    const enabledSelect =
      queryPropertySelect(
        element,
        'enabled');

    assert.equal(
      titleInput.disabled,
      true
    );

    assert.equal(
      enabledSelect.disabled,
      true
    );

    titleInput.dispatchEvent(
      new window.CustomEvent(
        'input',
        { detail: { value: 'Changed' }, bubbles: true }
      )
    );

    enabledSelect.dispatchEvent(
      new window.CustomEvent(
        'input',
        { detail: { value: 'yes' }, bubbles: true }
      )
    );

    await settleTree(element);

    assert.equal(
      target.title,
      'Locked'
    );

    assert.equal(
      target.enabled,
      false
    );
  }
);

test(
  'properties: updates string and boolean target properties from button model controls',
  async () =>
  {
    const element =
      await createElement();

    const {
      ButtonModelDefinition
    } =
      await import('./button.js');

    const target =
      document.createElement('asljs-button') as Button;

    element.definition = ButtonModelDefinition;
    element.target = target as unknown as Record<string, unknown>;

    document.body.appendChild(element);

    await settleTree(element);

    const textInput =
      queryPropertyTextInput(
        element,
        'text');

    const disabledSelect =
      queryPropertySelect(
        element,
        'disabled');

    const textControl =
      textInput.querySelector('input') as HTMLInputElement;

    const disabledControl =
      disabledSelect.querySelector(
        'select') as HTMLSelectElement;

    textControl.value = 'Save';

    textControl.dispatchEvent(
      new window.Event(
        'input',
        { bubbles: true }
      )
    );

    disabledControl.value = 'yes';

    disabledControl.dispatchEvent(
      new window.Event(
        'change',
        { bubbles: true }
      )
    );

    await settleTree(element);

    assert.equal(
      target.text,
      'Save'
    );

    assert.equal(
      target.disabled,
      true
    );
  }
);

test(
  'properties: updates number target properties and keeps text-input read-only properties disabled',
  async () =>
  {
    const element =
      await createElement();

    const {
      TextInputModelDefinition
    } =
      await import('./text-input.js');

    const target =
      document.createElement(
        'asljs-text-input') as TextInput;

    target.value = 'bad';

    target.validator = value =>
      value === 'ok'
        ? null
        : 'Value is invalid';

    document.body.appendChild(target);
    await settleTree(target);

    element.definition = TextInputModelDefinition;
    element.target = target as unknown as Record<string, unknown>;
    document.body.appendChild(element);

    await settleTree(element);

    const rowsInput =
      queryPropertyTextInput(
        element,
        'rows');

    const errorMessageInput =
      queryPropertyTextInput(
        element,
        'errorMessage');

    const rowsControl =
      rowsInput.querySelector('input') as HTMLInputElement;

    const errorControl =
      errorMessageInput.querySelector(
        'input') as HTMLInputElement;

    assert.equal(
      errorControl.disabled,
      true
    );

    assert.equal(
      errorControl.value,
      'Value is invalid'
    );

    rowsControl.value = '6';

    rowsControl.dispatchEvent(
      new window.Event(
        'input',
        { bubbles: true }
      )
    );

    await settleTree(element);

    assert.equal(
      target.rows,
      6
    );
  }
);

async function createElement(
  ): Promise<Properties>
{
  await ensureDom();

  if (!isPropertiesModuleLoaded) {
    await import('./properties.js');
    isPropertiesModuleLoaded = true;
  }

  return document.createElement(
    'asljs-properties'
  ) as Properties;
}

function queryPropertyTextInput(
    element: Properties,
    propertyName: string
  ): TextInputLike
{
  const textInput =
    element.querySelector(
      `asljs-text-input[data-property-name="${propertyName}"]`);

  if (textInput === null) {
    throw new Error(
      `Missing text input for property ${propertyName}.`
    );
  }

  return textInput as TextInputLike;
}

function queryPropertySelect(
    element: Properties,
    propertyName: string
  ): SelectLike
{
  const select =
    element.querySelector(
      `asljs-select[data-property-name="${propertyName}"]`);

  if (select === null) {
    throw new Error(
      `Missing select for property ${propertyName}.`
    );
  }

  return select as SelectLike;
}

async function ensureDom(
  ): Promise<void>
{
  if (domRestore === null) {
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
      HTMLInputElement: globalThis.HTMLInputElement,
      HTMLSelectElement: globalThis.HTMLSelectElement,
      HTMLTextAreaElement: globalThis.HTMLTextAreaElement,
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
    globalThis.HTMLInputElement = dom.window.HTMLInputElement;
    globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
    globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
    globalThis.ShadowRoot = dom.window.ShadowRoot;
    globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;

    domRestore = () =>
    {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.Document = previous.Document;
      globalThis.Event = previous.Event;
      globalThis.CustomEvent = previous.CustomEvent;
      globalThis.customElements = previous.customElements;
      globalThis.HTMLElement = previous.HTMLElement;
      globalThis.HTMLInputElement = previous.HTMLInputElement;
      globalThis.HTMLSelectElement = previous.HTMLSelectElement;
      globalThis.HTMLTextAreaElement = previous.HTMLTextAreaElement;
      globalThis.ShadowRoot = previous.ShadowRoot;
      globalThis.CSSStyleSheet = previous.CSSStyleSheet;
    };
  }

  document.body.replaceChildren();
}

async function settleTree(
    element: LitElementLike
  ): Promise<void>
{
  await settle(
    element
  );

  const nestedElements =
    [
    ...element.querySelectorAll(
      'asljs-text-input, asljs-select'
    )
  ] as LitElementLike[];

  for (const nestedElement of nestedElements) {
    await settle(
      nestedElement
    );
  }
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

type TextInputLike = LitElementLike & {
  value: string;
  disabled: boolean;
  theme: unknown;
};

type SelectLike = LitElementLike & {
  value: string;
  disabled: boolean;
  theme: unknown;
};
