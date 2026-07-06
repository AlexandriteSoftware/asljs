import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { resolveLocalWorkspaceDependencyBuildOrder }
  from './packages.js';

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
