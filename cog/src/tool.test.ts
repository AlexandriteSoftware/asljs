import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { type Tool }
  from './tool.js';

test(
  'tool identifies an adapter by name',
  () =>
  {
    const tool: Tool =
      { name: 'git' };

    assert.equal(
      tool.name,
      'git');
  });
