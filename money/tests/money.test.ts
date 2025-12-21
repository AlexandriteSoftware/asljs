import test from 'node:test';
import assert from 'node:assert/strict';

import { money } from '../money.js';

test(
  'parse()',
  () => {
    function assertParse(
        input: any,
        expectedMinorOrNull: number | null
      ): void
    {
      const actual = money.parse(input);

      if (expectedMinorOrNull === null) {
        assert.equal(actual, null);
      } else {
        assert.ok(actual !== null);
        assert.equal(actual.value, expectedMinorOrNull);
      }
    }

    assertParse(null, null);
    assertParse('', null);
    assertParse('-', null);
    assertParse('1', 100);
    assertParse('1000000', 100000000);
    assertParse('1.2', 120);
    assertParse('-0', 0);
    assertParse('-1', -100);
    assertParse('-1.2', -120);
    assertParse('-1.23', -123);
    assertParse('-1000000.23', -100000023);
    assertParse('902.01', 90201);
  });

test(
  'toString prints full format as expected default',
  () => {
    function assertFormat(
        value: string
      ): void
    {
      const actual =
        money.fromString(value)
          .toString('f');

      assert.equal(
        actual,
        value);
    }

    assert.equal(
      money.fromNumber(1).toString('f'),
      '1.00');

    assert.equal(
      money.fromNumber(1, 'USD').toString('f'),
      '1.00 USD');

    assert.equal(
      money.fromNumber(1_000_000.00).toString(),
      '1,000,000.00');

    assert.equal(
      money.fromNumber(1_000_000.00, 'USD').toString('f'),
      '1,000,000.00 USD');

    assertFormat('1.20');
    assertFormat('0.00');
    assertFormat('-1.00');
    assertFormat('-1.20');
    assertFormat('-1.23');
    assertFormat('-1,000,000.23');
  });

test(
  'toString prints compact format as expected',
  () => {
    assert.equal(
      money.fromNumber(1).toString('c'),
      '1');

    assert.equal(
      money.fromNumber(1, 'USD').toString('c'),
      '1');

    assert.equal(
      money.fromNumber(1_000_000.00).toString('c'),
      '1000000');

    assert.equal(
      money.fromNumber(1_000_000.00, 'USD').toString('c'),
      '1000000');
  });

test(
  'fromString()',
  () => {
    function assertMinor(
        value: string,
        expected: number
      ): void
    {
      const actual =
        money.fromString(value).value;

      assert.equal(
        actual,
        expected);
    }

    assertMinor('1', 100);
    assertMinor('1000000', 100000000);
    assertMinor('1.2', 120);
    assertMinor('-0', 0);
    assertMinor('-1', -100);
    assertMinor('-1.2', -120);
    assertMinor('-1.23', -123);
    assertMinor('-1,000,000.23', -100000023);

    assert.throws(
      () => money.fromString('asdf'),
      /invalid format/);
  });

test(
  'fromNumber()',
  () => {
    function assertMinor(
        value: number,
        expected: number
      ): void
    {
      const actual =
        money.fromNumber(value).value;

      assert.equal(actual, expected);
    }

    assertMinor(1, 100);
    assertMinor(1000000, 100000000);
    assertMinor(1.2, 120);
    assertMinor(-0, 0);
    assertMinor(-1, -100);
    assertMinor(-1.2, -120);
    assertMinor(-1.23, -123);
    assertMinor(-1000000.23, -100000023);

    assert.throws(
      () => money.fromNumber(10e40),
      /number of minor units is greater than 9007199254740991/);
  });

test(
  'currency-aware add/subtract and mismatch error',
  () => {
    const a = money.fromMinor(100, 'USD');
    const b = money.fromMinor(50, 'USD');
    const c = a.add(b);
    assert.equal(c.value, 150);
    assert.equal(c.currency, 'USD');

    const d = c.subtract(money.fromMinor(30, 'USD'));
    assert.equal(d.value, 120);
    assert.equal(d.currency, 'USD');

    const eur = money.fromMinor(10, 'EUR');
    assert.throws(() => a.add(eur), /currency mismatch/);
    assert.throws(() => a.subtract(eur), /currency mismatch/);
  });

test(
  'convert between currencies with rate',
  () => {
    const usd = money.fromMinor(12345, 'USD'); // $123.45
    const eur = usd.convert(0.9, 'EUR');
    assert.equal(eur.currency, 'EUR');
    assert.equal(eur.value, Math.trunc((12345 / 100) * 0.9 * 100));

    assert.throws(() => usd.convert(-1, 'EUR'), /rate must be a positive finite number/);
    assert.throws(() => usd.convert(Number.POSITIVE_INFINITY, 'EUR'), /rate must be a positive finite number/);
  });

test(
  'fromMajor()',
  () => {
    function assertMinor(
        value: number,
        expected: number
      ): void
    {
      const actual =
        money.fromMajor(value).value;

      assert.equal(actual, expected);
    }

    assertMinor(1, 100);
    assertMinor(-1, -100);

    assert.throws(
      () => money.fromMajor(1.2),
      /value is not an integer/);
  });

test(
  'distribute()',
  () => {
    function assertDist(
        value: string,
        count: number,
        expected: string
      ): void
    {
      const actual =
        money.fromString(value)
          .distribute(count)
          .map(x => x.toString())
          .join(',');

      assert.equal(
        actual,
        expected);
    }

    assertDist(
      '1',
      1,
      '1.00');

    assertDist(
      '1',
      2,
      '0.50,0.50');

    assertDist(
      '1',
      3,
      '0.34,0.33,0.33');

    assertDist(
      '1',
      4,
      '0.25,0.25,0.25,0.25');

    assertDist(
      '1',
      5,
      '0.20,0.20,0.20,0.20,0.20');

    assertDist(
      '1',
      6,
      '0.17,0.17,0.17,0.17,0.16,0.16');
  });
