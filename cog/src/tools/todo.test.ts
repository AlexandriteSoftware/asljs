import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider }
  from '../logger.js';
import { extractTodos,
         TodoTool }
  from './todo.js';

const loggerProvider =
  createLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

interface ExpectedTodo
{
  todo: string;
  excerpt: string;
  startLine: number;
  endLine: number;
}

interface ExtractTodosCase
{
  name: string;
  lines: string[];
  expected: ExpectedTodo[];
}

const extractTodosCases: ExtractTodosCase[] =
  [ { name:
        'joins continuation lines that keep the comment prefix',
      lines:
        [ 'class Builder',
          '{',
          '  // TODO: constructor',
          '  //   - folder to build in',
          '',
          '  // TODO: build operation' ],
      expected:
        [ { todo:
              'constructor\n  - folder to build in',
            excerpt:
              '// TODO: constructor\n  //   - folder to build in',
            startLine: 3,
            endLine: 4 },
          { todo: 'build operation',
            excerpt:
              '// TODO: build operation',
            startLine: 6,
            endLine: 6 } ] },
    { name:
        'starts a new todo on the next commented TODO line',
      lines:
        [ ' // TODO: first',
          ' // TODO: second' ],
      expected:
        [ { todo: 'first',
            excerpt: '// TODO: first',
            startLine: 1,
            endLine: 1 },
          { todo: 'second',
            excerpt: '// TODO: second',
            startLine: 2,
            endLine: 2 } ] },
    { name:
        'starts a new todo on the next bare TODO line',
      lines:
        [ ' TODO: first',
          ' TODO: second' ],
      expected:
        [ { todo: 'first',
            excerpt: 'TODO: first',
            startLine: 1,
            endLine: 1 },
          { todo: 'second',
            excerpt: 'TODO: second',
            startLine: 2,
            endLine: 2 } ] },
    { name:
        'stops at a line that drops the comment prefix',
      lines:
        [ ' // TODO: first',
          ' ++ unrelated' ],
      expected:
        [ { todo: 'first',
            excerpt: '// TODO: first',
            startLine: 1,
            endLine: 1 } ] },
    { name:
        'supports markdown todos without a comment prefix',
      lines:
        [ 'TODO: write docs',
          'about the tool',
          '',
          'unrelated' ],
      expected:
        [ { todo:
              'write docs\nabout the tool',
            excerpt:
              'TODO: write docs\nabout the tool',
            startLine: 1,
            endLine: 2 } ] },
    { name:
        'returns nothing when there is no todo',
      lines:
        [ 'const value = 1;' ],
      expected: [ ] } ];

for (const testCase of extractTodosCases) {
  test(
    `extractTodos ${testCase.name}`,
    () =>
    {
      const content =
        testCase.lines.join(
          '\n');

      const todos =
        extractTodos(
          'builder.ts',
          content);

      assert.equal(
        todos.length,
        testCase.expected.length);

      for (const [index, expected] of testCase.expected.entries()) {
        const todo = todos[index];

        assert.equal(
          todo.file,
          'builder.ts');

        assert.equal(
          todo.todo,
          expected.todo);

        assert.equal(
          todo.excerpt,
          expected.excerpt);

        assert.equal(
          todo.startLine,
          expected.startLine);

        assert.equal(
          todo.endLine,
          expected.endLine);

        assert.equal(
          content.slice(
            todo.startPosition,
            todo.endPosition),
          expected.excerpt);
      }
    });
}

test(
  'todo tool finds todos only in matching files',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'todo.test'));

    await workspace.writeText(
      'src/code.cs',
      '// TODO: implement\n');

    await workspace.writeText(
      'src/ignored.txt',
      '// TODO: skipped\n');

    const tool =
      new TodoTool(
        loggerProvider.getLogger(
          'TodoTool'),
        workspace.path);

    const todos =
      await tool.findAll(
        '**/*.cs',
        '**/*.md');

    assert.equal(
      todos.length,
      1);

    assert.equal(
      todos[0].todo,
      'implement');

    assert.equal(
      todos[0].excerpt,
      '// TODO: implement');

    const todo =
      await tool.findOne(
        '**/*.cs',
        '**/*.md');

    assert.equal(
      todo?.todo,
      'implement');

    assert.equal(
      await tool.findOne(
        '**/*.json'),
      null);
  });
