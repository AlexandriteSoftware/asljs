import { fileURLToPath }
  from 'node:url';
import { createLogger }
  from './logging.js';

export function createTestEnvironment(
  options = { })
{
  const registry =
    { };

  const cwd =
    options.cwd
    ?? fileURLToPath(
      new URL(
        '../',
        import.meta.url));

  const environment =
    Object.assign(
      {
        cwd,
        stdout: createWritableBuffer(),
        stderr: createWritableBuffer(),
        logger: createLogger(),
        resolve: type => registry[type] ?? type,
        register: (type, value) => registry[type] = value,
        definitions: cwd
      },
      options);

  return environment;
}

function createWritableBuffer()
{
  return {
    output: '',
    write(value)
    {
      this.output += value;
    },
    toString()
    {
      return this.output;
    }
  };
}
