import { Logger }
  from './logger.js';

export class NullLogger implements Logger
{
  level = 'silent';

  isLevelEnabled(
    level: string
  ): boolean
  {
    return level === 'silent';
  }

  trace(): void
  {
  }

  debug(): void
  {
  }

  information(): void
  {
  }

  warning(): void
  {
  }

  error(): void
  {
  }

  scope(): Logger
  {
    return new NullLogger();
  }
}
