import { observable }
  from 'asljs-observable';
import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { type BindDataModelOptions,
         type DataModel,
         type PipeFn }
  from './index.js';

const TEST_SUITE = 'types';

interface User
{
  name: string;
}

class Account
{
  balance = 0;
}

test(
  `${TEST_SUITE}: DataModel accepts any non-null object`,
  () =>
  {
    const user: User =
      { name: 'Ada' };

    // Each of these failed against Record<string, unknown>, which needs an
    // index signature.
    const models: DataModel[] =
      [ observable(
        { name: 'Ada' }),
        user,
        new Account(),
        { name: 'Ada' } ];

    // @ts-expect-error - a string is not a model
    const text: DataModel = 'Ada';

    // @ts-expect-error - a number is not a model
    const count: DataModel = 1;

    // @ts-expect-error - null is not a model
    const missing: DataModel = null;

    assert.equal(
      models.length,
      4);

    assert.deepEqual(
      [ text,
        count,
        missing ],
      [ 'Ada',
        1,
        null ]);
  });

test(
  `${TEST_SUITE}: PipeFn names a custom pipe defined apart from the options`,
  () =>
  {
    const shout: PipeFn =
      value => `${String(value)}!`;

    const options: BindDataModelOptions =
      { pipes:
          { shout } };

    assert.equal(
      options.pipes?.shout?.('hi'),
      'hi!');
  });
