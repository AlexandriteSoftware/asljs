import fs,
       { readdir }
  from 'node:fs/promises';
import path
  from 'node:path';
import { toPosixPath }
  from '../formatting.js';
import { ArtefactDefinitionProvider }
  from './artefact-definition-provider.js';
import { Logger }
  from '../logging/logging.js';
import { ArtefactDefinitionRule }
  from '../model/artefact-definition-rule.js';

export class ArtefactDefinitionRuleProvider
{
  private logger: Logger;
  private definitions: ArtefactDefinitionProvider;

  constructor(
      logger: Logger,
      definitionProvider: ArtefactDefinitionProvider
    )
  {
    this.logger = logger;
    this.definitions = definitionProvider;
  }

  async isRuleInSync(
      definition: string,
      ruleId: string,
    ): Promise<boolean>
  {
    this.logger.trace(
      'isRuleInSync(%s, %s) { Checking if rule is in sync }',
      definition,
      ruleId);

    const definitionObj =
      await this.definitions.findDefinition(definition);

    if (!definitionObj) {
      throw new Error(
        `Definition '${definition}' not found`);
    }

    const rule =
      definitionObj.rules
        .find(
          item =>
            item.id === ruleId);

    if (!rule) {
      throw new Error(
        `Rule '${ruleId}' not found in definition '${definition}'`);
    }

    const ruleJsFilePath =
      path.join(
        definitionObj.path,
        'parts',
        `${definition}_${ruleId}.js`);

    let isRuleJsFileExists: boolean;
    try {
      const stat =
        await fs.stat(ruleJsFilePath);
      isRuleJsFileExists = stat.isFile();
    } catch (error) {
      isRuleJsFileExists = false;
    }

    if (!isRuleJsFileExists) {
      this.logger.trace(
        'isRuleInSync(%s, %s) { Rule JS file does not exist }',
        definition,
        ruleId);
      
      return false;
    }

    const ruleJsFileContent =
      await fs.readFile(
        ruleJsFilePath,
        'utf-8');

    const firstComment =
      this.extractFirstComment(
        ruleJsFileContent);

    return this.commentMatchesRule(
      firstComment,
      rule);
  }

  async resolveRuleFile(
      ruleId: string,
      definition: string,
      definitionPath: string
    ): Promise<{ path: string; relativePath: string; } | null>
  {
    if (
      typeof ruleId !== 'string'
      || ruleId.trim() === ''
    ) {
      throw new Error(
        'ruleId must be a non-empty string');
    }

    this.logger.trace(
      'resolveRuleFile { ruleId=%s, definition=%s, definitionPath=%s }',
      ruleId,
      definition,
      definitionPath);

    if (
      !definition
      || !definitionPath)
    {
      return null;
    }

    const directoryPath =
      path.join(
        path.dirname(
          definitionPath),
        'parts');

    const baseName =
      `${definition}_${ruleId}`;

    this.logger.trace(
      'resolveRuleFile { looking for rule file in %s with baseName=%s }',
      directoryPath,
      baseName);

    let entries;

    try {
      entries =
        await readdir(
          directoryPath,
          { withFileTypes: true });
    } catch (error) {
      this.logger.trace(
        'resolveRuleFile { failed to read directory %s. Exception: %s }',
        directoryPath,
        error);

      return null;
    }

    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      const entryBaseName =
        path.basename(
          entry.name,
          path.extname(
            entry.name));

      if (baseName !== entryBaseName) {
        continue;
      }

      const absoluteFilePath =
        path.join(
          directoryPath,
          entry.name);

      return {
        path: absoluteFilePath,
        relativePath:
          toPosixPath(
            path.relative(
              path.dirname(
                definitionPath),
              absoluteFilePath)),
      };
    }

    return null;
  }

  formatRuleComment(
      rule: ArtefactDefinitionRule
    ): string
  {
    return `${rule.id}: ${rule.description}`;
  }

  extractFirstComment(
      content: string
    ): string
  {
    const openingCommentIndex =
      content.indexOf('/*');

    if (openingCommentIndex === -1)
      return '';

    const closingCommentIndex =
      content.indexOf(
        '*/',
        openingCommentIndex + 2);
      
    if (closingCommentIndex === -1)
      return '';

    const commentText =
      content.substring(
        openingCommentIndex,
        closingCommentIndex + 2);

    return commentText;
  }

  commentMatchesRule(
      comment: string,
      rule: ArtefactDefinitionRule
    ): boolean
  {
    if (
      comment === null
      || comment === ''
    ) {
      return false;
    }

    const actualNormalisedComment =
      this.normaliseText(comment);

    const expectedNormalisedComment =
      this.normaliseText(
        this.formatRuleComment(rule));

    return actualNormalisedComment === expectedNormalisedComment;
  }

  normaliseText(
      value: string
    ): string
  {
    const normalised =
      value
        .replace(
          /[\r?\n\s]+/g,
          ' ')
        .toUpperCase()
        .trim();

    return normalised;
  }
}
