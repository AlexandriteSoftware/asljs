import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import {
    applyPipes
  } from './apply-pipes.js';
import {
    type PipeFn,
    type PipeSpec
  } from './types.js';

const CONTEXT_NAME =
  'apply-pipes-test';

test(
  `${CONTEXT_NAME}: applies pipes left to right`,
  () => {
    const registry: Record<string, PipeFn> =
      {
        add: (
            value,
            amount
          ) =>
          Number(value) + Number(amount),
        mul: (
            value,
            factor
          ) =>
          Number(value) * Number(factor)
      };

    const specs: PipeSpec[] =
      [ { name: 'add', args: [ '2' ] },
        { name: 'mul', args: [ '3' ] } ];

    const result =
      applyPipes(
        4,
        specs,
        registry);

    assert.equal(result, 18);
  });

test(
  `${CONTEXT_NAME}: unknown pipe warns and keeps value`,
  () => {
    const warnings: string[] = [];

    const result =
      applyPipes(
        'A',
        [ { name: 'missing', args: [] } ],
        {},
        warning => {
          warnings.push(`${warning.type}:${warning.pipeName}`);
        });

    assert.equal(result, 'A');
    assert.deepEqual(warnings, [ 'unknown:missing' ]);
  });

test(
  `${CONTEXT_NAME}: thrown pipe warns and continues with previous value`,
  () => {
    const warnings: string[] = [];

    const registry: Record<string, PipeFn> =
      {
        boom: () => {
          throw new Error('broken');
        },
        suffix: (
            value,
            suffix
          ) =>
          `${value}${suffix}`
      };

    const result =
      applyPipes(
        'X',
        [
          { name: 'boom', args: [] },
          { name: 'suffix', args: [ '!' ] }
        ],
        registry,
        warning => {
          warnings.push(`${warning.type}:${warning.pipeName}`);
        });

    assert.equal(result, 'X!');
    assert.deepEqual(warnings, [ 'error:boom' ]);
  });
