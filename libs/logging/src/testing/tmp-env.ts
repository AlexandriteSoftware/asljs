// Identical copies, kept in sync byte for byte:
// - libs/logging/src/testing/tmp-env.ts, for the tests of asljs-logging
//   itself, which cannot depend on asljs-testing;
// - libs/testing/src/tmp-env.ts, exported by asljs-testing.

/**
 * Environment variables set for the duration of a test.
 *
 * The constructor applies `updates` to `process.env`; `restore()`, or the end
 * of a `using` block, puts every variable it touched back as it was. An
 * `undefined` value removes the variable, and a variable that did not exist
 * before is removed again on restore rather than set to `'undefined'`.
 *
 * ```ts
 * using env =
 *   new TmpEnv({ PORT: '8080', SERVICE_PORT: undefined });
 * ```
 */
export class TmpEnv
{
  readonly #previous = new Map<string, string | undefined>();

  #restored = false;

  constructor(
    updates: Record<string, string | undefined>
  )
  {
    for (const [name, value] of Object.entries(updates)) {
      this.set(
        name,
        value);
    }
  }

  /**
   * Sets one more variable, or removes it with `undefined`. It is restored
   * with the others.
   */
  set(
    name: string,
    value: string | undefined
  ): void
  {
    if (this.#restored) {
      throw new Error(
        'TmpEnv has already been restored');
    }

    if (!this.#previous.has(name)) {
      this.#previous.set(
        name,
        process.env[name]);
    }

    assign(
      name,
      value);
  }

  /**
   * Puts the variables back. Returns `true` the first time and `false`, doing
   * nothing, after that.
   */
  restore(): boolean
  {
    if (this.#restored) {
      return false;
    }

    this.#restored = true;

    for (const [name, value] of this.#previous) {
      assign(
        name,
        value);
    }

    return true;
  }

  [Symbol.dispose](): void
  {
    this.restore();
  }
}

function assign(
    name: string,
    value: string | undefined
  ): void
{
  if (value === undefined) {
    delete process.env[name];

    return;
  }

  process.env[name] = value;
}
