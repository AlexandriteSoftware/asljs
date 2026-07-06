import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  parseToolkitDocs,
  resolveLocalWorkspaceDependencyBuildOrder,
  updateDependencyVersionRanges,
} from './toolkit.js';

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

test(
  'parseToolkitDocs reads summaries and help text from toolkit markdown sections',
  () => {
    const commands =
      parseToolkitDocs(
        `# toolkit

## clean-dist

> Remove the current package dist folder.

Deletes the dist directory under the current working directory.
Use this from a workspace package before rebuilding its publish output.

## release-patch

> Run the patch release workflow for the current workspace package.

Runs validation and publishes the package.
`);

    assert.deepEqual(
      commands,
      [
        {
          actionKey: 'clean-dist',
          actionSummary: 'Remove the current package dist folder.',
          helpText: 'Deletes the dist directory under the current working directory.\nUse this from a workspace package before rebuilding its publish output.',
        },
        {
          actionKey: 'release-patch',
          actionSummary: 'Run the patch release workflow for the current workspace package.',
          helpText: 'Runs validation and publishes the package.',
        },
      ]);
  });

test(
  'resolveLocalWorkspaceDependencyBuildOrder returns transitive local deps in build order',
  () => {
    const dependencyGraph =
      new Map([
        [ 'asljs-components',
          [ 'asljs-data-binding',
            'asljs-eventful',
            'asljs-observable' ] ],
        [ 'asljs-data-binding',
          [ 'asljs-observable' ] ],
        [ 'asljs-observable',
          [ 'asljs-eventful' ] ],
        [ 'asljs-eventful',
          [] ],
      ]);

    const buildOrder =
      resolveLocalWorkspaceDependencyBuildOrder(
        'asljs-components',
        dependencyGraph);

    assert.deepEqual(
      buildOrder,
      [
        'asljs-eventful',
        'asljs-observable',
        'asljs-data-binding',
      ]);
  });

test(
  'resolveLocalWorkspaceDependencyBuildOrder throws on circular dependencies',
  () => {
    const dependencyGraph =
      new Map([
        [ 'a', [ 'b' ] ],
        [ 'b', [ 'a' ] ],
      ]);

    assert.throws(
      () =>
        resolveLocalWorkspaceDependencyBuildOrder(
          'a',
          dependencyGraph),
      /Detected circular workspace dependency/);
  });
