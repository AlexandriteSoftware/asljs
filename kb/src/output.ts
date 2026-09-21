import { Environment }
  from './environment.js';

export type OutputFormat =
  | 'text'
  | 'json';

/**
 * Resolve the requested output format, falling back to the given default when
 * the value is missing. Unknown formats are rejected.
 */
export function resolveOutputFormat(
    value: unknown,
    fallback: OutputFormat = 'text'
  ): OutputFormat
{
  if (
    typeof value
    !== 'string'
    || value.trim() === ''
  ) {
    return fallback;
  }

  const format =
    value.trim().toLowerCase();

  if (
    format === 'text'
    || format === 'json'
  ) {
    return format;
  }

  throw new Error(
    `Unknown output format: ${value.trim()}. Use text or json.`);
}

/**
 * Write a value as indented JSON, followed by a line break.
 */
export function writeJson(
    environment: Environment,
    value: unknown
  ): void
{
  environment.stdout.write(
    `${JSON.stringify(
      value,
      null,
      2)}\n`);
}

/**
 * Write one line of text.
 */
export function writeLine(
    environment: Environment,
    value = ''
  ): void
{
  environment.stdout.write(
    `${value}\n`);
}

/**
 * Write a list of lines. Nothing is written for an empty list.
 */
export function writeLines(
    environment: Environment,
    values: string[]
  ): void
{
  for (const value of values) {
    writeLine(
      environment,
      value);
  }
}
