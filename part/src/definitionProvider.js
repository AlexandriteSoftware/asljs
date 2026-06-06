import path from 'node:path';

import { glob } from 'glob';

import { Definition } from './definition.js';
import { GitIgnore } from './gitIgnore.js';

export class DefinitionProvider
{
  constructor(rootPath)
  {
    this.rootPath = path.resolve(rootPath);
  }

  async getDefinitions(definitionsPath = this.rootPath)
  {
    const searchPath = path.resolve(definitionsPath);
    const gitIgnore = new GitIgnore(searchPath);
    const markdownPaths = await glob('**/*.md', {
      absolute: true,
      cwd: searchPath,
      dot: true,
      nodir: true,
    });
    const visibleMarkdownPaths = gitIgnore.filter(markdownPaths);
    const definitions = [];

    for (const markdownPath of visibleMarkdownPaths) {
      const definition = await Definition.load(markdownPath, {
        rootPath: this.rootPath,
      });

      if (definition) {
        definitions.push(definition);
      }
    }

    definitions.sort((left, right) => left.name.localeCompare(right.name));
    return definitions;
  }
}