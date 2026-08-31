import { type Logger }
  from 'asljs-logging';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import { LocationResolver }
  from '../location.js';
import { type Tool }
  from './tool.js';

export interface Todo
{
  todo: string;
  excerpt: string;
  file: string;
  startLine: number;
  endLine: number;
  startPosition: number;
  endPosition: number;
}

export const defaultTodoPatterns =
  [ '**/*.ts',
    '**/*.cs',
    '**/*.md' ];

const todoPattern =
  /^(\s*)(\/\/ )?TODO:(.*)$/;

export class TodoTool implements Tool
{
  readonly name = 'todos';

  constructor(
    readonly logger: Logger,
    readonly rootPath: string = process.cwd()
  )
  {
  }

  async findAll(
    ...patterns: string[]
  ): Promise<Todo[]>
  {
    const resolver =
      new LocationResolver(
        this.logger,
        this.rootPath);

    const files =
      (await resolver.resolve(
        this.rootPath,
        { patterns }))
      .map(
        file =>
          path.resolve(
            file))
      .sort();

    const todos: Todo[] = [ ];

    for (const file of files) {
      todos.push(
        ...extractTodos(
          file,
          await fs.readFile(
            file,
            'utf8')));
    }

    return todos;
  }

  async findOne(
    ...patterns: string[]
  ): Promise<Todo | null>
  {
    const todos =
      await this.findAll(
        ...patterns);

    return todos[0] ?? null;
  }
}

/** Positions are absolute offsets of the TODO marker and of the last line end. */
export function extractTodos(
    file: string,
    content: string
  ): Todo[]
{
  const lines =
    content.split(
      /\r?\n/);

  const offsets =
    getLineOffsets(
      content,
      lines);

  const todos: Todo[] = [ ];

  let index = 0;

  while (index < lines.length) {
    const match =
      todoPattern.exec(
        lines[index]);

    if (!match) {
      index++;

      continue;
    }

    const indent = match[1];
    const prefix = match[2] ?? '';

    const continuation =
      new RegExp(
        `^\\s*${
        escapeRegExp(
          prefix)
      }`);

    const todoLines =
      [ match[3].trim() ];

    let endIndex = index;

    while (endIndex + 1 < lines.length) {
      const next =
        lines[endIndex + 1];

      if (
        next.trim() === ''
        || !continuation.test(
          next)
        || todoPattern.test(
          next)
      ) {
        break;
      }

      endIndex++;

      todoLines.push(
        next.replace(
          continuation,
          '')
          .trimEnd());
    }

    const startPosition = offsets[index] + indent.length;

    const endPosition =
      offsets[endIndex] + lines[endIndex].length;

    todos.push(
      { todo:
          todoLines.join(
            '\n')
          .trim(),
        excerpt:
          content.slice(
            startPosition,
            endPosition),
        file,
        startLine: index + 1,
        endLine: endIndex + 1,
        startPosition,
        endPosition });

    index = endIndex + 1;
  }

  return todos;
}

function getLineOffsets(
    content: string,
    lines: readonly string[]
  ): number[]
{
  const offsets: number[] = [ ];

  let offset = 0;

  for (const line of lines) {
    offsets.push(
      offset);

    offset += line.length;

    offset += content.startsWith(
      '\r\n',
      offset)
      ? 2
      : 1;
  }

  return offsets;
}

function escapeRegExp(
    value: string
  ): string
{
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&');
}
