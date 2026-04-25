import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  shouldBypassWorkflowCycle,
} from './workflow-bypass.js';

test(
  'shouldBypassWorkflowCycle detects direct file edits',
  () => {
    assert.equal(
      shouldBypassWorkflowCycle('Update app.js to add a score label.'),
      true,
    );
    assert.equal(
      shouldBypassWorkflowCycle('Please add a logo image to the start screen.'),
      true,
    );
    assert.equal(
      shouldBypassWorkflowCycle('Add multiplayer and save the winner history.'),
      false,
    );
  });