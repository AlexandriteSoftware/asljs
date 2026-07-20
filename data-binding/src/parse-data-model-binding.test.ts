import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { parseEventBindingExpression,
         parseValueBindingExpression }
  from './parse-data-model-binding.js';

const TEST_SUITE =
  'parse-data-bind-expression';

test(
  `${TEST_SUITE}: parses value expression without pipes`,
  () =>
  {
    const spec =
      parseValueBindingExpression(
        { kind: 'text' },
        'name');

    assert.deepEqual(
      spec,
      {
        kind: 'value',
        target: { kind: 'text' },
        path: 'name',
        pipes: []
      });
  });

test(
  `${TEST_SUITE}: parses value pipes with whitespace`,
  () =>
  {
    const spec =
      parseValueBindingExpression(
        { kind: 'html' },
        ' body | default: N/A | upper ');

    assert.deepEqual(
      spec,
      {
        kind: 'value',
        target: { kind: 'html' },
        path: 'body',
        pipes: [
          { name: 'default', args: ['N/A'] },
          { name: 'upper', args: [] }
        ]
      });
  });

test(
  `${TEST_SUITE}: parses value expression for attribute target`,
  () =>
  {
    const spec =
      parseValueBindingExpression(
        { kind: 'attr', name: 'title' },
        'updatedAt | date:yyyy-MM-dd');

    assert.deepEqual(
      spec,
      {
        kind: 'value',
        target: { kind: 'attr', name: 'title' },
        path: 'updatedAt',
        pipes: [
          { name: 'date', args: ['yyyy-MM-dd'] }
        ]
      });
  });

test(
  `${TEST_SUITE}: parses multiple quoted pipe args`,
  () =>
  {
    const spec =
      parseValueBindingExpression(
        { kind: 'html' },
        "body | wrap:'<span>':'</span>'");

    assert.deepEqual(
      spec,
      {
        kind: 'value',
        target: { kind: 'html' },
        path: 'body',
        pipes: [
          { name: 'wrap', args: ['<span>', '</span>'] }
        ]
      });
  });

test(
  `${TEST_SUITE}: parses date format with pipes and mixed quotes`,
  () =>
  {
    const spec =
      parseValueBindingExpression(
        { kind: 'text' },
        'createdAt | date:"<\'yyyy|MM|dd\' \\"hh:mm:ss\\">"');

    assert.deepEqual(
      spec,
      {
        kind: 'value',
        target: { kind: 'text' },
        path: 'createdAt',
        pipes: [
          { name: 'date', args: ['<\'yyyy|MM|dd\' "hh:mm:ss">'] }
        ]
      });
  });

test(
  `${TEST_SUITE}: parses date format from single-quoted literal`,
  () =>
  {
    const spec =
      parseValueBindingExpression(
        { kind: 'text' },
        "createdAt | date:'<\\'yyyy|MM|dd\\' \"hh:mm:ss\">'");

    assert.deepEqual(
      spec,
      {
        kind: 'value',
        target: { kind: 'text' },
        path: 'createdAt',
        pipes: [
          { name: 'date', args: ['<\'yyyy|MM|dd\' "hh:mm:ss">'] }
        ]
      });
  });

test(
  `${TEST_SUITE}: parses unquoted args until colon or end`,
  () =>
  {
    const spec =
      parseValueBindingExpression(
        { kind: 'text' },
        'amount | fixed: 2 : GBP');

    assert.deepEqual(
      spec,
      {
        kind: 'value',
        target: { kind: 'text' },
        path: 'amount',
        pipes: [
          { name: 'fixed', args: ['2', 'GBP'] }
        ]
      });
  });

test(
  `${TEST_SUITE}: parses quoted arg with delimiters as one literal`,
  () =>
  {
    const spec =
      parseValueBindingExpression(
        { kind: 'text' },
        'createdAt | date:"yyyy|MM|dd hh:mm:ss"');

    assert.deepEqual(
      spec,
      {
        kind: 'value',
        target: { kind: 'text' },
        path: 'createdAt',
        pipes: [
          { name: 'date', args: ['yyyy|MM|dd hh:mm:ss'] }
        ]
      });
  });

test(
  `${TEST_SUITE}: ignores empty pipe segments`,
  () =>
  {
    const spec =
      parseValueBindingExpression(
        { kind: 'text' },
        'name |  | lower');

    assert.deepEqual(
      spec.pipes,
      [{ name: 'lower', args: [] }]);
  });

test(
  `${TEST_SUITE}: parses event expression as actionPath only`,
  () =>
  {
    const spec =
      parseEventBindingExpression(
        'click',
        'activate');

    assert.deepEqual(
      spec,
      {
        kind: 'event',
        eventName: 'click',
        actionPath: 'activate'
      });
  });

test(
  `${TEST_SUITE}: keeps full event expression as actionPath`,
  () =>
  {
    const spec =
      parseEventBindingExpression(
        'click',
        'activate | preventDefault | stopPropagation');

    assert.deepEqual(
      spec,
      {
        kind: 'event',
        eventName: 'click',
        actionPath: 'activate | preventDefault | stopPropagation'
      });
  });
