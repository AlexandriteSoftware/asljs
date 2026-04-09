import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import {
    mergePipes
  } from './pipes.js';

const CONTEXT_NAME =
  'pipes-test';

test(
  `${CONTEXT_NAME}: supports upper lower and default`,
  () => {
    const pipes =
      mergePipes({});

    assert.equal(pipes.upper('abc'), 'ABC');
    assert.equal(pipes.lower('ABC'), 'abc');
    assert.equal(pipes.default('', 'N/A'), 'N/A');
  });

test(
  `${CONTEXT_NAME}: supports fixed and number formatting`,
  () => {
    const pipes =
      mergePipes({});

    assert.equal(pipes.fixed(12.345, '2'), '12.35');
    assert.equal(pipes.number(1234.5), '1,234.5');
  });

test(
  `${CONTEXT_NAME}: supports currency and date formatting`,
  () => {
    const pipes =
      mergePipes({});

    assert.match(
      String(pipes.currency(12.5, 'GBP')),
      /\u00A3|GBP/);

    assert.equal(
      pipes.date('2026-02-03', 'yyyy-MM-dd'),
      '2026-02-03');
  });

test(
  `${CONTEXT_NAME}: supports custom pipes overriding built-ins`,
  () => {
    const pipes =
      mergePipes(
        {
          pipes: {
            upper: value => `custom:${value}`
          }
        });

    assert.equal(
      pipes.upper('x'),
      'custom:x');
  });
