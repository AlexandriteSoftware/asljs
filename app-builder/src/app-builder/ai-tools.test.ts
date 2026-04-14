import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPENAI_TOOLS,
} from './ai-tools.js';

test('all tool schemas use strict + additionalProperties=false', () => {
  for (const tool of OPENAI_TOOLS) {
    assert.equal(tool.type, 'function');
    assert.equal(tool.function.strict, true);
    assert.equal(tool.function.parameters.type, 'object');
    assert.equal(tool.function.parameters.additionalProperties, false);
  }
});

test('required includes every property key for each tool schema', () => {
  for (const tool of OPENAI_TOOLS) {
    const propertyKeys =
      Object.keys(tool.function.parameters.properties).sort();

    const requiredKeys =
      [...tool.function.parameters.required].sort();

    assert.deepEqual(
      requiredKeys,
      propertyKeys,
      `${tool.function.name}: required must exactly match properties keys`,
    );
  }
});

test('replaceFilePart schema requires replaceAll', () => {
  const tool = OPENAI_TOOLS.find(item => item.function.name === 'replaceFilePart');

  assert.notEqual(tool, undefined);

  if (tool === undefined) {
    throw new Error('replaceFilePart tool is missing');
  }

  assert.deepEqual(
    [...tool.function.parameters.required].sort(),
    [
      'path',
      'replaceAll',
      'replacement',
      'search',
    ],
  );
});
