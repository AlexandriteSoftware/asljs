import assert from 'node:assert/strict';
import test from 'node:test';

import {
  renderKioskHtml
} from '../kiosk.js';

test(
  'renderKioskHtml inlines script and title',
  () => {
    const html =
      renderKioskHtml(
        { scriptSource: 'console.log(123);',
          title: 'My Kiosk' });

    assert.match(html, /<title>My Kiosk<\/title>/);
    assert.match(html, /<script type="module">/);
    assert.match(html, /console\.log\(123\);/);
  });

test(
  'renderKioskHtml escapes </script',
  () => {
    const html =
      renderKioskHtml(
        { scriptSource: 'console.log("</script>");' });

    assert.ok(
      html.includes('<\\/script>'),
      'expected </script to be escaped');
  });
