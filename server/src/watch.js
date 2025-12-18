import fs from 'node:fs';

export function watchStaticTree(
  rootDir,
  onChange)
{
  // Best-effort cross-platform watcher.
  // On Windows/macOS, recursive fs.watch works.
  // On Linux, recursive is not supported, but this package is intended for dev-time usage.

  let watcher;

  try {
    watcher =
      fs.watch(
        rootDir,
        { recursive: true },
        () => onChange());
  } catch {
    watcher =
      fs.watch(
        rootDir,
        () => onChange());
  }

  return () => {
    try {
      watcher.close();
    } catch {}
  };
}
