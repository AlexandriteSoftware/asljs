import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { parseToolkitDocs }
  from './actions.js';

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
