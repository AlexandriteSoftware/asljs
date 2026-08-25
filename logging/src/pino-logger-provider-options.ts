export interface PinoLoggerProviderOptions
{
  level: string;
  file?: string;
}

/**
 * Creates a logger options builder. Starts with default options, which can be
 * overridden by calling the builder methods.
 */
export class PinoLoggerProviderOptionsBuilder
{
  #level: string = 'information';
  #file?: string;

  /**
   * Tries to update the options from environment variables.
   *
   * Environment variables:
   *
   * - `ASLJS_LOG_LEVEL`: The logging level (e.g., 'silent', 'trace', 'debug',
   *   'info', ...).
   * - `ASLJS_LOG_FILE`: The file path to write logs to (if specified).
   */
  fromEnvironmentVariables(
    envVarPrefix: string = 'ASLJS_LOG_'
  ): PinoLoggerProviderOptionsBuilder
  {
    const level =
      process.env[`${envVarPrefix}LEVEL`];

    if (level) {
      this.#validateLevel(level);
      this.#level = level;
    }

    const file =
      process.env[`${envVarPrefix}FILE`];

    if (file) {
      this.#file = file;
    }

    return this;
  }

  withLevel(
    level: string
  ): PinoLoggerProviderOptionsBuilder
  {
    this.#validateLevel(level);
    this.#level = level;
    return this;
  }

  withFile(
    file: string
  ): PinoLoggerProviderOptionsBuilder
  {
    this.#file = file;
    return this;
  }

  build(): PinoLoggerProviderOptions
  {
    const options =
      { level: this.#level,
        file: this.#file };

    return options;
  }

  #validateLevel(
    level: string
  ): void
  {
    const levels =
      [ 'silent',
        'trace',
        'debug',
        'information',
        'warning',
        'error' ];

    if (!levels.includes(level)) {
      const levelsText =
        levels.join(', ');

      throw new Error(
        `The log level '${level}' is invalid. Valid levels: ${levelsText}.`);
    }
  }
}
