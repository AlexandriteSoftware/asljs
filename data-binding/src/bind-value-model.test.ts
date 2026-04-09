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
        {},
        'value[0]',
        () => {});

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
