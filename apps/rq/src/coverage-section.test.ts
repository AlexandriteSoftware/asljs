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

test(
  'writeCoverageSection replaces the links of the analysis by their text',
  () =>
  {
    assert.equal(
      writeCoverageSection(
        '# R1\n',
        'Covered by [T9 View](<../tests/T9 View.md>) and\n[the **R2** part](R2.md), see https://example.com.'),
      '# R1\n\n## Coverage\n\nCovered by T9 View and\nthe **R2** part, see https://example.com.\n');
  });
