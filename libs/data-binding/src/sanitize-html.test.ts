import { TmpGlobals }
  from 'asljs-testing';
import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { sanitizeHtml }
  from './sanitize-html.js';

const TEST_SUITE = 'sanitize-html';

test(
  `${TEST_SUITE}: removes active content and keeps safe markup`,
  () =>
  {
    using globals =
      new TmpGlobals(
        { window:
            new JSDOM('').window });

    assert.equal(
      sanitizeHtml(
        '<b>bold</b>'
          + '<img src="x" onerror="alert(1)">'
          + '<script>alert(2)</script>'
          + '<a href="javascript:alert(3)">link</a>'),
      '<b>bold</b><img src="x"><a>link</a>');
  });

test(
  `${TEST_SUITE}: throws when there is no window`,
  () =>
  {
    using globals =
      new TmpGlobals(
        { window: undefined });

    assert.throws(
      () => sanitizeHtml('<b>bold</b>'),
      /needs a DOM window/);
  });

test(
  `${TEST_SUITE}: throws rather than returning markup DOMPurify cannot sanitize`,
  () =>
  {
    using globals =
      new TmpGlobals(
        { window: {} });

    assert.throws(
      () => sanitizeHtml(
        '<img src="x" onerror="alert(1)">'),
      /does not support this window/);
  });
