import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPENAI_TOOLS,
} from './ai-tools.js';

test('all tool schemas use strict + additionalProperties=false', () => {
  for (const tool of OPENAI_TOOLS) {
    assert.equal(tool.type, 'function');
    assert.equal(tool.strict, true);
    assert.equal(tool.parameters.type, 'object');
    assert.equal(tool.parameters.additionalProperties, false);
  }
});

test('required includes every property key for each tool schema', () => {
  for (const tool of OPENAI_TOOLS) {
    const propertyKeys =
      Object.keys(tool.parameters.properties).sort();

    const requiredKeys =
      [...tool.parameters.required].sort();

    assert.deepEqual(
      requiredKeys,
      propertyKeys,
      `${tool.name}: required must exactly match properties keys`,
    );
  }
});

test('replaceFilePart schema requires replaceAll', () => {
  const tool = OPENAI_TOOLS.find(item => item.name === 'replaceFilePart');

  assert.notEqual(tool, undefined);

  if (tool === undefined) {
    throw new Error('replaceFilePart tool is missing');
  }

  assert.deepEqual(
    [...tool.parameters.required].sort(),
    [
      'path',
      'replaceAll',
      'replacement',
      'search',
    ],
  );
});
