/*
RL1 - the first comment in the JS rule file should be multiline and include
the rule description exactly as it is in the definition file. See the example
below.
*/

import { readFile }
  from 'node:fs/promises';
import path
  from 'node:path';

/**
 * @type { import('../../src/rule-validation-function.js')
 *           .ruleValidationFunction }
 */
export async function validate(
  artefact,
  context)
{
  const logger =
    context.logger;

  const fileName =
    path.basename(
      artefact.path);

  const ctx =
    `Rule File_RL1.validate(${fileName}}): `;

  const match =
    artefact.name.match(
      /^(.+)_(\w+\d+)/);

  if (!match) { 
    return;
  }

  const definitionName =
    match[1];

  const ruleId =
    match[2];

  const definitions =
    await context.definitions
      .getDefinitions();

  const ruleDefinition =
    definitions.find(
      item => item.name === definitionName);

  if (!ruleDefinition) {
    return logAndThrowError(
      `Definition "${definitionName}" not found.`);
  }

  const rule =
    ruleDefinition.rules.find(
      item => item.id === ruleId);

  if (!rule) {
    return logAndThrowError(
      `Rule "${ruleId}" not found in definition "${definitionName}".`);
  }

  const content =
    await readFile(
      artefact.path,
      'utf8');

  const firstCommentStartIndex =
    content.indexOf('/*');

  if (firstCommentStartIndex === -1) {
    return logAndThrowError(
      'No comment found at the start of the file.');
  }

  const firstCommentEndIndex =
    content.indexOf(
      '*/',
      firstCommentStartIndex + 2);

  if (firstCommentEndIndex === -1) {
    return logAndThrowError(
      'No closing comment found for the first comment.');
  }

  const firstCommentContent =
    content
      .substring(
        firstCommentStartIndex + 2,
        firstCommentEndIndex)
      .trim();

  const normalizedFirstCommentContent =
    normalizeText(
      firstCommentContent);

  const normalizedRuleDescription =
    normalizeText(
      `${rule.id} - ${rule.description}`);

  if (normalizedFirstCommentContent !== normalizedRuleDescription) {
    return logAndThrowError(
      `First comment does not match rule description. Expected: "${rule.id} - ${rule.description}", Found: "${firstCommentContent}".`);
  }

  return;

  /**
   * @param {string} message 
   */
  function logAndThrowError(
    message)
  {
    logger.trace(
      `${ctx}${message}`);

    throw new Error(
      message);
  }

  /**
   * @param {string} text 
   */
  function normalizeText(
    text)
  {
    return text
      .replace(
        /\r?\n/g,
        ' ')
      .replace(
        /\s+/g,
        ' ')
      .trim()
      .toUpperCase();
  }
}
