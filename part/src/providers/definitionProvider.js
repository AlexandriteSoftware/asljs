import path
  from 'node:path';

import { glob }
  from 'glob';
import { Definition }
  from '../definition.js';
import { GitIgnore }
  from './gitIgnore.js';

export class DefinitionProvider
{
  constructor(
    logger,
    rootPath,
    definitionsPath = rootPath)
  {
    this.logger = logger;
    this.rootPath = path.resolve(rootPath);

    this.definitionsPath =
      path.resolve(
        this.rootPath,
        definitionsPath);

    this.gitIgnore =
      new GitIgnore(
        this.logger,
        this.rootPath);

    this.cache = null;
  }

  async getDefinitions()
  {
    if (this.cache) {
      return this.cache;
    }

    this.logger.trace(
      `scanning for definitions in ${this.definitionsPath}`);

    const markdownPaths =
      await glob(
        '**/*.md',
        {
          absolute: true,
          cwd: this.definitionsPath,
          dot: true,
          nodir: true,
        });

    const visibleMarkdownPaths =
      this.gitIgnore.filter(markdownPaths);

    const definitions =
      [];

    for (const markdownPath of visibleMarkdownPaths) {
      const definition =
        await Definition.load(
          markdownPath,
          {
            rootPath: this.rootPath,
          });

      if (definition) {
        definitions.push(definition);
      }
    }

    definitions.sort(
      (left, right) => left.name.localeCompare(
        right.name));

    this.cache = definitions;

    return definitions;
  }
}