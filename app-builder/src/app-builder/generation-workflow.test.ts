import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  buildChangeListFromDevelop,
  hasPendingDevelopChanges,
} from './generation-workflow.js';

test(
  'hasPendingDevelopChanges ignores the default empty DEVELOP placeholder',
  () => {
    assert.equal(
      hasPendingDevelopChanges('# DEVELOP\n\nPending changes for the next generation cycle go here.'),
      false,
    );
    assert.equal(
      hasPendingDevelopChanges('# DEVELOP\n\nAdd a score panel.'),
      true,
    );
  });

test(
  'buildChangeListFromDevelop turns plain lines into actionable change bullets',
  () => {
    assert.equal(
      buildChangeListFromDevelop('# DEVELOP\n\nAdd a score panel.\nShow last winner.'),
      '# CHANGE\n\nCurrent generation cycle:\n\n- Add a score panel.\n- Show last winner.',
    );
  });