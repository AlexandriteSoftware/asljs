import path
  from 'node:path';
import { spawn }
  from 'node:child_process';
import { mkdir,
         readFile,
         writeFile }
  from 'node:fs/promises';
import { DefinitionProvider }
  from '../providers/definitionProvider.js';

export async function execUpdate(
  environment,
  options = { })
{
  const logger =
    environment.logger;

  logger.trace(
    'execUpdate: start');

  const rootDir =
    environment.cwd;

  const provider =
    new DefinitionProvider(
      logger,
      rootDir,
      environment.definitions);

  const definitions =
    await provider.getDefinitions();

  const runCopilotCli =
    environment.runCopilotCli
    ?? runConfiguredCopilotCli;

  const dryRun =
    options.dryRun === true;

  const updates =
    [];

  const warnings =
    [];

  const prompts =
    [];

  for (const definition of definitions) {
    logger.trace(
      `processing definition: ${definition.name}`);

    for (const rule of definition.rules) {
      logger.trace(
        `processing rule: ${definition.name}_${rule.id}`);

      const currentFilePath =
        rule.absoluteFilePath;

      if (!currentFilePath) {
        logger.trace(
          `rule file does not exist: ${definition.name}_${rule.id}`);

        const expectedFilePath =
          getExpectedRuleFilePath(
            definition,
            rule);

        const request =
          buildCopilotRequest(
            'create',
            definition,
            rule,
            expectedFilePath,
            null,
            rootDir);

        if (dryRun) {
          prompts.push(request);

          updates.push(
            `Would create ${toPosixPath(
              path.relative(
                rootDir,
                expectedFilePath))}`);

          continue;
        }

        logger.trace(
          `requesting Copilot CLI to generate the rule file`);

        const content =
          await runCopilotCli(request);

        logger.trace(
          `writing new rule file: ${expectedFilePath}`);

        await mkdir(
          path.dirname(
            expectedFilePath),
          {
            recursive: true,
          });

        await writeFile(
          expectedFilePath,
          ensureTrailingNewline(content),
          'utf8');

        updates.push(
          `Created ${toPosixPath(
            path.relative(
              rootDir,
              expectedFilePath))}`);

        continue;
      }

      if (path.extname(
        currentFilePath).toLowerCase() !== '.js') {
        warnings.push(
          `Skipping ${toPosixPath(
            path.relative(
              rootDir,
              currentFilePath))}: only JS rule files are supported for auto-update.`,
        );

        continue;
      }

      const currentContent =
        await readFile(
          currentFilePath,
          'utf8');

      const firstComment =
        extractFirstComment(currentContent);

      if (commentMatchesRule(
        firstComment,
        rule)) {
        continue;
      }

      const request =
        buildCopilotRequest(
          'update',
          definition,
          rule,
          currentFilePath,
          currentContent,
          rootDir,
        );

      if (dryRun) {
        prompts.push(request);

        updates.push(
          `Would update ${toPosixPath(
            path.relative(
              rootDir,
              currentFilePath))}`);

        continue;
      }

      const updatedContent =
        await runCopilotCli(request);

      await writeFile(
        currentFilePath,
        ensureTrailingNewline(updatedContent),
        'utf8');

      updates.push(
        `Updated ${toPosixPath(
          path.relative(
            rootDir,
            currentFilePath))}`);
    }
  }

  const result =
    {
    updates,
    warnings,
    prompts,
  };

  if (result.updates.length === 0) {
    environment.stdout.write(
      'No rule updates were needed.\n');
  }

  for (const update of result.updates) {
    environment.stdout.write(
      `${update}\n`);
  }

  for (const warning of result.warnings) {
    environment.stderr.write(
      `${warning}\n`);
  }

  if (options.dryRun) {
    for (const prompt of result.prompts) {
      environment.stdout.write(
        `\n--- ${prompt.mode.toUpperCase()} ${toPosixPath(
          path.relative(
            environment.cwd,
            prompt.targetFilePath))} ---\n`);

      environment.stdout.write(
        `${prompt.prompt}\n`);
    }
  }
}

function getExpectedRuleFilePath(
  definition,
  rule)
{
  return path.join(
    path.dirname(
      definition.definitionPath),
    'rules',
    `${definition.name}_${rule.id}.js`,
  );
}

function buildCopilotRequest(
  mode,
  definition,
  rule,
  targetFilePath,
  currentContent = null,
  rootDirectory = path.dirname(
    definition.definitionPath))
{
  return {
    mode,
    rootDirectory,
    targetFilePath,
    definitionName: definition.name,
    definitionPath: definition.definitionPath,
    ruleId: rule.id,
    ruleDescription: rule.description,
    expectedComment: formatRuleComment(rule),
    currentContent,
    prompt: buildPrompt(
      mode,
      definition,
      rule,
      targetFilePath,
      currentContent),
  };
}

function buildPrompt(
  mode,
  definition,
  rule,
  targetFilePath,
  currentContent)
{
  return [
    `Definition: ${definition.name}`,
    `Definition file: ${definition.definitionPath}`,
    `Rule: ${rule.id} - ${rule.description}`,
    `Target file: ${targetFilePath}`,
    `The first comment in the file must be multiline and exactly: ${formatRuleComment(rule)}`,
    'Do not edit files or apply patches directly.',
    'Write to standard output only the updated file content, no other text.',
    currentContent === null
      ? null
      : `Current file content:\n${currentContent}`,
  ].filter(
    (value) => value !== null).join('\n\n');
}

async function runConfiguredCopilotCli(
  request)
{
  const command =
    process.env.PART_COPILOT_CLI_COMMAND?.trim();

  if (command) {
    return runShellCopilotCli(
      command,
      request);
  }

  return runDefaultCopilotCli(request);
}

async function runShellCopilotCli(
  command,
  request)
{
  return new Promise((resolve, reject) => {
    const child =
      spawn(
        command,
        {
          cwd: request.rootDirectory,
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe'],
        });

    let stdout = '';
    let stderr = '';

    child.stdout.on(
      'data',
      (chunk) => {
        stdout += String(chunk);
      });

    child.stderr.on(
      'data',
      (chunk) => {
        stderr += String(chunk);
      });

    child.on(
      'error',
      reject);

    child.on(
      'close',
      (code) => {
        if (code !== 0) {
          reject(
            new Error(stderr.trim() || `Copilot CLI failed with exit code ${code}.`));

          return;
        }

        resolve(stdout);
      });

    child.stdin.write(
      request.prompt);

    child.stdin.end();
  });
}

async function runDefaultCopilotCli(
  request)
{
  const attempts =
    getDefaultCopilotCliInvocations(
      request.prompt);

  let lastError = null;

  for (const attempt of attempts) {
    try {
      return await runExecutableCopilotCli(
        attempt.command,
        attempt.args,
        request.rootDirectory);
    } catch (error) {
      if (!isMissingCommandError(error)) {
        throw error;
      }

      lastError = error;
    }
  }

  throw new Error(
    'UpdateRules requires GitHub Copilot CLI in PATH (via `gh copilot` or `copilot`) or PART_COPILOT_CLI_COMMAND.',
    { cause: lastError ?? undefined },
  );
}

function buildDefaultCopilotArgs(
  prompt)
{
  return [
    '-p',
    prompt,
    '--allow-all-tools',
    '--allow-all-paths',
    '--no-ask-user',
    '--silent',
  ];
}

export function getDefaultCopilotCliInvocations(
  prompt)
{
  return [
    {
      command: 'gh',
      args: [
        'copilot',
        ...buildDefaultCopilotArgs(prompt),
      ],
    },
    {
      command: 'copilot',
      args: buildDefaultCopilotArgs(prompt),
    },
  ];
}

async function runExecutableCopilotCli(
  command,
  args,
  cwd)
{
  return new Promise((resolve, reject) => {
    const child =
      spawn(
        command,
        args,
        {
          cwd,
          stdio: ['ignore', 'pipe', 'pipe'],
        });

    let stdout = '';
    let stderr = '';

    child.stdout.on(
      'data',
      (chunk) => {
        stdout += String(chunk);
      });

    child.stderr.on(
      'data',
      (chunk) => {
        stderr += String(chunk);
      });

    child.on(
      'error',
      reject);

    child.on(
      'close',
      (code) => {
        if (code !== 0) {
          reject(
            new Error(stderr.trim() || `Copilot CLI failed with exit code ${code}.`));

          return;
        }

        resolve(stdout);
      });
  });
}

function isMissingCommandError(
  error)
{
  return error instanceof Error
    && 'code' in error
    && error.code === 'ENOENT';
}

function extractFirstComment(
  content)
{
  const match =
    /^\s*(\/\*[\s\S]*?\*\/|(?:\/\/[^\n]*\r?\n?)*)/.exec(content);

  if (!match || !match[1].trim()) {
    return null;
  }

  return normalizeCommentText(
    match[1]);
}

function normalizeCommentText(
  commentText)
{
  if (commentText.trim().startsWith('/*')) {
    return commentText
      .replace(
        /^\s*\/\*/,
        '')
      .replace(
        /\*\/\s*$/,
        '')
      .split(/\r?\n/)
      .map(
        (line) => line.replace(
          /^\s*\*?\s?/,
          '').trimEnd())
      .join('\n')
      .trim();
  }

  return commentText
    .split(/\r?\n/)
    .map(
      (line) => line.replace(
        /^\s*\/\/\s?/,
        '').trimEnd())
    .join('\n')
    .trim();
}

function commentMatchesRule(
  firstComment,
  rule)
{
  if (firstComment === null) {
    return false;
  }

  return normalizeWhitespace(firstComment) === normalizeWhitespace(
    formatRuleComment(rule));
}

function formatRuleComment(
  rule)
{
  return `${rule.id} - ${rule.description}`;
}

function normalizeWhitespace(
  value)
{
  return value.replace(
    /\s+/g,
    ' ').trim();
}

function ensureTrailingNewline(
  value)
{
  return value.endsWith('\n')
    ? value
    : `${value}\n`;
}

function toPosixPath(
  value)
{
  return value.replaceAll(
    '\\',
    '/');
}