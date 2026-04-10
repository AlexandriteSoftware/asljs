import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    ObservableObject,
  } from './observable-object.js';

const TEST_SUITE =
  'observable-object';

type PersonModel =
  { name: string;
    age: number; };

class Person
  extends ObservableObject<PersonModel>
{
  private nameValue = '';
  private ageValue = 0;

  get name(): string {
    return this.nameValue;
  }

  set name(
      value: string
    )
  {
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
    )
  {
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
}

test(
  `${TEST_SUITE}: setAndEmit is idempotent for equal values`,
  () => {
    const person =
      new Person();

    let count = 0;

    (person as any).on(
      'set:name',
      () => count += 1);

    person.name = 'Alice';
    person.name = 'Alice';
    person.name = 'Bob';

    assert.equal(
      count,
      2);
  });

test(
  `${TEST_SUITE}: emitSet emits keyed and aggregate events`,
  () => {
    const person =
      new Person();

    let keyedCount = 0;
    let aggregateCount = 0;

    (person as any).on(
      'set:age',
      () => keyedCount += 1);

    (person as any).on(
      'set',
      () => aggregateCount += 1);

    person.forceEmit(
      'age',
      1,
      2);

    assert.equal(
      keyedCount,
      1);

    assert.equal(
      aggregateCount,
      1);
  });

test(
  `${TEST_SUITE}: watch observes selected properties`,
  () => {
    const person =
      new Person();

    const values: Array<[string, number]> = [];

    const unwatch =
      person.watch(
        [ 'name', 'age' ],
        (name: string, age: number) => {
          values.push([ name, age ]);
        });

    person.name = 'Alice';
    person.age = 7;

    const disposed =
      unwatch();

    person.age = 8;

    assert.equal(
      disposed,
      true);

    assert.deepEqual(
      values,
      [ [ '', 0 ],
        [ 'Alice', 0 ],
        [ 'Alice', 7 ] ]);
  });
