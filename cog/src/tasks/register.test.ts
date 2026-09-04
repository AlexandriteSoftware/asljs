import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { type Task,
         TaskRegistry }
  from '../task.js';
import { registerCoreTasks }
  from './register.js';

test(
  'core tasks are available from the task factory',
  () =>
  {
    const registry =
      new TaskRegistry();

    registerCoreTasks(
      registry);

    const tasks: Task[] =
      [ registry.create(
        'copilot',
        { prompt: 'prompt' }),
        registry.create(
          'copilot-check'),
        registry.create(
          'get-changed-files'),
        registry.create(
          'format-changed-files'),
        registry.create(
          'extract-todos'),
        registry.create(
          'find-todo'),
        registry.create(
          'context-add-files',
          { pattern: '*.txt' }),
        registry.create(
          'context-write-file',
          { path: 'file.txt',
            content: '' }),
        registry.create(
          'context-remove-file',
          { path: 'file.txt' }),
        registry.create(
          'context-update-files'),
        registry.create(
          'context-instruction',
          { instruction: 'instruction' }),
        registry.create(
          'context-task',
          { task: 'task' }),
        registry.create(
          'context-process'),
        registry.create(
          'get-commit-message'),
        registry.create(
          'commit'),
        registry.create(
          'commit-if-changed'),
        registry.create(
          'clean-working-folder'),
        registry.create(
          'build'),
        registry.create(
          'test'),
        registry.create(
          'todo') ];

    assert.equal(
      tasks.length,
      20);
  });
