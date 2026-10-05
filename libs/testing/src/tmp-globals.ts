/**
 * Properties of `globalThis` replaced for the duration of a test, such as the
 * `window` and `document` of a JSDOM instance.
 *
 * The constructor defines every entry of `values` on `globalThis`; `restore()`,
 * or the end of a `using` block, puts each property back with the descriptor it
 * had, and removes the ones that did not exist before.
 *
 * ```ts
 * const dom =
 *   new JSDOM('<!doctype html><html><body></body></html>');
 *
 * using globals =
 *   new TmpGlobals(
 *     { window: dom.window,
 *       document: dom.window.document,
 *       HTMLElement: dom.window.HTMLElement });
 * ```
 */
export class TmpGlobals
{
  readonly #previous = new Map<string, PropertyDescriptor | undefined>();

  #restored = false;

  constructor(
    values: Record<string, unknown>
  )
  {
    for (const [name, value] of Object.entries(values)) {
      this.set(
        name,
        value);
    }
  }

  /**
   * Replaces one more property. It is restored with the others.
   */
  set(
    name: string,
    value: unknown
  ): void
  {
    if (this.#restored) {
      throw new Error(
        'TmpGlobals has already been restored');
    }

    if (!this.#previous.has(name)) {
      this.#previous.set(
        name,
        Object.getOwnPropertyDescriptor(
          globalThis,
          name));
    }

    // A data property, writable and configurable, so a later set or the
    // restore can replace it even when the original was a getter.
    Object.defineProperty(
      globalThis,
      name,
      { value,
        writable: true,
        configurable: true,
        enumerable: true });
  }

  /**
   * Puts the properties back. Returns `true` the first time and `false`, doing
   * nothing, after that.
   */
  restore(): boolean
  {
    if (this.#restored) {
      return false;
    }

    this.#restored = true;

    for (const [name, descriptor] of this.#previous) {
      if (descriptor === undefined) {
        Reflect.deleteProperty(
          globalThis,
          name);

        continue;
      }

      Object.defineProperty(
        globalThis,
        name,
        descriptor);
    }

    return true;
  }

  [Symbol.dispose](): void
  {
    this.restore();
  }
}
