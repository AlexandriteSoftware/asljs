/**
 * Wraps `dispose` so that it runs once, following the repository's rule for
 * idempotent operations: the first call runs it and returns `true`, every
 * later call returns `false` and does nothing.
 */
export function createDisposer(
    dispose: () => void
  ): () => boolean
{
  let active = true;

  return (): boolean =>
  {
    if (!active) {
      return false;
    }

    active = false;

    dispose();

    return true;
  };
}
