import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import test
  from 'node:test';
import { toLocalModulesPaths }
  from './remove-local-modules.js';

const TEST_SUITE =
  'remove-local-modules';

test(
  `${TEST_SUITE}: every workspace contributes its own node_modules`,
  (): void =>
  {
    assert.deepEqual(
      toLocalModulesPaths(
        [ path.join(
          'C:',
          'repo',
          'apps',
          'cog'),
          path.join(
            'C:',
            'repo',
            'libs',
            'locator') ]),
      [ path.join(
        'C:',
        'repo',
        'apps',
        'cog',
        'node_modules'),
        path.join(
          'C:',
          'repo',
          'libs',
          'locator',
          'node_modules') ]);
  });

test(
  `${TEST_SUITE}: no workspace means nothing to remove`,
  (): void =>
  {
    assert.deepEqual(
      toLocalModulesPaths([ ]),
      [ ]);
  });

test(
  `${TEST_SUITE}: the repository root is never one of the paths`,
  (): void =>
  {
    const root =
      path.join(
        'C:',
        'repo');

    const paths =
      toLocalModulesPaths(
        [ path.join(
          root,
          'apps',
          'cog') ]);

    // The hoisted install lives in the root `node_modules`, so it must not
    // appear however the workspaces are listed.
    assert.ok(
      !paths.includes(
        path.join(
          root,
          'node_modules')));
  });
