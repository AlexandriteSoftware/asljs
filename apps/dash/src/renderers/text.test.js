import assert from 'node:assert/strict';
import test from 'node:test';
import {
  useDom
} from '../testing/dom.js';
import text from './text.js';

test('text draws preformatted output, escaped, without trailing whitespace', () =>
{
  using dom = useDom();

  const body = dom.body();
  text(body, 'line 1\n<line 2>\n\n');

  const pre = body.querySelector('pre');
  assert.equal(pre.className, 'mono');
  assert.equal(pre.textContent, 'line 1\n<line 2>');
  assert.equal(pre.style.whiteSpace, 'pre');
  assert.equal(body.querySelector('line'), null);
});

test('text keeps the last lines with tail, wraps with wrap, and prints an object as JSON', () =>
{
  using dom = useDom();

  const body = dom.body();
  text(body, 'a\nb\nc', { tail: 2, wrap: true });
  assert.equal(body.querySelector('pre').textContent, 'b\nc');
  assert.equal(body.querySelector('pre').style.whiteSpace, 'pre-wrap');

  text(body, { out: { ok: true } }, { field: 'out' });
  assert.equal(
    body.querySelector('pre').textContent,
    '{\n  "ok": true\n}'
  );

  text(body, null);
  assert.equal(body.textContent, 'no data');
});
