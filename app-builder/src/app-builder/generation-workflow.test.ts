import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { buildChangeListFromPlan,
         hasPendingPlanChanges }
  from './generation-workflow.js';

test(
  'hasPendingPlanChanges ignores the default empty PLAN placeholder',
  () =>
  {
    assert.equal(
      hasPendingPlanChanges(
        '# PLAN\n\nPending changes for the next generation cycle go here.'),
      false);

    assert.equal(
      hasPendingPlanChanges(
        '# PLAN\n\nAdd a score panel.'),
      true);
  });

test(
  'buildChangeListFromPlan turns plain lines into actionable change bullets',
  () =>
  {
    assert.equal(
      buildChangeListFromPlan(
        '# PLAN\n\nAdd a score panel.\nShow last winner.'),
      '# CHANGE\n\nCurrent generation cycle:\n\n- Add a score panel.\n- Show last winner.');
  });
