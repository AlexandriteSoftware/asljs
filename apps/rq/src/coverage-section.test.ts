import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { hasCoverageSection,
         writeCoverageSection }
  from './coverage-section.js';

test(
  'writeCoverageSection adds the section before the Status, or replaces it',
  () =>
  {
    const added =
      writeCoverageSection(
        '# R1\n\nText.\n\n## Implementation\n\n- [T1][T1]\n\n[T1]: T1.md\n\n## Status\n\n- Coverage: COMPLETE\n',
        'T1 covers the text.\n');

    assert.equal(
      added,
      '# R1\n\nText.\n\n## Implementation\n\n- [T1][T1]\n\n[T1]: T1.md\n\n## Coverage\n\nT1 covers the text.\n\n## Status\n\n- Coverage: COMPLETE\n');

    assert.equal(
      writeCoverageSection(
        added,
        '# Missing\n\nNothing covers the text.'),
      '# R1\n\nText.\n\n## Implementation\n\n- [T1][T1]\n\n[T1]: T1.md\n\n## Coverage\n\n\\# Missing\n\nNothing covers the text.\n\n## Status\n\n- Coverage: COMPLETE\n');

    assert.equal(
      writeCoverageSection(
        '# R1\n\nText.\n',
        'Covered.'),
      '# R1\n\nText.\n\n## Coverage\n\nCovered.\n');

    assert.ok(
      hasCoverageSection(added));

    assert.ok(
      !hasCoverageSection('# R1\n'));
  });
