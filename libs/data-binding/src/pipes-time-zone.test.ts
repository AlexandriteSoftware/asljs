// The time zone is set on process.env.TZ, which Node applies at once but
// cannot restore once it was unset. Node runs each test file in its own
// process, so these tests live apart from pipes.test.ts and leave nothing
// behind.
import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { createBuiltInPipes }
  from './pipes.js';

const TEST_SUITE = 'pipes-time-zone';

const ZONES =
  [ 'America/New_York',
    'Pacific/Kiritimati' ];

test(
  `${TEST_SUITE}: a date-only string renders as its own day in any time zone`,
  () =>
  {
    for (const zone of ZONES) {
      process.env.TZ = zone;

      const pipes =
        createBuiltInPipes('en-US');

      assert.equal(
        pipes.date(
          '2026-02-03',
          'yyyy-MM-dd'),
        '2026-02-03',
        zone);

      assert.equal(
        pipes.date(
          '2026-02-03',
          'short'),
        '2/3/26',
        zone);
    }
  });

test(
  `${TEST_SUITE}: a string with a time still follows the platform's Date parsing`,
  () =>
  {
    process.env.TZ = 'America/New_York';

    // UTC midnight is still 2 February in New York.
    assert.equal(
      createBuiltInPipes('en-US').date(
        '2026-02-03T00:00:00Z',
        'yyyy-MM-dd'),
      '2026-02-02');
  });
