import { createLogger }
  from './logging.js';

/**
 * @typedef
 *   { import('./logging.js')
 *       .Logger }
 *   Logger
 * @typedef
 *   { import('./commands/update.js')
 *       .CopilotRequest }
 *   CopilotRequest
 */

/**
 * @typedef {Object} Environment
 * @property {string} cwd
 * @property {WritableBuffer} stdout
 * @property {WritableBuffer} stderr
 * @property {Logger} logger
 * @property {<T>(type: T) => T} resolve
 * @property {<T>(type: T, value: T) => void} register
 * @property {string} definitions
 * @property {string} project
 * @property {(logger: Logger,
 *             value: CopilotRequest)
 *            => Promise<string>} [runCopilotCli]
 * @property {number} [exitCode]
 */

/**
 * @param {Partial<Environment>} environment 
 * @returns Environment
 */
export function createEnvironment(
  environment = { })
{
  const cwd =
    process.cwd();

  const registry =
    new Map();

  /** @type {Environment} */
  const baseEnvironment =
    {
      cwd,
      stdout: createInMemoryWritableBuffer(),
      stderr: createInMemoryWritableBuffer(),
      logger: createLogger(),
      resolve:
        type =>
          registry.get(type)
          ?? type,
      register:
        (type, value) =>
          registry.set(
            type,
            value),
      definitions: cwd,
      project: cwd
    };

  /** @type {Environment} */
  const constructedEnvironment =
    Object.assign(
      baseEnvironment,
      environment);

  constructedEnvironment.logger.trace(
    `Environment has been created`);

  return constructedEnvironment;
}

/**
 * @typedef {Object} WritableBuffer
 * @property {(value: string) => void} write
 * @property {() => string} toString
 */

/**
 * @returns {WritableBuffer}
 */
function createInMemoryWritableBuffer()
{
  /** @type {string[]} */
  const output = [ ];

  return {
    write(value)
    {
      output.push(value);
    },
    toString()
    {
      return output.join('');
    }
  };
}
