import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import {
  parseEventBindingExpression,
  parseValueBindingExpression
  } from './parse-data-model-binding.js';

const CONTEXT_NAME =
  'parse-data-bind-expression-test';

test(
  `${CONTEXT_NAME}: parses value expression without pipes`,
  () => {
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
  `${CONTEXT_NAME}: parses value pipes with whitespace`,
  () => {
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
          { name: 'default', args: [ 'N/A' ] },
          { name: 'upper', args: [] }
        ]
      });
  });

test(
  `${CONTEXT_NAME}: parses value expression for attribute target`,
  () => {
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
          { name: 'date', args: [ 'yyyy-MM-dd' ] }
        ]
      });
  });

test(
  `${CONTEXT_NAME}: parses multiple quoted pipe args`,
  () => {
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
          { name: 'wrap', args: [ '<span>', '</span>' ] }
        ]
      });
  });

test(
  `${CONTEXT_NAME}: ignores empty pipe segments`,
  () => {
    const spec =
      parseValueBindingExpression(
        { kind: 'text' },
        'name |  | lower');

    assert.deepEqual(
      spec.pipes,
      [ { name: 'lower', args: [] } ]);
  });

test(
  `${CONTEXT_NAME}: parses event expression as actionPath only`,
  () => {
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
  `${CONTEXT_NAME}: keeps full event expression as actionPath`,
  () => {
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
