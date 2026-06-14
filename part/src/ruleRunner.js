import path
  from 'node:path';
import { spawn }
  from 'node:child_process';
import { access }
  from 'node:fs/promises';
import { pathToFileURL }
  from 'node:url';

export async function runRule(
  logger,
  rule,
  artefact,
  context)
{
  if (!rule.filePath || !rule.absoluteFilePath) {
    return {
      rule,
      result: 'Fail',
      message: 'Missing rule file.',
    };
  }

  try {
    await access(
      rule.absoluteFilePath);
  }
  catch {
    return {
      rule,
      result: 'Fail',
      message: 'Missing rule file.',
    };
  }

  if (path.extname(
    rule.absoluteFilePath).toLowerCase() === '.js') {
    return runJavaScriptRule(
      rule,
      artefact,
      context);
  }

  return runExecutableRule(
    rule,
    artefact,
    context);
}

export async function runRules(
  definition,
  artefact,
  context)
{
  const results =
    [];

  for (const rule of definition.rules) {
    results.push(
      await runRule(
        rule,
        artefact,
        {
          ...context,
          definition,
        }));
  }

  return results;
}

async function runJavaScriptRule(
  logger,
  rule,
  artefact,
  context)
{
  try {
    const validatorModule =
      await import(pathToFileURL(
        rule.absoluteFilePath).href);

    if (typeof validatorModule.validate !== 'function') {
      return {
        rule,
        result: 'Fail',
        message: 'Rule module must export validate.',
      };
    }

    const outcome =
      await validatorModule.validate(
        artefact,
        { ...context,
          logger });

    if (outcome === false) {
      return {
        rule,
        result: 'Fail',
        message: rule.description,
      };
    }

    if (typeof outcome === 'string' && outcome.length > 0) {
      return {
        rule,
        result: 'Fail',
        message: outcome,
      };
    }

    return {
      rule,
      result: 'Ok',
      message: '',
    };
  }
  catch (error) {
    return {
      rule,
      result: 'Fail',
      message: formatError(error),
    };
  }
}

async function runExecutableRule(
  rule,
  artefact,
  context)
{
  return new Promise((resolve) => {
    const child =
      spawn(
        rule.absoluteFilePath,
        [context.artifactPath],
        {
      cwd: context.rootDirectory,
      env: {
        ...process.env,
        PART_ARTEFACT_FILE: context.artifactPath,
        PART_DEFINITION_NAME: context.definition.name,
        PART_RULE_ID: rule.id,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stderr = '';

    child.stdin.write(
      `${JSON.stringify(artefact)}\n`);

    child.stdin.end();

    child.stderr.on(
      'data',
      (chunk) => {
      stderr += String(chunk);
    });

    child.on(
      'error',
      (error) => {
      resolve(
        {
        rule,
        result: 'Fail',
        message: formatError(error),
      });
    });

    child.on(
      'close',
      (code) => {
      const result =
        code === 0
        ? 'Ok'
        : 'Fail';
      
      const message =
        code === 0
        ? ''
        : stderr.trim() || rule.description;

      resolve(
        {
        rule,
        result,
        message
      });
    });
  });
}

function formatError(error)
{
  if (error instanceof Error) {
    return error.message.replaceAll(
      '\n',
      ' ');
  }

  return String(error);
}