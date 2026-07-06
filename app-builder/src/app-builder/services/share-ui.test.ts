import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { buildShareStatusMessage,
         shouldExcludeNonApplicationFileFromShare }
  from './share-ui.js';

test(
  'shouldExcludeNonApplicationFileFromShare excludes tests and workflow artifacts',
  () => {
    assert.equal(shouldExcludeNonApplicationFileFromShare('app.test.js'), true);
    assert.equal(shouldExcludeNonApplicationFileFromShare('src/app.test.js'), true);
    assert.equal(shouldExcludeNonApplicationFileFromShare('DEVELOP.md'), true);
    assert.equal(shouldExcludeNonApplicationFileFromShare('CHANGE.md'), true);
    assert.equal(shouldExcludeNonApplicationFileFromShare('PLAN.md'), true);
    assert.equal(shouldExcludeNonApplicationFileFromShare('README.md'), false);
    assert.equal(shouldExcludeNonApplicationFileFromShare('src/app.spec.js'), false);
  });

test(
  'buildShareStatusMessage reports safe lengths',
  () => {
    assert.equal(
      buildShareStatusMessage(3200, 4000, 5000),
      'Link is ready at 3200 characters. Practical working limit is about 4000. Use copy buttons to share as text or HTML.',
    );
  });

test(
  'buildShareStatusMessage reports warning lengths',
  () => {
    assert.equal(
      buildShareStatusMessage(5200, 4000, 5000),
      'Link is ready at 5200 characters. Practical working limit is about 4000. It is over the warning threshold of 5000, so some apps may reject it.',
    );
  });