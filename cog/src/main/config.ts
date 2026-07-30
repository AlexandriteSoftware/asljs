import { Command }
  from 'commander';
import { ExecutionContext }
  from './types.js';

export interface CogConfigSettings
{
  envelopePath: string;
  patchPath: string;
  patchVerifyCmd: string;
  logLevel: string;
  logFile: string;
}

export function configureConfigCommand(
    program: Command,
    context: ExecutionContext
  ): void
{
  program
    .command(
      'config')
    .description(
      'print current configuration and environment variables')
    .action(
      async () =>
      {
        const options =
          program.opts<{
          envelope?: string;
          patch?: string;
        }>();

        const settings =
          getCurrentSettings(
            options);

        const output =
          formatConfig(
            settings);

        for (
          const line of output
          .trimEnd()
          .split(
            '\n')
        ) {
          context.console.writeLine(
            line);
        }
      });
}

export function formatConfig(
    settings: CogConfigSettings,
    envVars: NodeJS.ProcessEnv = process.env
  ): string
{
  const output: string[] = [ ];

  output.push(
    'Environment:');

  output.push(
    `  envelope=${settings.envelopePath}`);

  output.push(
    `  patch=${settings.patchPath}`);

  output.push(
    `  patchVerifyCmd=${settings.patchVerifyCmd}`);

  output.push(
    `  logLevel=${settings.logLevel}`);

  output.push(
    `  logFile=${settings.logFile}`);

  output.push('');

  output.push(
    'Environment Variables:');

  outputEnvVars(
    'COG_LOG_LEVEL',
    'COG_LOG_FILE',
    'COG_ENVELOPE_PATH',
    'COG_PATCH_PATH',
    'COG_PATCH_VERIFY_CMD');

  output.push('');

  return output.join(
    '\n');

  function outputEnvVars(
      ...names: string[]
    ): void
  {
    for (const name of names) {
      const value =
        envVars[name]
        || '';

      output.push(
        `  ${name}=${value}`);
    }
  }
}

function getCurrentSettings(
    options: {
      envelope?: string;
      patch?: string;
    }
  ): CogConfigSettings
{
  return { envelopePath:
             options.envelope
             ?? process.env.COG_ENVELOPE_PATH
             ?? '',
           patchPath:
             options.patch
             ?? process.env.COG_PATCH_PATH
             ?? '',
           patchVerifyCmd:
             process.env.COG_PATCH_VERIFY_CMD
             ?? '',
           logLevel:
             process.env.COG_LOG_LEVEL
             ?? 'silent',
           logFile:
             process.env.COG_LOG_FILE
             ?? '' };
}