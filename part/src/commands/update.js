import path
  from 'node:path';
import { spawn }
  from 'node:child_process';
import { mkdir,
         readFile,
         writeFile }
  from 'node:fs/promises';
import { DefinitionProvider }
  from '../providers/definition-provider.js';

/**
 * @typedef
 *   { import('./../logging.js')
 *       .Logger }
 *   Logger
 * @typedef
 *   { import('./../environment.js')
 *       .Environment }
 *   Environment
 * @typedef
 *   { import('./../artefact-definition.js')
 *       .ArtefactDefinition }
 *   ArtefactDefinition
 * @typedef
 *   { import('./../artefact-definition.js')
 *       .ArtefactDefinitionRule }
 *   ArtefactDefinitionRule
 * @typedef
 *   { import('./../artefact.js')
 *       .Artefact }
 *   Artefact
 */

/**
 * @typedef {Object} CopilotRequest
 * @property {'create'|'update'} mode 
 * @property {string} definition
 * @property {string} definitionPath 
 * @property {string} rule 
 * @property {string} ruleId
 * @property {string} ruleFilePath
 * @property {string} comment
 * @property {string|null} currentContent 
 * @property {string} prompt
 * @property {string} rootDirectory 
 */

/**
 * @typedef {Object} UpdateCommandOptions
 * @property {boolean} [dryRun]
 */

/**
 * @param {Environment} environment 
 * @param {Partial<UpdateCommandOptions>} [options]
 */
export async function execUpdate(
  environment,
  options = { })
{
  const logger =
    environment.logger;

  logger.trace(
    'execUpdate: start');

  const rootDir =
    environment.project;

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

  const updates = [ ];
  const warnings = [ ];
  const prompts = [ ];

  for (const definition of definitions) {
    logger.trace(
      `processing definition: ${definition.name}`);

    for (const rule of definition.rules) {
      logger.trace(
        `processing rule: ${definition.name}_${rule.id}`);

      const currentFilePath =
        rule.path;

      if (!currentFilePath) {
        logger.trace(
          `rule file does not exist: ${definition.name}_${rule.id}`);

        const expectedFilePath =
          getExpectedRuleFilePath(
            definition,
            rule);

        /** @type {CopilotRequest} */
        const request =
          {
            mode: 'create',
            rootDirectory: rootDir,
            ruleFilePath: expectedFilePath,
            definition: definition.name,
            definitionPath: definition.path,
            ruleId: rule.id,
            rule: rule.description,
            comment: formatRuleComment(rule),
            currentContent: null,
            prompt:
              buildPrompt(
                'create',
                definition,
                rule,
                expectedFilePath,
                null)
          };

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
          await runCopilotCli(
            logger,
            request);

        logger.trace(
          `writing new rule file: ${expectedFilePath}`);

        await mkdir(
          path.dirname(
            expectedFilePath),
          {
            recursive: true,
          });

        updates.push(
          content);

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

        /** @type {CopilotRequest} */
        const request =
          {
            mode: 'update',
            rootDirectory: rootDir,
            ruleFilePath: currentFilePath,
            definition: definition.name,
            definitionPath: definition.path,
            ruleId: rule.id,
            rule: rule.description,
            comment: formatRuleComment(rule),
            currentContent: currentContent,
            prompt:
              buildPrompt(
                'update',
                definition,
                rule,
                currentFilePath,
                currentContent)
          };

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
        await runCopilotCli(
          logger,
          request);

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
            environment.project,
            prompt.ruleFilePath))} ---\n`);

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
      definition.path),
    'rules',
    `${definition.name}_${rule.id}.js`,
  );
}

/**
 * @param {'create' | 'update'} mode 
 * @param {ArtefactDefinition} definition 
 * @param {ArtefactDefinitionRule} rule 
 * @param {string} targetFilePath 
 * @param {string?} currentContent 
 * @returns 
 */
function buildPrompt(
  mode,
  definition,
  rule,
  targetFilePath,
  currentContent)
{
  const template =
    `
\`\`\`js
/*
${rule.id} - ${rule.description}
*/

/**
 * @type { import('../../src/rule-validation-function.js')
 *           .ruleValidationFunction }
 */
export async function validate(
  artefact,
  context)
{
  ...
}

...
\`\`\`
`;

  const testTemplate =
    `
\`\`\`js
import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { TmpDir,
         createLogger,
         ArtefactProvider,
         DefinitionProvider }
  from 'asljs-part';
import { validate }
  from './${rule.name}.js';

const logger =
  createLogger(
    { level: 'trace',
      enabled: false });

test(
  '${rule.name} ...',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

      ...
  });
\`\`\`
`;

  const commonPrompt =
    `In the validate function you can use \`context\` to access validation
context, e.g. artefacts, definitions, and logger. You can use libraries that
available in to the \`part\` package.json:

- "glob": "^13.0.6"
- "remark-parse": "^11.0.0"

You can run shell commands, available on the local machine. E.g., \`dotnet\`,
\`python\`, \`node\`, \`npm\`, \`git\`, etc.

If something is not available, add installation instuction in the dedicated
comment section of the rule file, not the first one.

Use this template for the rule file tests:

${testTemplate}

Create or update files directly, in this chat return only summary of the
changes, do not return the full file content.`;

  const testFilePath =
    targetFilePath.replace(
      /\.js$/i,
      '.test.js');

  let instruction;

  if (mode === 'create') {
    instruction =
      `Create a new file ${targetFilePath} that checks the rule ${rule.id} from
definition ${definition.path} by adding the validate function body and
auxiliary functions as needed in the following template:

${template}

Rule:

${rule.description}

Alongside it, at path ${testFilePath}, create a test file that tests the rule
implementation. Run test cases to ensure the rule implementation is correct.`;
  } else {
    instruction =
      `Update the file ${targetFilePath} to enforce the rule ${rule.id} from
definition ${definition.path} by updating the validate function body and
auxiliary functions as needed. current file content is:

----------------------
${currentContent}
----------------------

After modification, the file should match the following template:

${template}

Rule:

${rule.description}

Either create or update a test file ${testFilePath} that tests the rule
implementation. Run test cases to ensure the rule implementation is correct.`;
  }

  return instruction
         + '\n\n'
         + commonPrompt;
}

/**
 * @param {Logger} logger 
 * @param {CopilotRequest} request 
 */
async function runConfiguredCopilotCli(
  logger,
  request)
{
  const command =
    process.env.PART_COPILOT_CLI_COMMAND?.trim();

  if (command) {
    return runShellCopilotCli(
      logger,
      command,
      request);
  }

  return runDefaultCopilotCli(
    logger,
    request);
}

/**
 * @param {Logger} logger
 * @param {string} command
 * @param {CopilotRequest} request 
 */
async function runShellCopilotCli(
  logger,
  command,
  request)
{
  logger.trace(
    `runShellCopilotCli: ${command}`);

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
        logger.trace(
          `${String(chunk)}`);

        stdout += String(chunk);
      });

    child.stderr.on(
      'data',
      (chunk) => {
        logger.trace(
          `${String(chunk)}`);

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
            new Error(
              stderr.trim()
              || `Copilot CLI failed with exit code ${code}.`));

          return;
        }

        resolve(stdout);
      });

    child.stdin.write(
      request.prompt);

    child.stdin.end();
  });
}

/**
 * @param {Logger} logger
 * @param {CopilotRequest} request 
 */
async function runDefaultCopilotCli(
  logger,
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
            new Error(
              stderr.trim()
              || `Copilot CLI failed with exit code ${code}.`));

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