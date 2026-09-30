import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { batch,
         Change }
  from './contract.js';
import { ObservableObject }
  from './observable-object.js';

const TEST_SUITE = 'observable-object';

type PersonModel = { name: string; age: number; };

class Person extends ObservableObject<PersonModel>
{
  private nameValue = '';
  private ageValue = 0;

  get name(): string {
    return this.nameValue;
  }

  set name(
    value: string
  ) {
    this.setAndEmit(
      'name',
      this.nameValue,
      value,
      next => this.nameValue = next);
  }

  get age(): number {
    return this.ageValue;
  }

  set age(
    value: number
  ) {
    this.setAndEmit(
      'age',
      this.ageValue,
      value,
      next => this.ageValue = next);
  }

  public forceEmit(
    property: 'name' | 'age',
    previous: string | number,
    value: string | number
  ): boolean
  {
    if (property === 'name') {
      return this.emitSet(
        'name',
        previous as string,
        value as string);
    }

    return this.emitSet(
      'age',
      previous as number,
      value as number);
  }

  /** Reports two properties as one notification. */
  public rename(
    name: string,
    age: number
  ): void
  {
    batch(
      () =>
      {
        this.name = name;
        this.age = age;
      });
  }
}

function record(
    source: any
  ): Array<readonly Change[]>
{
  const deliveries: Array<readonly Change[]> = [ ];

  source.on(
    'change',
    (
      changes: readonly Change[]
    ) => deliveries.push(changes));

  return deliveries;
}

test(
  `${TEST_SUITE}: setAndEmit is idempotent for equal values`,
  () =>
  {
    const person =
      new Person();

    const deliveries =
      record(person);

    person.name = 'Alice';
    person.name = 'Alice';
    person.name = 'Bob';

    assert.deepEqual(
      deliveries.flatMap(
        changes => [ ...changes ]),
      [ { kind: 'set',
          property: 'name',
          value: 'Alice',
          previous: '' },
        { kind: 'set',
          property: 'name',
          value: 'Bob',
          previous: 'Alice' } ]);
  });

test(
  `${TEST_SUITE}: emitSet reports one change entry`,
  () =>
  {
    const person =
      new Person();

    const deliveries =
      record(person);

    person.forceEmit(
      'age',
      1,
      2);

    assert.deepEqual(
      deliveries,
      [ [ { kind: 'set',
            property: 'age',
            value: 2,
            previous: 1 } ] ]);
  });

/**
 * A hand-written participant joins a batch, because it reports through the same
 * path the converter does. `README.md` recommends the class as the way to write
 * one, so it cannot be left out of the batching rule.
 */
test(
  `${TEST_SUITE}: a batched setter reports one notification`,
  () =>
  {
    const person =
      new Person();

    const deliveries =
      record(person);

    person.rename(
      'Alice',
      7);

    assert.equal(
      deliveries.length,
      1);

    assert.deepEqual(
      deliveries[0],
      [ { kind: 'set',
          property: 'name',
          value: 'Alice',
          previous: '' },
        { kind: 'set',
          property: 'age',
          value: 7,
          previous: 0 } ]);
  });
