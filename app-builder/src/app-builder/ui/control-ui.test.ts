import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  JSDOM,
} from 'jsdom';
import {
  configureButton,
  configureSelect,
  configureTextInput,
  focusInnerControl,
  mustElement,
  readControlValue,
  selectInnerTextControl,
  writeControlValue,
  type AppBuilderButtonElement,
  type AppBuilderSelectElement,
  type AppBuilderTextInputElement,
} from './control-ui.js';

test(
  'control-ui configures elements and reads control values',
  () => {
    const dom = new JSDOM(
      '<div id="button"></div><div id="input"></div><div id="select"></div>',
    );
    const previousDocument = globalThis.document;

    globalThis.document = dom.window.document;

    try {
      const button = mustElement<AppBuilderButtonElement>('button');
      const input = mustElement<AppBuilderTextInputElement>('input');
      const select = mustElement<AppBuilderSelectElement>('select');

      configureButton(button, {
        text: 'Save',
        icon: '✓',
        className: 'btn btn-primary',
      });
      configureTextInput(input, {
        placeholder: 'Name',
        inputType: 'email',
        className: 'form-input-lg',
      });
      configureSelect(select, {
        className: 'form-select',
        items: [
          { value: 'light', label: 'Light' },
        ],
        placeholder: 'Choose',
      });
      writeControlValue(input, ' hello ');

      assert.equal(button.type, 'button');
      assert.equal(button.text, 'Save');
      assert.equal(button.icon, '✓');
      assert.equal(button.buttonClassName, 'btn btn-primary');
      assert.equal(input.placeholder, 'Name');
      assert.equal(input.inputType, 'email');
      assert.equal(input.controlClassName, 'form-input-lg');
      assert.deepEqual(select.items, [
        { value: 'light', label: 'Light' },
      ]);
      assert.equal(select.placeholder, 'Choose');
      assert.equal(readControlValue(input), ' hello ');
      assert.throws(
        () => {
          mustElement('missing');
        },
        /Missing element #missing/,
      );
    } finally {
      globalThis.document = previousDocument;
    }
  },
);

test(
  'control-ui focuses nested controls and selects text controls',
  () => {
    const dom = new JSDOM('<div></div>');
    const container = dom.window.document.createElement('div');
    const input = dom.window.document.createElement('input');

    let containerFocused = false;
    let inputFocused = false;
    let inputSelected = false;

    container.focus = () => {
      containerFocused = true;
    };
    input.focus = () => {
      inputFocused = true;
    };
    input.select = () => {
      inputSelected = true;
    };

    container.appendChild(input);

    focusInnerControl(container);
    selectInnerTextControl(container);

    assert.equal(containerFocused, false);
    assert.equal(inputFocused, true);
    assert.equal(inputSelected, true);
  },
);