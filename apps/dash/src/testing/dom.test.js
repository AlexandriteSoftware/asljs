import assert from 'node:assert/strict';
import test from 'node:test';
import {
  useDom
} from './dom.js';

test('useDom defines document until it is disposed, and gives an attached card body', () =>
{
  const before = globalThis.document;

  {
    using dom = useDom();

    assert.equal(globalThis.document, dom.document);

    const body = dom.body();
    assert.equal(body.tagName, 'DIV');
    assert.equal(body.parentNode, dom.document.body);
  }

  assert.equal(globalThis.document, before);
});
