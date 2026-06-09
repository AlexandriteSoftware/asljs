import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises';

import { DefinitionProvider } from './definitionProvider.js';

export async function updateRules(rootDirectory, options = {})
{
  const definitionsDirectory = options.definitionsPath
    ? path.resolve(rootDirectory, options.definitionsPath)
    : path.resolve(rootDirectory);
  const provider = new DefinitionProvider(rootDirectory);
  const definitions = await provider.getDefinitions(definitionsDirectory);
  const runCopilotCli = options.runCopilotCli ?? runConfiguredCopilotCli;
  const updates = [];
  const warnings = [];

  for (const definition of definitions) {
    for (const rule of definition.rules) {
      const currentFilePath = rule.absoluteFilePath;
      const expectedFilePath = getExpectedRuleFilePath(definition, rule);

      if (!currentFilePath) {
        const content = await runCopilotCli(
          buildCopilotRequest('create', definition, rule, expectedFilePath),
        );

        await mkdir(path.dirname(expectedFilePath), {
          recursive: true,
        });
        await writeFile(expectedFilePath, ensureTrailingNewline(content), 'utf8');
        updates.push(`Created ${toPosixPath(path.relative(rootDirectory, expectedFilePath))}`);
        continue;
      }

      if (path.extname(currentFilePath).toLowerCase() !== '.js') {
        warnings.push(
          `Skipping ${toPosixPath(path.relative(rootDirectory, currentFilePath))}: only JS rule files are supported for auto-update.`,
        );
        continue;
      }

      const currentContent = await readFile(currentFilePath, 'utf8');
      const firstComment = extractFirstComment(currentContent);

      if (commentMatchesRule(firstComment, rule)) {
        continue;
      }

      const updatedContent = await runCopilotCli(
        buildCopilotRequest('update', definition, rule, currentFilePath, currentContent),
      );

      await writeFile(currentFilePath, ensureTrailingNewline(updatedContent), 'utf8');
      updates.push(`Updated ${toPosixPath(path.relative(rootDirectory, currentFilePath))}`);
    }
  }

  return {
    updates,
    warnings,
  };
}

function getExpectedRuleFilePath(definition, rule)
{
  return path.join(
    path.dirname(definition.definitionPath),
    'rules',
    `${definition.name}_${rule.id}.js`,
  );
}

function buildCopilotRequest(mode, definition, rule, targetFilePath, currentContent = null)
{
  return {
    mode,
    targetFilePath,
    definitionName: definition.name,
    definitionPath: definition.definitionPath,
    ruleId: rule.id,
    ruleDescription: rule.description,
    expectedComment: formatRuleComment(rule),
    currentContent,
    prompt: buildPrompt(mode, definition, rule, targetFilePath, currentContent),
  };
}

function buildPrompt(mode, definition, rule, targetFilePath, currentContent)
{
  const instruction = mode === 'create'
    ? 'Create the complete JavaScript rule file.'
    : 'Update the existing JavaScript rule file.';

  return [
    instruction,
    `Definition: ${definition.name}`,
    `Definition file: ${definition.definitionPath}`,
    `Rule: ${rule.id} - ${rule.description}`,
    `Target file: ${targetFilePath}`,
    `The first comment in the file must be exactly: ${formatRuleComment(rule)}`,
    'Return only the full file content.',
    currentContent === null
      ? null
      : `Current file content:\n${currentContent}`,
  ].filter((value) => value !== null).join('\n\n');
}

async function runConfiguredCopilotCli(request)
{
  const command = process.env.PART_COPILOT_CLI_COMMAND;

  if (!command) {
    throw new Error(
      'UpdateRules requires environment.runCopilotCli or PART_COPILOT_CLI_COMMAND.',
    );
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Copilot CLI failed with exit code ${code}.`));
        return;
      }

      resolve(stdout);
    });

    child.stdin.write(request.prompt);
    child.stdin.end();
  });
}

function extractFirstComment(content)
{
  const match = /^\s*(\/\*[\s\S]*?\*\/|(?:\/\/[^\n]*\r?\n?)*)/.exec(content);

  if (!match || !match[1].trim()) {
    return null;
  }

  return normalizeCommentText(match[1]);
}

function normalizeCommentText(commentText)
{
  if (commentText.trim().startsWith('/*')) {
    return commentText
      .replace(/^\s*\/\*/, '')
      .replace(/\*\/\s*$/, '')
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*\*?\s?/, '').trimEnd())
      .join('\n')
      .trim();
  }

  return commentText
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\/\/\s?/, '').trimEnd())
    .join('\n')
    .trim();
}

function commentMatchesRule(firstComment, rule)
{
  if (firstComment === null) {
    return false;
  }

  return normalizeWhitespace(firstComment) === normalizeWhitespace(formatRuleComment(rule));
}

function formatRuleComment(rule)
{
  return `${rule.id} - ${rule.description}`;
}

function normalizeWhitespace(value)
{
  return value.replace(/\s+/g, ' ').trim();
}

function ensureTrailingNewline(value)
{
  return value.endsWith('\n')
    ? value
    : `${value}\n`;
}

function toPosixPath(value)
{
  return value.replaceAll('\\', '/');
}