import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { AsljsFormatterTool,
         Context,
         ContextAddFilesTask,
         DefaultTaskRunner,
         DotnetCliTool,
         DprintFormatterTool,
         ExtractTodosTask,
         FormatChangedFilesTask,
         GetChangedFilesTask,
         GitTool,
         JbDotnetFormatterTool,
         main,
         NodeCommandRunner,
         SingletonServiceProvider,
         TaskRegistry,
         TodoTool }
  from './index.js';

test(
  'package root exports framework and CLI entry points',
  (
      t
    ) =>
  {
    assert.equal(
      typeof main,
      'function');

    assert.equal(
      typeof Context,
      'function');

    assert.equal(
      typeof DefaultTaskRunner,
      'function');

    assert.equal(
      typeof SingletonServiceProvider,
      'function');

    assert.equal(
      typeof TaskRegistry,
      'function');

    assert.equal(
      typeof DotnetCliTool,
      'function');

    assert.equal(
      typeof JbDotnetFormatterTool,
      'function');

    assert.equal(
      typeof AsljsFormatterTool,
      'function');

    assert.equal(
      typeof DprintFormatterTool,
      'function');

    assert.equal(
      typeof GitTool,
      'function');

    assert.equal(
      typeof NodeCommandRunner,
      'function');

    assert.equal(
      typeof GetChangedFilesTask,
      'function');

    assert.equal(
      typeof FormatChangedFilesTask,
      'function');

    assert.equal(
      typeof ContextAddFilesTask,
      'function');

    assert.equal(
      typeof TodoTool,
      'function');

    assert.equal(
      typeof ExtractTodosTask,
      'function');
  });
