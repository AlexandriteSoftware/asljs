import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { writeBindingValue }
  from './write-binding-value.js';

const TEST_SUITE =
  'write-binding-value';

test(
  `${TEST_SUITE}: writes text target to textContent`,
  () =>
  {
    const dom =
      new JSDOM('<div></div>');

    const element =
      dom.window.document.querySelector('div') as HTMLElement;

    writeBindingValue(
      element,
      { kind: 'text' },
      42);

    assert.equal(
      element.textContent,
      '42');
  });

test(
  `${TEST_SUITE}: writes html target to innerHTML`,
  () =>
  {
    const dom =
      new JSDOM('<div></div>');

    const element =
      dom.window.document.querySelector('div') as HTMLElement;

    writeBindingValue(
      element,
      { kind: 'html' },
      '<b>x</b>');

    assert.equal(
      element.innerHTML,
      '<b>x</b>');
  });

test(
  `${TEST_SUITE}: writes and removes attribute target`,
  () =>
  {
    const dom =
      new JSDOM('<a></a>');

    const element =
      dom.window.document.querySelector('a') as HTMLElement;

    writeBindingValue(
      element,
      { kind: 'attr', name: 'href' },
      'https://example.com');

    assert.equal(
      element.getAttribute('href'),
      'https://example.com');

    writeBindingValue(
      element,
      { kind: 'attr', name: 'href' },
      null);

    assert.equal(
      element.hasAttribute('href'),
      false);

    writeBindingValue(
      element,
      { kind: 'attr', name: 'href' },
      'https://example.com');

    writeBindingValue(
      element,
      { kind: 'attr', name: 'href' },
      undefined);

    assert.equal(
      element.hasAttribute('href'),
      false);
  });

test(
  `${TEST_SUITE}: writes property target`,
  () =>
  {
    const dom =
      new JSDOM('<input>');

    const element =
      dom.window.document.querySelector(
        'input') as HTMLInputElement;

    writeBindingValue(
      element,
      { kind: 'prop', name: 'value' },
      'abc');

    assert.equal(
      element.value,
      'abc');
  });

test(
  `${TEST_SUITE}: toggles class target`,
  () =>
  {
    const dom =
      new JSDOM('<div></div>');

    const element =
      dom.window.document.querySelector('div') as HTMLElement;

    writeBindingValue(
      element,
      { kind: 'class', name: 'active' },
      true);

    assert.equal(
      element.classList.contains('active'),
      true);

    writeBindingValue(
      element,
      { kind: 'class', name: 'active' },
      false);

    assert.equal(
      element.classList.contains('active'),
      false);
  });
