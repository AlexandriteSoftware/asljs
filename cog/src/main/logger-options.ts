import { type PinoLoggerProviderOptions }
  from 'asljs-logging';

/** Logging is configured before commander parses argv, so flags are read directly. */
export function readLoggerOptions(
    argv: readonly string[]
  ): Partial<PinoLoggerProviderOptions>
{
  const options: Partial<PinoLoggerProviderOptions> = {};

  const level =
    readOptionValue(
      argv,
      '--loglevel');

  if (level) {
    options.level = level;
  }

  const file =
    readOptionValue(
      argv,
      '--logfile');

  if (file) {
    options.file = file;
  }

  return options;
}

function readOptionValue(
    argv: readonly string[],
    name: string
  ): string | undefined
{
  const index =
    argv.indexOf(
      name);

  if (
    index !== -1
    && index + 1
       < argv.length
  ) {
    return argv[index + 1];
  }

  const prefix = `${name}=`;

  const inline =
    argv.find(
      value =>
      value.startsWith(
        prefix));

  return inline?.slice(
    prefix.length);
}
