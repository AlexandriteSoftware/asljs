import { Environment }
  from '../environment.js';

export function execConfig(
    environment: Environment
  ): Promise<number>
{
  const output: string[] = [];

  output.push(
    'Environment:'
  );

  output.push(
    `  definitions=${environment.definitions}`
  );

  output.push(
    `  project=${environment.project}`
  );

  output.push();

  output.push(
    'Environment Variables:'
  );

  outputEnvVars(
    'PART_LOG_LEVEL',
    'PART_LOG_FILE',
    'PART_DEFINITIONS',
    'PART_PROJECT'
  );

  environment.stdout.write(
    output.join('\n')
  );

  environment.stdout.write('\n');

  return Promise.resolve(0);

  function outputEnvVars(
      ...names: string[]
    ): void
{
    for (const name of names) {
      outputEnvVar(name);
    }
  }

  function outputEnvVar(
      name: string
    ): void
{
    const value =
      process.env[name]
      || '';

    output.push(
      `  ${name}=${value}`
    );
  }
}
