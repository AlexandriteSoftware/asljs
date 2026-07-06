import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { updateDependencyVersionRanges }
  from './releasePatch.js';

test(
  'updateDependencyVersionRanges rewrites internal dependency ranges to the new caret version',
  () => {
    const packageJson = {
      dependencies: {
        'asljs-eventful': '^0.4.8',
        other: '^1.0.0',
      },
      devDependencies: {
        'asljs-eventful': '^0.4.8',
      },
    };

    const changed =
      updateDependencyVersionRanges(
        packageJson,
        'asljs-eventful',
        '0.4.9');

    assert.equal(changed, true);
    assert.equal(packageJson.dependencies['asljs-eventful'], '^0.4.9');
    assert.equal(packageJson.devDependencies['asljs-eventful'], '^0.4.9');
    assert.equal(packageJson.dependencies.other, '^1.0.0');
  });

test(
  'updateDependencyVersionRanges returns false when the package is not referenced',
  () => {
    const packageJson = {
      dependencies: {
        other: '^1.0.0',
      },
    };

    const changed =
      updateDependencyVersionRanges(
        packageJson,
        'asljs-eventful',
        '0.4.9');

    assert.equal(changed, false);
    assert.deepEqual(
      packageJson,
      {
        dependencies: {
          other: '^1.0.0',
        },
      });
  });
