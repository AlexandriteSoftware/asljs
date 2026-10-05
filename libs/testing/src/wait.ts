/**
 * Lets the promise callbacks already queued run: two turns of the microtask
 * queue, enough for a `then` that schedules one more.
 */
export async function flushMicrotasks(
  ): Promise<void>
{
  await Promise.resolve();
  await Promise.resolve();
}

/**
 * Resolves once `predicate` returns `true`, checking it again after every
 * timer turn, so microtasks and pending timers run in between. Rejects when
 * `timeoutMs` passes first.
 */
export async function waitFor(
    predicate: () => boolean,
    timeoutMs: number = 1000
  ): Promise<void>
{
  const started =
    Date.now();

  while (!predicate()) {
    if (
      Date.now()
      - started
      > timeoutMs
    ) {
      throw new Error(
        `Timed out after ${timeoutMs} ms waiting for the condition`);
    }

    await new Promise<void>(
      resolve =>
        setTimeout(
          resolve,
          0)
    );
  }
}
