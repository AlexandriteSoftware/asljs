import assert from 'node:assert/strict';
import test from 'node:test';
import {
  useDom
} from '../testing/dom.js';
import status, {
  statusOf
} from './status.js';

test('statusOf reads ok, warn and error from a status field or a bare word', () =>
{
  assert.equal(statusOf({ status: 'ok' }), 'ok');
  assert.equal(statusOf('Online'), 'ok');
  assert.equal(statusOf({ status: 'degraded' }), 'warn');
  assert.equal(statusOf('stale'), 'warn');
  assert.equal(statusOf({ status: 'FAILED' }), 'error');
  assert.equal(statusOf('down'), 'error');
  assert.equal(statusOf({ status: 'maybe' }), null);
  assert.equal(statusOf({}), null);
});

test('status draws the word coloured by its state, and the message', () =>
{
  using dom = useDom();

  const body = dom.body();
  status(body, { status: 'warn', message: 'main 1a2b3c4 2 changed' });

  assert.equal(
    body.innerHTML,
    '<p class="status status-warn">warn</p><p class="note">main 1a2b3c4 2 changed</p>'
  );
});

test('status takes its word from labels, and is unknown for a word it does not know', () =>
{
  using dom = useDom();

  const body = dom.body();
  status(body, 'up', { labels: { ok: 'Online' } });
  assert.equal(body.innerHTML, '<p class="status status-ok">Online</p>');

  status(body, 'sideways');
  assert.equal(
    body.innerHTML,
    '<p class="status status-unknown">sideways</p>'
  );
});
