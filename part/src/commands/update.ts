import { spawn }
  from 'node:child_process';
import { readFile }
  from 'node:fs/promises';
import path
  from 'node:path';
import { Environment }
  from './../environment.js';
import { toPosixPath }
  from '../formatting.js';
import { Logger }
  from '../logging/logging.js';
import { ArtefactDefinitionRule }
  from '../model/artefact-definition-rule.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { ArtefactDefinitionRuleProvider }
  from '../providers/artefact-definition-rule-provider.js';

export interface CodeGenerationRequest
{
  mode: 'create' | 'update';
  definition: string;
  definitionPath: string;
  rule: string;
  ruleId: string;
  ruleFilePath: string;
  comment: string;
  currentContent: string | null;
  prompt: string;
  rootDirectory: string;
}

export interface UpdateCommandOptions
{
  dryRun: boolean;
}

export async function execUpdate(
    logger: Logger,
    environment: Environment,
    options: Partial<UpdateCommandOptions> = {}
  ): Promise<void>
{
  logger.trace('start');

  const rootDir =
    environment.project;

  const { artefactDefinitionProvider } =
    environment.getProviders();

  const definitions =
    await artefactDefinitionProvider.getDefinitions();

  const ruleProvider =
    new ArtefactDefinitionRuleProvider(
    logger,
    artefactDefinitionProvider
  );

  const runCopilotCli =
    environment.runCopilotCli
    ?? runConfiguredCopilotCli;

  const dryRun =
    options.dryRun === true;

  const updates = [];
  const warnings = [];
  const prompts = [];

  for (const definition of definitions) {
    logger.trace(
      'processing definition: %s',
      definition.name);

    for (const rule of definition.rules) {
      const ruleId =
        `${definition.name}_${rule.id}`;

      logger.trace(
        'processing rule: %s',
        ruleId);

      const ruleFile =
        await ruleProvider.resolveRuleFile(
          rule.id,
          definition.name,
          definition.path);

      const currentFilePath =
        ruleFile?.path;

      if (!currentFilePath) {
        logger.trace(
          'rule file does not exist: %s',
          ruleId);

        const expectedFilePath =
          getExpectedRuleFilePath(
            definition,
            rule);

        const request: CodeGenerationRequest =
          {
          mode: 'create',
          rootDirectory: rootDir,
          ruleFilePath: expectedFilePath,
          definition: definition.name,
          definitionPath: definition.path,
          ruleId: rule.id,
          rule: rule.content,
          comment: ruleProvider.formatRuleComment(rule),
          currentContent: null,
          prompt: buildPrompt(
            'create',
            definition,
            rule,
            expectedFilePath,
            null)
        };

        if (dryRun) {
          prompts.push(request);

          updates.push(
            `Would create ${
              toPosixPath(
                path.relative(
                  rootDir,
                  expectedFilePath))
            }`);

          continue;
        }

        logger.trace(
          'requesting generation of the rule file');

        const response =
          await runCopilotCli(
            logger,
            request);

        updates.push(
          response);

        continue;
      }

      if (
        path.extname(
          currentFilePath).toLowerCase() !== '.js'
      ) {
        warnings.push(
          `Skipping ${
            toPosixPath(
              path.relative(
                rootDir,
                currentFilePath))
          }: only JS rule files can be auto-updated.`);

        continue;
      }

      const currentContent =
        await readFile(
          currentFilePath,
          'utf8');

      const firstComment =
        ruleProvider.extractFirstComment(currentContent);

      if (
        ruleProvider.commentMatchesRule(
          firstComment,
          rule)
      ) {
        continue;
      }

      const request: CodeGenerationRequest =
        {
        mode: 'update',
        rootDirectory: rootDir,
        ruleFilePath: currentFilePath,
        definition: definition.name,
        definitionPath: definition.path,
        ruleId: rule.id,
        rule: rule.content,
        comment: ruleProvider.formatRuleComment(rule),
        currentContent: currentContent,
        prompt: buildPrompt(
          'update',
          definition,
          rule,
          currentFilePath,
          currentContent)
      };

      if (dryRun) {
        prompts.push(request);

        updates.push(
          `Would update ${
            toPosixPath(
              path.relative(
                rootDir,
                currentFilePath))
          }`);

        continue;
      }

      const response =
        await runCopilotCli(
          logger,
          request);

      updates.push(
        response);
    }
  }

  const result =
    {
    updates,
    warnings,
    prompts
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
        `\n--- ${prompt.mode.toUpperCase()} ${
          toPosixPath(
            path.relative(
              environment.project,
              prompt.ruleFilePath))
        } ---\n`);

      environment.stdout.write(
        `${prompt.prompt}\n`);
    }
  }
}

function getExpectedRuleFilePath(
    definition: ArtefactDefinition,
    rule: ArtefactDefinitionRule
  ): string
{
  return path.join(
    path.dirname(
      definition.path),
    'parts',
    `${definition.name}_${rule.id}.js`);
}

function buildPrompt(
    mode: 'create' | 'update',
    definition: ArtefactDefinition,
    rule: ArtefactDefinitionRule,
    targetFilePath: string,
    currentContent: string | null
  ): string
{
  const template =
    `
\`\`\`js
/*
${rule.content}
*/

/**
 * @type { import('asljs-part').RuleValidationFunction }
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
import { createPinoLoggerProvider,
         createRuleValidationContext }
  from 'asljs-part';
import { tmpDirFactory }
  from './testing/tmpDir.js';
import { validate }
  from './${rule.name}.js';

const loggerProvider =
  createPinoLoggerProvider();

after(
  () => {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

test(
  '${rule.name} ...',
  async () => {
    await using workspace =
      tmpDir();

      ...
  });
\`\`\`
`;

  const commonPrompt =
    `In the validate function you can use \`context\` to access validation
context, e.g. artefacts, definitions, and logger. You can use libraries that
available in to the \`part\` package.json.

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

${rule.content}

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

${rule.content}

Either create or update a test file ${testFilePath} that tests the rule
implementation. Run test cases to ensure the rule implementation is correct.`;
  }

  return instruction
    + '\n\n'
    + commonPrompt;
}

async function runConfiguredCopilotCli(
    logger: Logger,
    request: CodeGenerationRequest
  ): Promise<string>
{
  let command =
    process.env.PART_COPILOT_CLI_COMMAND?.trim();

  if (!command) {
    command = 'copilot -p "" '
      + '--allow-all-tools '
      + '--allow-all-paths '
      + '--no-ask-user '
      + '--silent';
  }

  return runCopilotCli(
    logger,
    command,
    request);
}

async function runCopilotCli(
    logger: Logger,
    command: string,
    request: CodeGenerationRequest
  ): Promise<string>
{
  logger.trace(
    'runCopilotCli: %s',
    command);

  return new Promise<string>(
    (
      resolve: (value: string) => void,
      reject: (reason: any) => void
    ): void =>
    {
      const child =
        spawn(
          command,
          {
          cwd: request.rootDirectory,
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe']
        });

      let stdout = '';
      let stderr = '';

      child.stdout.on(
        'data',
        chunk =>
        {
          logger.trace(
            String(chunk));

          stdout += String(chunk);
        });

      child.stderr.on(
        'data',
        chunk =>
        {
          logger.trace(
            String(chunk));

          stderr += String(chunk);
        });

      child.on(
        'error',
        reject);

      child.on(
        'close',
        code =>
        {
          if (code !== 0) {
            reject(
              new Error(
                stderr.trim()
                  || `Copilot CLI failed with exit code ${code}.`
              ));

            return;
          }

          resolve(stdout);
        });

      child.stdin.write(
        request.prompt);

      child.stdin.end();
    }
  );
}
