import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import {
    JSDOM
  } from 'jsdom';
import {
    observable
  } from 'asljs-observable';
import {
    bindValueModel
  } from './bind-value-model.js';
import {
    type ValueBindingSpec
  } from './types.js';

const CONTEXT_NAME =
  'bind-value-model-test';

test(
  `${CONTEXT_NAME}: applies configured pipes in order`,
  () => {
    const dom =
      new JSDOM('<span></span>');

    const element =
      dom.window.document.querySelector('span') as HTMLElement;

    const model: Record<string, unknown> =
      { value: 4 };

    const spec: ValueBindingSpec =
      {
        kind: 'value',
        target: { kind: 'text' },
        path: 'value',
        pipes: [
          { name: 'add', args: [ '2' ] },
          { name: 'mul', args: [ '3' ] }
        ]
      };

    bindValueModel(
      element,
      spec,
      model,
      {
        pipes: {
          add: (value, amount) => Number(value) + Number(amount),
          mul: (value, factor) => Number(value) * Number(factor)
        }
      });

    assert.equal(
      element.textContent,
      '18');
  });

test(
  `${CONTEXT_NAME}: throws for unknown pipe during binding setup`,
  () => {
    const dom =
      new JSDOM('<span></span>');

    const element =
      dom.window.document.querySelector('span') as HTMLElement;

    const model: Record<string, unknown> =
      { value: 'A' };

    const spec: ValueBindingSpec =
      {
        kind: 'value',
        target: { kind: 'text' },
        path: 'value',
        pipes: [
          { name: 'missing', args: [] }
        ]
      };

    assert.throws(
      () =>
        bindValueModel(
          element,
          spec,
          model,
          {}),
      /Unknown pipe: missing/);
  });

test(
  `${CONTEXT_NAME}: pipe error propagates to caller`,
  () => {
    const dom =
      new JSDOM('<span></span>');

    const element =
      dom.window.document.querySelector('span') as HTMLElement;

    const model: Record<string, unknown> =
      { value: 'X' };

    const spec: ValueBindingSpec =
      {
        kind: 'value',
        target: { kind: 'text' },
        path: 'value',
        pipes: [
          { name: 'boom', args: [] }
        ]
      };

    assert.throws(
      () =>
        bindValueModel(
          element,
          spec,
          model,
          {
            pipes: {
              boom: () => {
                throw new Error('broken');
              }
            }
          }),
      /broken/);
  });

test(
  `${CONTEXT_NAME}: renders nullish values as empty string for text and html`,
  () => {
    const dom =
      new JSDOM('<div><span></span><div></div></div>');

    const textElement =
      dom.window.document.querySelector('span') as HTMLElement;

    const htmlElement =
      dom.window.document.querySelector('div div') as HTMLElement;

    const model: Record<string, unknown> =
      {
        textValue: null,
        htmlValue: undefined
      };

    bindValueModel(
      textElement,
      {
        kind: 'value',
        target: { kind: 'text' },
        path: 'textValue',
        pipes: []
      },
      model,
      {});

    bindValueModel(
      htmlElement,
      {
        kind: 'value',
        target: { kind: 'html' },
        path: 'htmlValue',
        pipes: []
      },
      model,
      {});

    assert.equal(textElement.textContent, '');
    assert.equal(htmlElement.innerHTML, '');
  });

test(
  `${CONTEXT_NAME}: updates nested path via watch when leaf and ancestor change`,
  () => {
    const dom =
      new JSDOM('<span></span>');

    const element =
      dom.window.document.querySelector('span') as HTMLElement;

    const model =
      observable(
        { user: { name: 'Alice' } });

    const spec: ValueBindingSpec =
      {
        kind: 'value',
        target: { kind: 'text' },
        path: 'user.name',
        pipes: []
      };

    const dispose =
      bindValueModel(
        element,
        spec,
        model as unknown as Record<string, unknown>,
        {});

    assert.equal(
      element.textContent,
      'Alice');

    model.user.name =
      'Bob';

    assert.equal(
      element.textContent,
      'Bob');

    model.user =
      { name: 'Carol' };

    assert.equal(
      element.textContent,
      'Carol');

    dispose();

    model.user.name =
      'Dan';

    assert.equal(
      element.textContent,
      'Carol');
  });
