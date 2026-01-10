import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import {
    VirtualFolders
  } from '../dist/virtual-folders.js';

test(
  'resolves folders correctly',
  async (t) => {
    const workingFolder =
      path.resolve('.');

    const folders =
      new VirtualFolders(
        workingFolder,
        { });

    const cases =
      [ { name: 'resolves \'\'',
          requestPath: '',
          expectedPath: workingFolder },
        { name: 'resolves \'test\'',
          requestPath: 'test',
          expectedPath: path.join(workingFolder, 'test') } ];

    for (const testCase of cases) {
      await t.test(
        testCase.name,
        () => {
          assert.equal(
            folders.resolve(testCase.requestPath).path,
            testCase.expectedPath);
        });
    }
  });
