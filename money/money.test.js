const money = require('./money');

function assertThrows(fn, error) {
  try {
    fn();
    throw new Error('Expected an exception');
  } catch (e) {
    if (e.message !== error)
      throw e;
  }
}

function parseTest() {
  function assert(input, value) {
    const actual = money.parse(input);
    if (value === null) {
      if (actual !== null)
        throw new Error(`Expected '${input}' to be incorrect, but it parsed as ${JSON.stringify(actual)}`);
    } else if (actual === null || actual.value !== value)
      throw new Error(`Expected '${input}' to parse as ${value} but got ${JSON.stringify(actual)}`);
  }

  assert(null, null);
  assert('', null);
  assert('-', null);
  assert('1', 100);
  assert('1000000', 100000000);
  assert('1.2', 120);
  assert('-0', 0);
  assert('-1', -100);
  assert('-1.2', -120);
  assert('-1.23', -123);
  assert('-1000000.23', -100000023);
  assert('902.01', 90201);
}

function formatTest() {
  function assert(value) {
    const actual = money.fromString(value).toString();
    if (actual !== value)
      throw new Error(`Expected '${value}', but has '${actual}'`);
  }

  assert('1.00');
  assert('1,000,000.00');
  assert('1.20');
  assert('0.00');
  assert('-1.00');
  assert('-1.20');
  assert('-1.23');
  assert('-1,000,000.23');
}

function fromStringTests() {
  function assert(value, expected) {
    const actual = money.fromString(value).value;
    if (actual !== expected)
      throw new Error(`Expected '${value}' to be ${expected} but got ${actual}`);
  }

  assert('1', 100);
  assert('1000000', 100000000);
  assert('1.2', 120);
  assert('-0', 0);
  assert('-1', -100);
  assert('-1.2', -120);
  assert('-1.23', -123);
  assert('-1,000,000.23', -100000023);

  assertThrows(() => money.fromString('asdf'), 'invalid format');
}

function fromNumberTests() {
  function assert(value, expected) {
    const actual = money.fromNumber(value).value;
    if (actual !== expected)
      throw new Error(`Expected '${value}' to be ${expected} but got ${actual}`);
  }

  assert(1, 100);
  assert(1000000, 100000000);
  assert(1.2, 120);
  assert(-0, 0);
  assert(-1, -100);
  assert(-1.2, -120);
  assert(-1.23, -123);
  assert(-1000000.23, -100000023);

  assertThrows(() => money.fromNumber(10e40), 'number of minor units is greater than 9007199254740991');
}

function distributeTest() {
  function assert(value, count, expected) {
    const actual = money.fromString(value).distribute(count).map(x => x.toString());
    if (actual.join(',') !== expected.join(','))
      throw new Error(`Expected '${value}' to be distributed as ${expected} but got ${actual}`);
  }

  assert('1', 1, ['1.00']);
  assert('1', 2, ['0.50', '0.50']);
  assert('1', 3, ['0.34', '0.33', '0.33']);
  assert('1', 4, ['0.25', '0.25', '0.25', '0.25']);
  assert('1', 5, ['0.20', '0.20', '0.20', '0.20', '0.20']);
  assert('1', 6, ['0.17', '0.17', '0.17', '0.17', '0.16', '0.16']);
}

parseTest();
formatTest();
fromStringTests();
fromNumberTests();
distributeTest();